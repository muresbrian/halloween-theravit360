/**
 * Cliente de integración entre Next.js y Google Apps Script.
 * Si GOOGLE_APPS_SCRIPT_URL está configurado, despacha a la Web App de Apps Script.
 * Si no está configurado, utiliza un almacén local en memoria para desarrollo y pruebas continuas.
 */

import { getRandomTemplateIndex, resolveTicketTemplate } from "@/lib/ticket-templates";

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const SCRIPT_SECRET = process.env.SCRIPT_SECRET_KEY || "";

export async function callAppsScript(action: string, payload: Record<string, any> = {}): Promise<any> {
  // Si hay URL real de Apps Script configurada, conectar directamente
  if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.startsWith("https://script.google.com")) {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          secretKey: SCRIPT_SECRET,
          ...payload,
        }),
        redirect: "follow",
        cache: "no-store",
      });

      const data = await response.json();

      // Fallback transparente si la versión de Apps Script desplegada aún no tiene lookupOrders
      if (action === "lookupOrders" && (!data.success && (data.error === "Acción no soportada." || data.error?.includes("Acción")))) {
        return await fallbackLookupOrders(payload);
      }

      return data;
    } catch (error: any) {
      if (action === "lookupOrders") {
        return await fallbackLookupOrders(payload);
      }
      console.error(`Error llamando a Apps Script [action=${action}]:`, error);
      return { success: false, error: "Error de conexión con Google Apps Script: " + error.message };
    }
  }

  // Fallback: Mock Store Local en memoria para desarrollo inmediato sin bloqueos
  return mockAppsScriptEngine(action, payload);
}

/**
 * Fallback de búsqueda de órdenes que consulta los registros en Google Sheets
 * en caso de que la Web App aún no haya implementado la acción nativa lookupOrders.
 */
