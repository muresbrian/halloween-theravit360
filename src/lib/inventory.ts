import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Libera órdenes en estado RESERVADA cuyo tiempo límite haya expirado.
 * Retorna los boletos al stock disponible atómicamente.
 */
export async function cleanupExpiredReservations() {
  const now = new Date();
  
  // Buscar órdenes cuya reserva expiró y aún no tienen comprobante subido
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "RESERVADA",
      reservationExpiresAt: {
        lt: now,
      },
    },
    include: {
      tickets: true,
    },
  });

  if (expiredOrders.length === 0) return 0;

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      // 1. Marcar orden como EXPIRADA
      await tx.order.update({
        where: { id: order.id },
        data: { status: "EXPIRADA" },
      });

      // 2. Marcar boletos como EXPIRADO
      await tx.ticket.updateMany({
        where: { orderId: order.id },
        data: { status: "EXPIRADO" },
      });

      // 3. Devolver los boletos reservados al pool del ticketType
      await tx.ticketType.update({
        where: { id: order.ticketTypeId },
        data: {
          reserved: {
            decrement: order.quantity,
          },
        },
      });

      // 4. Registrar en auditoría
      await tx.auditLog.create({
        data: {
          action: "RESERVATION_EXPIRED",
          entityType: "ORDER",
          entityId: order.id,
          orderId: order.id,
          performedBy: "SYSTEM",
          details: JSON.stringify({
            folio: order.folio,
            releasedQuantity: order.quantity,
            expiredAt: now,
          }),
        },
      });
    });
  }

  return expiredOrders.length;
}

/**
 * Consulta tipos de boletos con inventario real y actualizado.
 */
export async function getActiveTicketTypes() {
  // Limpieza previa no bloqueante
  await cleanupExpiredReservations().catch(() => {});

  const types = await prisma.ticketType.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });

  return types.map((t) => {
    const available = Math.max(0, t.quantity - (t.sold + t.reserved));
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      quantity: t.quantity,
      sold: t.sold,
      reserved: t.reserved,
      available,
      maxPerOrder: t.maxPerOrder,
      isSoldOut: available <= 0,
    };
  });
}

/**
 * Genera el siguiente folio secuencial de orden con formato HAL-2026-XXXX.
 */
async function generateNextFolio(tx: any): Promise<string> {
  const count = await tx.order.count();
  const nextSeq = (count + 1).toString().padStart(4, "0");
  return `HAL-2026-${nextSeq}`;
}

export interface ReserveOrderParams {
  ticketTypeId: string;
  quantity: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  notes?: string;
  reservationMinutes: number;
}

/**
 * Reserva boletos de forma atómica con protección estricta contra Overbooking y Race Conditions.
 */
export async function reserveOrder(params: ReserveOrderParams) {
  // Limpiar antes de validar
  await cleanupExpiredReservations().catch(() => {});

  if (params.quantity <= 0) {
    throw new Error("La cantidad debe ser al menos 1 boleto.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Obtener tipo de boleto con bloqueo de lectura
    const ticketType = await tx.ticketType.findUnique({
      where: { id: params.ticketTypeId },
    });

    if (!ticketType || !ticketType.active) {
      throw new Error("El tipo de boleto seleccionado no está disponible.");
    }

    if (params.quantity > ticketType.maxPerOrder) {
      throw new Error(`El límite máximo es de ${ticketType.maxPerOrder} boletos por orden.`);
    }

    const available = ticketType.quantity - (ticketType.sold + ticketType.reserved);
    if (available < params.quantity) {
      throw new Error(`Lo sentimos, solo quedan ${available} boletos disponibles.`);
    }

    // 2. Incrementar reservas atómicamente
    await tx.ticketType.update({
      where: { id: ticketType.id },
      data: {
        reserved: {
          increment: params.quantity,
        },
      },
    });

    // 3. Crear o actualizar cliente
    let customer = await tx.customer.findFirst({
      where: { email: params.email.trim().toLowerCase() },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          firstName: params.firstName.trim(),
          lastName: params.lastName.trim(),
          email: params.email.trim().toLowerCase(),
          phone: params.phone.trim(),
          whatsapp: params.whatsapp.trim(),
        },
      });
    } else {
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          firstName: params.firstName.trim(),
          lastName: params.lastName.trim(),
          phone: params.phone.trim(),
          whatsapp: params.whatsapp.trim(),
        },
      });
    }

    // 4. Generar Folio y Fechas
    const folio = await generateNextFolio(tx);
    const expiresAt = new Date(Date.now() + params.reservationMinutes * 60 * 1000);
    const totalAmount = ticketType.price * params.quantity;

    // 5. Crear la Orden
    const order = await tx.order.create({
      data: {
        folio,
        customerId: customer.id,
        ticketTypeId: ticketType.id,
        quantity: params.quantity,
        unitPrice: ticketType.price,
        totalAmount,
        status: "RESERVADA",
        reservationExpiresAt: expiresAt,
        notes: params.notes?.trim() || null,
      },
    });

    // 6. Crear los Boletos Individuales (Uno por cada unidad)
    const buyerFullName = `${params.firstName.trim()} ${params.lastName.trim()}`;
    const ticketsData = [];

    for (let i = 1; i <= params.quantity; i++) {
      const ticketSeq = i.toString().padStart(2, "0");
      const orderSeq = folio.replace("HAL-2026-", "");
      const ticketNumber = `HAL-TKT-${orderSeq}-${ticketSeq}`;
      
      // Token criptográfico seguro e impredecible (32 bytes hex)
      const secureToken = crypto.randomBytes(24).toString("hex");

      ticketsData.push({
        ticketNumber,
        secureToken,
        orderId: order.id,
        ticketTypeId: ticketType.id,
        attendeeName: buyerFullName, // Por defecto nombre del comprador
        attendeePhone: params.phone.trim(),
        status: "RESERVADO",
      });
    }

    await tx.ticket.createMany({
      data: ticketsData,
    });

    // 7. Auditoría
    await tx.auditLog.create({
      data: {
        action: "ORDER_CREATED",
        entityType: "ORDER",
        entityId: order.id,
        orderId: order.id,
        performedBy: "CUSTOMER",
        details: JSON.stringify({
          folio,
          quantity: params.quantity,
          totalAmount,
          expiresAt,
        }),
      },
    });

    return {
      orderId: order.id,
      folio: order.folio,
      totalAmount,
      quantity: params.quantity,
      expiresAt,
    };
  });
}
