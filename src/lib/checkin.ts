import { prisma } from "@/lib/prisma";
import { extractTokenFromScan } from "@/lib/qr";

export interface CheckInResult {
  success: boolean;
  code: "AUTHORIZED" | "ALREADY_USED" | "PAYMENT_PENDING" | "INVALID" | "CANCELLED";
  message: string;
  ticket?: {
    id: string;
    ticketNumber: string;
    attendeeName: string | null;
    attendeePhone: string | null;
    ticketTypeName: string;
    orderFolio: string;
    status: string;
  };
  checkIn?: {
    checkedInAt: Date;
    checkedInBy: string;
    method: string;
  };
}

/**
 * Valida y registra el acceso de un boleto de forma ATÓMICA.
 * Garantiza que si dos dispositivos escanean el mismo boleto al mismo milisegundo,
 * SOLO UNO obtenga 'AUTHORIZED' y el otro reciba 'ALREADY_USED'.
 */
export async function processCheckIn(params: {
  identifier: string; // Token seguro o Número de boleto (HAL-TKT-XXXX-XX)
  checkedInByUserId?: string;
  deviceInfo?: string;
  method?: "QR_CAMERA" | "MANUAL_ENTRY";
}): Promise<CheckInResult> {
  const tokenOrNumber = extractTokenFromScan(params.identifier);
  const now = new Date();
  const method = params.method || "QR_CAMERA";

  // 1. Buscar el boleto por secureToken o por ticketNumber
  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [{ secureToken: tokenOrNumber }, { ticketNumber: tokenOrNumber }],
    },
    include: {
      ticketType: true,
      order: true,
      checkIn: {
        include: {
          checkedInByUser: true,
        },
      },
    },
  });

  if (!ticket) {
    return {
      success: false,
      code: "INVALID",
      message: "Boleto no válido. El código no existe en el sistema.",
    };
  }

  // 2. Ejecutar la actualización ATÓMICA condicional (Solo si status == 'PAGADO')
  const updateResult = await prisma.ticket.updateMany({
    where: {
      id: ticket.id,
      status: "PAGADO",
    },
    data: {
      status: "UTILIZADO",
      updatedAt: now,
    },
  });

  // Si afectó exactamente 1 fila, este dispositivo ganó la validación
  if (updateResult.count === 1) {
    // Crear el registro de CheckIn
    const checkIn = await prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        checkedInAt: now,
        checkedInByUserId: params.checkedInByUserId || null,
        deviceInfo: params.deviceInfo || "Web Scanner",
        method,
      },
      include: {
        checkedInByUser: true,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: "CHECK_IN_SUCCESS",
        entityType: "TICKET",
        entityId: ticket.id,
        orderId: ticket.orderId,
        performedBy: params.checkedInByUserId || null,
        details: JSON.stringify({
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.attendeeName,
          method,
          time: now,
        }),
      },
    });

    return {
      success: true,
      code: "AUTHORIZED",
      message: "ACCESO AUTORIZADO",
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        attendeePhone: ticket.attendeePhone,
        ticketTypeName: ticket.ticketType.name,
        orderFolio: ticket.order.folio,
        status: "UTILIZADO",
      },
      checkIn: {
        checkedInAt: checkIn.checkedInAt,
        checkedInBy: checkIn.checkedInByUser?.name || "Staff en puerta",
        method: checkIn.method,
      },
    };
  }

  // Si count === 0, investigar el motivo exacto del rechazo
  // Re-consultar el estado fresco del boleto
  const freshTicket = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: {
      ticketType: true,
      order: true,
      checkIn: {
        include: {
          checkedInByUser: true,
        },
      },
    },
  });

  if (!freshTicket) {
    return {
      success: false,
      code: "INVALID",
      message: "Boleto no encontrado.",
    };
  }

  if (freshTicket.status === "UTILIZADO") {
    const prev = freshTicket.checkIn;
    const dateFormatted = prev ? new Date(prev.checkedInAt).toLocaleTimeString("es-MX") : "Previamente";
    return {
      success: false,
      code: "ALREADY_USED",
      message: `BOLETO YA UTILIZADO. Acceso registrado a las ${dateFormatted} por ${prev?.checkedInByUser?.name || "Staff"}.`,
      ticket: {
        id: freshTicket.id,
        ticketNumber: freshTicket.ticketNumber,
        attendeeName: freshTicket.attendeeName,
        attendeePhone: freshTicket.attendeePhone,
        ticketTypeName: freshTicket.ticketType.name,
        orderFolio: freshTicket.order.folio,
        status: "UTILIZADO",
      },
      checkIn: prev
        ? {
            checkedInAt: prev.checkedInAt,
            checkedInBy: prev.checkedInByUser?.name || "Staff",
            method: prev.method,
          }
        : undefined,
    };
  }

  if (freshTicket.status === "RESERVADO" || freshTicket.status === "PAGO_PENDIENTE") {
    return {
      success: false,
      code: "PAYMENT_PENDING",
      message: "PAGO NO CONFIRMADO. Este boleto aún no ha sido validado por el administrador.",
      ticket: {
        id: freshTicket.id,
        ticketNumber: freshTicket.ticketNumber,
        attendeeName: freshTicket.attendeeName,
        attendeePhone: freshTicket.attendeePhone,
        ticketTypeName: freshTicket.ticketType.name,
        orderFolio: freshTicket.order.folio,
        status: freshTicket.status,
      },
    };
  }

  return {
    success: false,
    code: "CANCELLED",
    message: `Boleto no válido. Estado actual: ${freshTicket.status}.`,
    ticket: {
      id: freshTicket.id,
      ticketNumber: freshTicket.ticketNumber,
      attendeeName: freshTicket.attendeeName,
      attendeePhone: freshTicket.attendeePhone,
      ticketTypeName: freshTicket.ticketType.name,
      orderFolio: freshTicket.order.folio,
      status: freshTicket.status,
    },
  };
}