async function fallbackLookupOrders(payload: Record<string, any>): Promise<any> {
  const folioQuery = (payload.folio || "").trim().toUpperCase();
  const rawQuery = (payload.query || "").trim().toLowerCase();
  const cleanDigits = rawQuery.replace(/[^0-9]/g, "");

  try {
    const ordersRes = await callAppsScript("getAdminOrders");
    if (!ordersRes || !ordersRes.success || !ordersRes.orders) {
      return { success: false, error: "No fue posible consultar las órdenes." };
    }

    const ticketsRes = await callAppsScript("getAdminTickets");
    const allTickets: any[] = (ticketsRes && ticketsRes.tickets) || [];

    const matchedOrders: any[] = [];
    const matchedOrderIds = new Set<string>();

    for (const ord of ordersRes.orders) {
      let isMatch = false;

      // 1. Coincidencia directa por folio
      if (folioQuery && ord.folio && ord.folio.toUpperCase().includes(folioQuery)) {
        isMatch = true;
      }

      // 2. Coincidencia por teléfono en boletos
      if (!isMatch && cleanDigits.length >= 7) {
        const ordTickets = allTickets.filter((t: any) => t.orderId === ord.orderId);
        for (const tkt of ordTickets) {
          const tPhone = String(tkt.attendeePhone || "").replace(/[^0-9]/g, "");
          if (tPhone && tPhone.includes(cleanDigits)) {
            isMatch = true;
            break;
          }
        }
      }

      // 3. Coincidencia por correo, nombre o teléfono consultando el pedido individual
      if (!isMatch && rawQuery && ord.orderAccessToken) {
        try {
          const single = await callAppsScript("getOrder", { orderAccessToken: ord.orderAccessToken });
          if (single && single.success && single.order && single.order.customer) {
            const cust = single.order.customer;
            const email = (cust.email || "").toLowerCase();
            const name = (cust.name || "").toLowerCase();
            const phone = String(cust.phone || "").replace(/[^0-9]/g, "");

            if (email && email.includes(rawQuery)) {
              isMatch = true;
            } else if (cleanDigits.length >= 7 && phone && phone.includes(cleanDigits)) {
              isMatch = true;
            } else if (name && name.includes(rawQuery)) {
              isMatch = true;
            }
          }
        } catch {
          // continuar con siguiente orden
        }
      }

      if (isMatch && !matchedOrderIds.has(ord.orderId)) {
        matchedOrderIds.add(ord.orderId);

        const isPaid = ord.status === "PAGADA";
        const storedClaimCode = (ord.claimCode || "").trim().toUpperCase();
        const providedClaimCode = (payload.claimCode || "").trim().toUpperCase();
        const isUnlocked = !isPaid || !storedClaimCode || (providedClaimCode && providedClaimCode === storedClaimCode);
        const requiresClaimCode = isPaid && Boolean(storedClaimCode) && !isUnlocked;

        const ordTickets = allTickets
          .filter((t: any) => t.orderId === ord.orderId)
          .map((t: any) => ({
            ticketNumber: t.ticketNumber,
            secureToken: isUnlocked ? t.secureToken : "",
            attendeeName: t.attendeeName || "Invitado",
            status: t.status,
            templateIndex: t.templateIndex || resolveTicketTemplate(t).id,
          }));

        matchedOrders.push({
          folio: ord.folio,
          orderAccessToken: ord.orderAccessToken,
          quantity: Number(ord.quantity),
          totalAmount: Number(ord.totalAmount),
          status: ord.status,
          createdAt: ord.createdAt,
          unlocked: isUnlocked,
          requiresClaimCode: requiresClaimCode,
          tickets: ordTickets,
        });
      }
    }

    return {
      success: true,
      orders: matchedOrders,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al buscar órdenes" };
  }
}

// ============================================================================
// STORE LOCAL EN MEMORIA (Simula el comportamiento exacto de Google Sheets)
// ============================================================================

interface MockDb {
  config: Record<string, any>;
  ticketTypes: Array<any>;
  customers: Array<any>;
  orders: Array<any>;
  tickets: Array<any>;
  payments: Array<any>;
  checkIns: Array<any>;
  admins: Array<any>;
  auditLog: Array<any>;
}

const globalForMock = global as unknown as { mockDb: MockDb };

if (!globalForMock.mockDb) {
  globalForMock.mockDb = {
    config: {
      eventName: "HALLOWEEN THERAVIT360 2026",
      eventSubtitle: "La Noche Más Oscura y Exclusiva",
      eventDescription: "Experiencia de terror inmersivo de alta gama con DJs estelares, mixología premium y concurso de disfraces con premios exclusivos.",
      eventDate: "31 de Octubre, 2026",
      eventTime: "20:00 - 04:00 hrs",
      eventLocation: "Theravit 360°",
      eventAddress: "Calle Pte. 128 191, Lindavista Vallejo III Secc, Gustavo A. Madero, 07750 Ciudad de México, CDMX",
      eventMapUrl: "https://maps.app.goo.gl/77H3QkF9ZfhtC4WB9",
      eventMinAge: "18+",
      eventDressCode: "Disfraz Temático Obligatorio / Elegante Oscuro",
      eventRules: "• Identificación oficial obligatoria.\n• Cero tolerancia a sustancias ilícitas.\n• Cada boleto es de un solo acceso.\n• No reingreso.",
      bankName: "BBVA Bancomer",
      bankHolder: "Theravit360 Eventos S.A. de C.V.",
      bankClabe: "012180001234567890",
      bankAccount: "0123456789",
      transferInstructions: "Es indispensable colocar tu FOLIO de orden como concepto de pago para validar tu transferencia.",
      reservationDurationMinutes: "15",
      contactWhatsApp: "+52 55 1234 5678",
      contactEmail: "boletos@theravit360.com",
    },
    ticketTypes: [
      {
        id: "TT-GEN",
        name: "GENERAL PASS",
        description: "Acceso general al evento, pista de baile y concurso de disfraces.",
        price: 500,
        quantity: 200,
        sold: 0,
        reserved: 0,
        active: true,
        maxPerOrder: 10,
      },
      {
        id: "TT-VIP",
        name: "VIP MANSION PASS",
        description: "Acceso preferencial sin fila, barra libre de mixología 20:00 a 22:00 y zona lounge.",
        price: 900,
        quantity: 50,
        sold: 0,
        reserved: 0,
        active: true,
        maxPerOrder: 6,
      },
    ],
    customers: [],
    orders: [],
    tickets: [],
    payments: [],
    checkIns: [],
    admins: [
      {
        adminId: "ADM-000",
        email: "superadmin@theravit360.com",
        passwordHash: "SuperAdminHalloween2026!",
        name: "Super Administrador General",
        role: "SUPERADMIN",
        active: true,
      },
      {
        adminId: "ADM-001",
        email: "admin@theravit360.com",
        passwordHash: "AdminHalloween2026!",
        name: "Administrador Principal",
        role: "ADMIN",
        active: true,
      },
      {
        adminId: "ADM-002",
        email: "puerta@theravit360.com",
        passwordHash: "Puerta2026!",
        name: "Staff de Puerta (Scanner)",
        role: "SCANNER",
        active: true,
      },
    ],
    auditLog: [],
  };
}

// Garantizar que superadmin exista incluso tras hot-reload
if (!globalForMock.mockDb.admins.some((a) => a.role === "SUPERADMIN")) {
  globalForMock.mockDb.admins.unshift({
    adminId: "ADM-000",
    email: "superadmin@theravit360.com",
    passwordHash: "SuperAdminHalloween2026!",
    name: "Super Administrador General",
    role: "SUPERADMIN",
    active: true,
  });
}

const db = globalForMock.mockDb;

function generateToken(len = 32): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let res = "";
  for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

function cleanupExpiredOrdersLocal() {
  const now = Date.now();
  for (const ord of db.orders) {
    if (ord.status === "RESERVADA" && now > new Date(ord.reservationExpiresAt).getTime()) {
      ord.status = "EXPIRADA";
      ord.updatedAt = new Date().toISOString();
      for (const t of db.tickets) {
        if (t.orderId === ord.orderId) {
          t.status = "EXPIRADO";
          t.updatedAt = new Date().toISOString();
        }
      }
      const tt = db.ticketTypes.find((x) => x.id === ord.ticketTypeId);
      if (tt) {
        tt.reserved = Math.max(0, tt.reserved - ord.quantity);
      }
    }
  }
}

async function mockAppsScriptEngine(action: string, payload: Record<string, any>) {
  cleanupExpiredOrdersLocal();

  switch (action) {
    case "getConfig": {
      const ticketTypes = db.ticketTypes
        .filter((t) => t.active)
        .map((t) => {
          const available = Math.max(0, t.quantity - (t.sold + t.reserved));
          return {
            ...t,
            available,
            isSoldOut: available <= 0,
          };
        });
      return { success: true, config: db.config, ticketTypes };
    }

    case "reserveOrder": {
      const targetType = db.ticketTypes.find((t) => t.id === payload.ticketTypeId);
      if (!targetType || !targetType.active) {
        return { success: false, error: "Tipo de boleto no disponible." };
      }

      const qty = Number(payload.quantity);
      const available = targetType.quantity - (targetType.sold + targetType.reserved);
      if (available < qty) {
        return { success: false, error: `Lo sentimos, solo quedan ${available} boletos disponibles.` };
      }

      // Customer
      let cus = db.customers.find((c) => c.email.toLowerCase() === payload.email.trim().toLowerCase());
      if (!cus) {
        cus = {
          customerId: "CUS-" + generateToken(8),
          name: payload.name,
          email: payload.email.trim().toLowerCase(),
          phone: payload.phone,
        };
        db.customers.push(cus);
      }

      const seq = ("0000" + (db.orders.length + 1)).slice(-4);
      const folio = `HAL-2026-${seq}`;
      const orderId = "ORD-" + generateToken(12);
      const orderAccessToken = generateToken(32);
      const minutes = Number(db.config.reservationDurationMinutes || 15);
      const expiresAt = new Date(Date.now() + minutes * 60000).toISOString();
      const totalAmount = targetType.price * qty;

      db.orders.push({
        orderId,
        folio,
        orderAccessToken,
        customerId: cus.customerId,
        ticketTypeId: targetType.id,
        quantity: qty,
        unitPrice: targetType.price,
        totalAmount,
        status: "RESERVADA",
        reservationExpiresAt: expiresAt,
        notes: payload.notes || "",
        createdAt: new Date().toISOString(),
      });

      targetType.reserved += qty;

      const createdTickets = [];
      for (let i = 1; i <= qty; i++) {
        const ticketSeq = ("0" + i).slice(-2);
        const ticketNumber = `HAL-${seq}-${ticketSeq}`;
        const secureToken = generateToken(32);
        const ticketId = "TKT-" + generateToken(12);
        const templateIndex = getRandomTemplateIndex();

        const ticketObj = {
          ticketId,
          ticketNumber,
          orderId,
          ticketTypeId: targetType.id,
          secureToken,
          attendeeName: payload.name,
          attendeePhone: payload.phone,
          templateIndex,
          status: "RESERVADO",
          createdAt: new Date().toISOString(),
          usedAt: null,
          usedBy: null,
          revokedAt: null,
        };
        db.tickets.push(ticketObj);
        createdTickets.push({ ticketNumber, secureToken, templateIndex });
      }

      return {
        success: true,
        folio,
        orderAccessToken,
        totalAmount,
        quantity: qty,
        expiresAt,
        tickets: createdTickets,
      };
    }

    case "getOrder": {
      const ord = db.orders.find((o) => o.orderAccessToken === payload.orderAccessToken);
      if (!ord) return { success: false, error: "Orden no encontrada." };

      const customer = db.customers.find((c) => c.customerId === ord.customerId);
      const ticketType = db.ticketTypes.find((t) => t.id === ord.ticketTypeId);
      const tickets = db.tickets
        .filter((t) => t.orderId === ord.orderId)
        .map((t) => ({
          ...t,
          templateIndex: t.templateIndex || resolveTicketTemplate(t).id,
        }));
      const payment = db.payments.find((p) => p.orderId === ord.orderId);

      return {
        success: true,
        order: {
          ...ord,
          customer,
          ticketType,
          tickets,
          payment,
        },
        bankInfo: {
          bankName: db.config.bankName,
          bankHolder: db.config.bankHolder,
          bankClabe: db.config.bankClabe,
          bankAccount: db.config.bankAccount,
          instructions: db.config.transferInstructions,
        },
      };
    }

    case "uploadReceipt": {
      const ord = db.orders.find((o) => o.orderAccessToken === payload.orderAccessToken);
      if (!ord) return { success: false, error: "Orden no encontrada." };
      if (ord.status === "PAGADA") return { success: false, error: "Esta orden ya se encuentra confirmada." };
      if (ord.status === "EXPIRADA" || ord.status === "CANCELADA") {
        return { success: false, error: `No es posible subir comprobante a una orden ${ord.status}.` };
      }

      const receiptUrl = payload.receiptUrl || `/uploads/receipts/mock_${ord.folio}_${Date.now()}.jpg`;
      db.payments.push({
        paymentId: "PAY-" + generateToken(10),
        orderId: ord.orderId,
        amount: ord.totalAmount,
        method: "TRANSFERENCIA",
        receiptDriveFileId: "drive_mock_id_" + generateToken(8),
        receiptUrl,
        status: "PENDIENTE",
        uploadedAt: new Date().toISOString(),
      });

      ord.status = "COMPROBANTE_RECIBIDO";
      ord.updatedAt = new Date().toISOString();

      for (const t of db.tickets) {
        if (t.orderId === ord.orderId) {
          t.status = "PAGO_PENDIENTE";
          t.updatedAt = new Date().toISOString();
        }
      }

      return {
        success: true,
        message: "Comprobante subido exitosamente. El administrador validará tu transferencia.",
        receiptUrl,
      };
    }

    case "getTicket": {
      const tkt = db.tickets.find((t) => t.secureToken === payload.secureToken);
      if (!tkt) return { success: false, error: "Boleto no encontrado." };
      const ticketType = db.ticketTypes.find((tt) => tt.id === tkt.ticketTypeId);

      return {
        success: true,
        ticket: {
          ...tkt,
          ticketTypeName: ticketType ? ticketType.name : "GENERAL",
          templateIndex: tkt.templateIndex || resolveTicketTemplate(tkt).id,
        },
        event: {
          name: db.config.eventName,
          date: db.config.eventDate,
          time: db.config.eventTime,
          location: db.config.eventLocation,
          address: db.config.eventAddress,
          rules: db.config.eventRules,
        },
      };
    }

    case "lookupOrders": {
      const folioQuery = (payload.folio || "").trim().toUpperCase();
      const rawQuery = (payload.query || "").trim().toLowerCase();
      const cleanDigits = rawQuery.replace(/[^0-9]/g, "");

      const matchedOrders: any[] = [];
      for (const ord of db.orders) {
        const cust = db.customers.find((c) => c.customerId === ord.customerId);
        let match = false;
        if (folioQuery && ord.folio && ord.folio.toUpperCase().includes(folioQuery)) {
          match = true;
        }
        if (!match && rawQuery && cust) {
          const email = (cust.email || "").toLowerCase();
          const phone = String(cust.phone || "").replace(/[^0-9]/g, "");
          if (email && email.includes(rawQuery)) match = true;
          else if (cleanDigits.length >= 7 && phone && phone.includes(cleanDigits)) match = true;
          else if (cust.name && cust.name.toLowerCase().includes(rawQuery)) match = true;
        }

        if (match) {
          const ordTickets = db.tickets
            .filter((t) => t.orderId === ord.orderId)
            .map((t) => ({
              ticketNumber: t.ticketNumber,
              secureToken: t.secureToken,
              attendeeName: t.attendeeName || "Invitado",
              status: t.status,
              templateIndex: t.templateIndex || resolveTicketTemplate(t).id,
            }));

          matchedOrders.push({
            folio: ord.folio,
            orderAccessToken: ord.orderAccessToken,
            quantity: ord.quantity,
            totalAmount: ord.totalAmount,
            status: ord.status,
            createdAt: ord.createdAt,
            tickets: ordTickets,
          });
        }
      }
      return { success: true, orders: matchedOrders };
    }

    case "updateAttendee": {
      const tkt = db.tickets.find((t) => t.secureToken === payload.secureToken);
      if (!tkt) return { success: false, error: "Boleto no encontrado." };
      if (payload.attendeeName) tkt.attendeeName = payload.attendeeName;
      if (payload.attendeePhone) tkt.attendeePhone = payload.attendeePhone;
      tkt.updatedAt = new Date().toISOString();
      return { success: true, message: "Asistente asignado con éxito." };
    }

    case "checkInScan": {
      const token = (payload.secureToken || payload.code || "").trim();
      const tkt = db.tickets.find((t) => t.secureToken === token || t.ticketNumber === token);
      if (!tkt) {
        return { success: false, code: "INVALID", message: "✕ CÓDIGO NO VÁLIDO. No existe en el sistema." };
      }

      if (tkt.revokedAt) {
        return { success: false, code: "REVOKED", message: "✕ BOLETO REVOCADO. Este código fue reemitido." };
      }

      if (tkt.status === "UTILIZADO") {
        const time = tkt.usedAt ? new Date(tkt.usedAt).toLocaleTimeString() : "Previamente";
        return {
          success: false,
          code: "ALREADY_USED",
          message: `⚠ TICKET YA UTILIZADO a las ${time} por ${tkt.usedBy || "Staff"}`,
          ticket: tkt,
        };
      }

      if (tkt.status !== "PAGADO") {
        return {
          success: false,
          code: "NOT_PAID",
          message: `✕ ACCESO NO AUTORIZADO. El boleto está en estado: ${tkt.status}`,
          ticket: tkt,
        };
      }

      // Check-in exitoso
      const nowIso = new Date().toISOString();
      const operator = payload.operatorName || "Staff Puerta";
      tkt.status = "UTILIZADO";
      tkt.usedAt = nowIso;
      tkt.usedBy = operator;

      db.checkIns.push({
        checkInId: "CHK-" + generateToken(10),
        ticketId: tkt.ticketId,
        checkedInAt: nowIso,
        checkedInBy: operator,
        deviceInfo: payload.deviceInfo || "Web Scanner",
        method: payload.method || "QR_CAMERA",
      });

      const tt = db.ticketTypes.find((x) => x.id === tkt.ticketTypeId);
      return {
        success: true,
        code: "AUTHORIZED",
        message: "✓ ACCESO AUTORIZADO",
        ticket: {
          ticketNumber: tkt.ticketNumber,
          attendeeName: tkt.attendeeName,
          ticketTypeName: tt ? tt.name : "GENERAL",
          usedAt: nowIso,
        },
      };
    }

    case "adminLogin": {
      const email = (payload.email || "").trim().toLowerCase();
      const pass = payload.password || "";
      const adm = db.admins.find((a) => a.email.toLowerCase() === email && a.passwordHash === pass);
      if (adm && adm.active) {
        return {
          success: true,
          admin: {
            adminId: adm.adminId,
            email: adm.email,
            name: adm.name,
            role: adm.role,
          },
        };
      }
      return { success: false, error: "Credenciales incorrectas o usuario inactivo." };
    }

    case "getDashboardStats": {
      let totalQty = 0;
      for (const tt of db.ticketTypes) totalQty += tt.quantity;

      let sold = 0;
      let reserved = 0;
      let used = 0;
      let pendingEntrance = 0;

      for (const t of db.tickets) {
        if (t.status === "PAGADO" || t.status === "UTILIZADO") sold++;
        if (t.status === "RESERVADO" || t.status === "PAGO_PENDIENTE") reserved++;
        if (t.status === "UTILIZADO") used++;
        if (t.status === "PAGADO") pendingEntrance++;
      }

      const available = Math.max(0, totalQty - (sold + reserved));
      let confirmedIncome = 0;
      for (const o of db.orders) {
        if (o.status === "PAGADA") confirmedIncome += Number(o.totalAmount || 0);
      }

      const pendingReceipts = db.payments.filter((p) => p.status === "PENDIENTE").length;
      const recentCheckIns = [...db.checkIns].reverse().slice(0, 10);

      return {
        success: true,
        stats: {
          totalQuantity: totalQty,
          sold,
          reserved,
          available,
          used,
          pendingEntrance,
          pendingReceipts,
          confirmedIncome,
          recentCheckIns,
        },
      };
    }

    case "reviewPayment": {
      const ord = db.orders.find((o) => o.orderId === payload.orderId);
      if (!ord) return { success: false, error: "Orden no encontrada." };
      const pay = db.payments.find((p) => p.orderId === ord.orderId);
      const tt = db.ticketTypes.find((x) => x.id === ord.ticketTypeId);
      const reviewer = payload.reviewerName || "Admin";

      if (payload.decision === "APPROVE") {
        const claimCode = ord.claimCode || "THV-" + generateToken(6).toUpperCase();
        ord.claimCode = claimCode;
        ord.status = "PAGADA";
        ord.updatedAt = new Date().toISOString();
        for (const t of db.tickets) {
          if (t.orderId === ord.orderId) {
            t.status = "PAGADO";
            t.updatedAt = new Date().toISOString();
          }
        }
        if (tt) {
          tt.reserved = Math.max(0, tt.reserved - ord.quantity);
          tt.sold += ord.quantity;
        }
        if (pay) {
          pay.status = "APROBADO";
          pay.reviewedAt = new Date().toISOString();
          pay.reviewedBy = reviewer;
        }
        return { success: true, message: `Pago aprobado. Código generado: ${claimCode}`, claimCode };
      } else {
        ord.status = "RECHAZADA";
        ord.updatedAt = new Date().toISOString();
        for (const t of db.tickets) {
          if (t.orderId === ord.orderId) {
            t.status = "CANCELADO";
            t.updatedAt = new Date().toISOString();
          }
        }
        if (tt) {
          tt.reserved = Math.max(0, tt.reserved - ord.quantity);
        }
        if (pay) {
          pay.status = "RECHAZADO";
          pay.reviewedAt = new Date().toISOString();
          pay.reviewedBy = reviewer;
          pay.rejectionReason = payload.rejectionReason || "Comprobante rechazado";
        }
        return { success: true, message: "Pago rechazado e inventario liberado." };
      }
    }

    case "reconcileInventory": {
      const results = [];
      for (const tt of db.ticketTypes) {
        let realSold = 0;
        let realRes = 0;
        for (const t of db.tickets) {
          if (t.ticketTypeId === tt.id) {
            if (t.status === "PAGADO" || t.status === "UTILIZADO") realSold++;
            if (t.status === "RESERVADO" || t.status === "PAGO_PENDIENTE") realRes++;
          }
        }
        const prevSold = tt.sold;
        const prevRes = tt.reserved;
        tt.sold = realSold;
        tt.reserved = realRes;
        results.push({
          name: tt.name,
          prevSold,
          realSold,
          prevReserved: prevRes,
          realReserved: realRes,
          adjusted: prevSold !== realSold || prevRes !== realRes,
        });
      }
      return { success: true, reconciliation: results };
    }

    case "regenerateToken": {
      const tkt = db.tickets.find((t) => t.ticketId === payload.ticketId || t.ticketNumber === payload.ticketNumber);
      if (!tkt) return { success: false, error: "Boleto no encontrado." };
      const newToken = generateToken(32);
      tkt.secureToken = newToken;
      tkt.updatedAt = new Date().toISOString();
      return { success: true, message: "Código QR regenerado con éxito.", newSecureToken: newToken };
    }

    case "getAdminOrders": {
      return {
        success: true,
        orders: [...db.orders].reverse(),
        payments: db.payments,
        customers: db.customers,
      };
    }

    case "getAdminTickets": {
      const ticketsWithTemplates = db.tickets.map((t) => ({
        ...t,
        templateIndex: t.templateIndex || resolveTicketTemplate(t).id,
      }));
      return {
        success: true,
        tickets: [...ticketsWithTemplates].reverse(),
        ticketTypes: db.ticketTypes,
      };
    }

    case "getAuditLogs": {
      return {
        success: true,
        logs: [...db.auditLog].reverse(),
      };
    }

    case "lookupOrders": {
      const cleanFolio = (payload.folio || "").trim().toUpperCase();
      const cleanQuery = (payload.query || "").trim().toLowerCase();
      const providedClaimCode = (payload.claimCode || "").trim().toUpperCase();

      let matchedOrders = db.orders;
      if (cleanFolio) {
        matchedOrders = matchedOrders.filter((o) => o.folio.toUpperCase() === cleanFolio);
      }
      if (cleanQuery) {
        const matchingCustomers = db.customers.filter(
          (c) =>
            c.email.toLowerCase().includes(cleanQuery) ||
            c.phone.includes(cleanQuery)
        );
        const cusIds = matchingCustomers.map((c) => c.customerId);
        matchedOrders = matchedOrders.filter((o) => cusIds.includes(o.customerId));
      }

      const results = matchedOrders.map((o) => {
        const cus = db.customers.find((c) => c.customerId === o.customerId);
        const tt = db.ticketTypes.find((t) => t.id === o.ticketTypeId);
        const isPaid = o.status === "PAGADA";
        const storedClaimCode = (o.claimCode || "").trim().toUpperCase();
        const isUnlocked = !isPaid || !storedClaimCode || (providedClaimCode && providedClaimCode === storedClaimCode);
        const requiresClaimCode = isPaid && Boolean(storedClaimCode) && !isUnlocked;

        const tkts = db.tickets
          .filter((t) => t.orderId === o.orderId)
          .map((t) => ({
            ...t,
            secureToken: isUnlocked ? t.secureToken : "",
            templateIndex: t.templateIndex || resolveTicketTemplate(t).id,
          }));
        return {
          folio: o.folio,
          orderAccessToken: o.orderAccessToken,
          status: o.status,
          quantity: o.quantity,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt,
          customerName: cus ? cus.name : "",
          ticketTypeName: tt ? tt.name : "GENERAL",
          unlocked: isUnlocked,
          requiresClaimCode: requiresClaimCode,
          tickets: tkts,
        };
      });

      return { success: true, orders: results };
    }

    case "validateClaimCode": {
      const cleanFolio = (payload.folio || "").trim().toUpperCase();
      const code = (payload.claimCode || "").trim().toUpperCase();
      const ord = db.orders.find((o) => o.folio.toUpperCase() === cleanFolio);
      if (!ord) return { success: false, error: "Orden no encontrada." };
      const stored = (ord.claimCode || "").trim().toUpperCase();
      if (!stored || stored !== code) {
        return { success: false, error: "Código alfanumérico no válido o no corresponde a esta orden." };
      }
      const tkts = db.tickets
        .filter((t) => t.orderId === ord.orderId)
        .map((t) => ({
          ...t,
          templateIndex: t.templateIndex || resolveTicketTemplate(t).id,
        }));
      return {
        success: true,
        unlocked: true,
        folio: ord.folio,
        orderAccessToken: ord.orderAccessToken,
        tickets: tkts,
      };
    }

    case "getAdminConfig": {
      return {
        success: true,
        config: db.config,
        ticketTypes: db.ticketTypes,
      };
    }

    case "updateConfig": {
      const updates = payload.config || {};
      for (const key of Object.keys(updates)) {
        if (updates[key] !== undefined) {
          db.config[key] = String(updates[key]);
        }
      }
      db.auditLog.push({
        logId: "LOG-" + generateToken(12),
        timestamp: new Date().toISOString(),
        actor: payload.actor || "SUPERADMIN",
        action: "CONFIG_UPDATED",
        entity: "CONFIG",
        entityId: "GENERAL",
        details: JSON.stringify(updates),
      });
      return { success: true, message: "Configuración actualizada correctamente.", config: db.config };
    }

    case "updateTicketTypes": {
      const incomingTypes = payload.ticketTypes;
      if (!Array.isArray(incomingTypes)) {
        return { success: false, error: "Formato inválido de tipos de boletos." };
      }
      for (const incoming of incomingTypes) {
        const existing = db.ticketTypes.find((t) => t.id === incoming.id);
        if (existing) {
          if (incoming.name !== undefined) existing.name = String(incoming.name);
          if (incoming.description !== undefined) existing.description = String(incoming.description);
          if (incoming.price !== undefined) existing.price = Math.max(0, Number(incoming.price));
          if (incoming.quantity !== undefined) existing.quantity = Math.max(0, Number(incoming.quantity));
          if (incoming.maxPerOrder !== undefined) existing.maxPerOrder = Math.max(1, Number(incoming.maxPerOrder));
          if (incoming.active !== undefined) existing.active = Boolean(incoming.active);
        } else if (incoming.name && incoming.price !== undefined) {
          const newId = incoming.id || "TT-" + generateToken(6).toUpperCase();
          db.ticketTypes.push({
            id: newId,
            name: String(incoming.name),
            description: String(incoming.description || ""),
            price: Math.max(0, Number(incoming.price)),
            quantity: Math.max(0, Number(incoming.quantity || 100)),
            sold: 0,
            reserved: 0,
            active: incoming.active !== false,
            maxPerOrder: Math.max(1, Number(incoming.maxPerOrder || 10)),
          });
        }
      }
      db.auditLog.push({
        logId: "LOG-" + generateToken(12),
        timestamp: new Date().toISOString(),
        actor: payload.actor || "SUPERADMIN",
        action: "TICKET_TYPES_UPDATED",
        entity: "TICKET_TYPES",
        entityId: "ALL",
        details: JSON.stringify(incomingTypes),
      });
      return { success: true, message: "Precios y aforos de boletos actualizados.", ticketTypes: db.ticketTypes };
    }

    default:
      return { success: false, error: "Acción no reconocida en motor local: " + action };
  }
}
