/**
 * ============================================================================
 * 🎃 HALLOWEEN THERAVIT360 2026 - GOOGLE APPS SCRIPT BACKEND
 * ============================================================================
 * 
 * Este script actúa como el motor transaccional completo del sistema,
 * utilizando Google Sheets como base de datos y Google Drive para almacenamiento.
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. En Google Drive, crea una nueva hoja de cálculo llamada "Halloween_Theravit360_2026_DB".
 * 2. Ve a Extensiones > Apps Script.
 * 3. Borra el código existente y pega TODO el contenido de este archivo.
 * 4. Selecciona y ejecuta la función "setupHalloweenDatabase" una sola vez para inicializar
 *    todas las hojas, encabezados, configuración y usuario administrador.
 * 5. Haz clic en "Implementar" > "Nueva implementación".
 * 6. Tipo: "Aplicación web".
 * 7. Ejecutar como: "Yo (tu correo)".
 * 8. Quién tiene acceso: "Cualquier persona" (Anyone).
 * 9. Copia la URL generada y colócala en GOOGLE_APPS_SCRIPT_URL de tu archivo .env.local.
 */

// Clave secreta compartida con Next.js
var SCRIPT_SECRET_KEY = "theravit360_halloween_secret_key_2026";

// Nombre de la carpeta principal en Google Drive
var DRIVE_FOLDER_NAME = "Halloween Theravit360 2026 - Comprobantes";

// ============================================================================
// 1. SETUP INICIAL DE LA BASE DE DATOS
// ============================================================================

function setupHalloweenDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheets = {
    "CONFIG": [
      ["key", "value", "category", "description", "updatedAt"],
      ["eventName", "HALLOWEEN THERAVIT360 2026", "event", "Nombre oficial del evento", new Date()],
      ["eventSubtitle", "La Fiesta Más Oscura y Exclusiva", "event", "Subtítulo descriptivo", new Date()],
      ["eventDescription", "Experiencia de terror inmersivo de alta gama con DJs estelares, mixología premium y concurso de disfraces con premios exclusivos.", "event", "Descripción general", new Date()],
      ["eventDate", "31 de Octubre, 2026", "event", "Fecha visible", new Date()],
      ["eventTime", "20:00 - 04:00 hrs", "event", "Horario", new Date()],
      ["eventLocation", "Mansión Theravit Club & Garden", "event", "Nombre del recinto", new Date()],
      ["eventAddress", "Av. Las Ánimas #666, Zona Metropolitana", "event", "Dirección física", new Date()],
      ["eventMinAge", "18+", "event", "Edad mínima de acceso", new Date()],
      ["eventDressCode", "Disfraz Temático Obligatorio / Elegante Oscuro", "event", "Código de vestimenta", new Date()],
      ["eventRules", "• Identificación oficial obligatoria.\n• Cero tolerancia a sustancias ilícitas.\n• Cada boleto es de un solo acceso.\n• No reingreso.", "event", "Reglamento", new Date()],
      ["bankName", "BBVA Bancomer", "bank", "Banco para transferencias", new Date()],
      ["bankHolder", "Theravit360 Eventos S.A. de C.V.", "bank", "Titular de la cuenta", new Date()],
      ["bankClabe", "012180001234567890", "bank", "CLABE interbancaria", new Date()],
      ["bankAccount", "0123456789", "bank", "Número de cuenta", new Date()],
      ["transferInstructions", "Es indispensable colocar tu FOLIO de orden como concepto de pago para validar tu transferencia.", "bank", "Instrucciones de pago", new Date()],
      ["reservationDurationMinutes", "15", "sales", "Minutos de reserva temporal", new Date()],
      ["contactWhatsApp", "+52 55 1202 3739", "contact", "WhatsApp oficial", new Date()],
      ["contactEmail", "boletos@theravit360.com", "contact", "Email de contacto", new Date()]
    ],
    "TICKET_TYPES": [
      ["id", "name", "description", "price", "quantity", "sold", "reserved", "active", "maxPerOrder", "createdAt"],
      ["TT-GEN", "GENERAL PASS", "Acceso general al evento, pista de baile y concurso de disfraces.", 500, 200, 0, 0, true, 10, new Date()],
      ["TT-VIP", "VIP MANSION PASS", "Acceso preferencial sin fila, barra libre de mixología 20:00 a 22:00 y zona lounge.", 900, 50, 0, 0, true, 6, new Date()]
    ],
    "CUSTOMERS": [
      ["customerId", "name", "email", "phone", "createdAt", "updatedAt"]
    ],
    "ORDERS": [
      ["orderId", "folio", "orderAccessToken", "customerId", "ticketTypeId", "quantity", "unitPrice", "totalAmount", "status", "claimCode", "reservationExpiresAt", "notes", "createdAt", "updatedAt"]
    ],
    "TICKETS": [
      ["ticketId", "ticketNumber", "orderId", "ticketTypeId", "secureToken", "attendeeName", "attendeePhone", "status", "createdAt", "updatedAt", "usedAt", "usedBy", "revokedAt"]
    ],
    "PAYMENTS": [
      ["paymentId", "orderId", "amount", "method", "receiptDriveFileId", "receiptUrl", "status", "uploadedAt", "reviewedAt", "reviewedBy", "rejectionReason"]
    ],
    "CHECK_INS": [
      ["checkInId", "ticketId", "checkedInAt", "checkedInBy", "deviceInfo", "method"]
    ],
    "ADMINS": [
      ["adminId", "email", "passwordHash", "name", "role", "active", "createdAt"],
      ["ADM-000", "superadmin@theravit360.com", "SuperAdminHalloween2026!", "Super Administrador General", "SUPERADMIN", true, new Date()],
      ["ADM-001", "admin@theravit360.com", "AdminHalloween2026!", "Administrador Principal", "ADMIN", true, new Date()],
      ["ADM-002", "puerta@theravit360.com", "Puerta2026!", "Staff de Puerta (Scanner)", "SCANNER", true, new Date()]
    ],
    "AUDIT_LOG": [
      ["logId", "timestamp", "actor", "action", "entity", "entityId", "details"]
    ]
  };

  for (var name in sheets) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    } else {
      sheet.clear();
    }
    
    var data = sheets[name];
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    sheet.getRange(1, 1, 1, data[0].length).setFontWeight("bold").setBackground("#272335").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  // Eliminar la "Hoja 1" por defecto si existe
  var defaultSheet = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log("✅ Base de datos de Halloween Theravit360 inicializada con éxito.");
}

// ============================================================================
// 2. CAPA DE ACCESO A DATOS (DATABASE HELPERS)
// ============================================================================

function getTableData(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var rowObj = { _rowIndex: i + 1 };
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}

function insertRow(sheetName, rowObj) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var val = rowObj[headers[i]];
    newRow.push(val !== undefined ? val : "");
  }
  sheet.appendRow(newRow);
  return sheet.getLastRow();
}

function updateRow(sheetName, rowIndex, rowObj) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    if (rowObj[key] !== undefined) {
      sheet.getRange(rowIndex, i + 1).setValue(rowObj[key]);
    }
  }
}

// ============================================================================
// 3. UTILIDADES CRIPTOGRÁFICAS Y FORMATEO
// ============================================================================

function generateRandomToken(len) {
  len = len || 32;
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var result = "";
  for (var i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateFolio(orderCount) {
  var seq = ("0000" + (orderCount + 1)).slice(-4);
  return "HAL-2026-" + seq;
}

function generateClaimCode() {
  // Código alfanumérico legible de 6 caracteres (sin 0, O, 1, I para evitar confusión)
  var chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  var code = "";
  for (var i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "THV-" + code;
}

function ensureOrdersClaimCodeColumn() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ORDERS");
    if (!sheet) return;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.indexOf("claimCode") === -1) {
      var newCol = headers.length + 1;
      sheet.getRange(1, newCol).setValue("claimCode");
      sheet.getRange(1, newCol).setFontWeight("bold").setBackground("#272335").setFontColor("#FFFFFF");
      Logger.log("Columna claimCode añadida automáticamente a ORDERS.");
    }
  } catch (err) {
    Logger.log("Aviso al verificar columna claimCode: " + err.message);
  }
}

function testEmailNotification() {
  var testEmail = "muresbrian@gmail.com";
  MailApp.sendEmail({
    to: testEmail,
    subject: "🎃 [Prueba de Conexión] Alertas Halloween Theravit360",
    htmlBody: "<div style='font-family:Arial,sans-serif;padding:25px;background:#050408;color:#f4ebd0;border:1px solid #b91c1c;border-radius:10px;'><h2 style='color:#ef4444;margin:0 0 10px 0;'>¡Conexión de Correo Exitosa!</h2><p>Google Apps Script tiene autorización activa para enviar alertas instantáneas de comprobantes a " + testEmail + " y códigos alfanuméricos a los asistentes.</p></div>"
  });
  Logger.log("✅ Correo de prueba enviado con éxito a " + testEmail);
}

function sendAdminReceiptAlert(ord, receiptUrl, customer) {
  try {
    var adminEmail = "muresbrian@gmail.com";
    var subject = "🚨 [Nuevo Comprobante] Orden " + ord.folio + " - " + (customer ? customer.name : "Cliente");
    
    var htmlBody = '<div style="background-color:#07050d;color:#f4ebd0;font-family:Arial,sans-serif;padding:30px;border-radius:12px;max-width:600px;margin:0 auto;border:1px solid #7f1d1d;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
        '<h1 style="color:#ef4444;font-size:24px;margin:0;text-transform:uppercase;letter-spacing:2px;">🎃 Halloween Theravit360</h1>' +
        '<p style="color:#a1a1aa;font-size:14px;margin:6px 0 0 0;">Nuevo comprobante de transferencia bancaria recibido</p>' +
      '</div>' +
      '<div style="background-color:#130f1c;padding:20px;border-radius:8px;border:1px solid #27272a;margin-bottom:20px;">' +
        '<p style="margin:6px 0;font-size:15px;"><strong>Folio de Orden:</strong> <span style="color:#ef4444;font-family:monospace;font-size:18px;">' + ord.folio + '</span></p>' +
        '<p style="margin:6px 0;font-size:14px;"><strong>Cliente:</strong> ' + (customer ? customer.name : "N/A") + '</p>' +
        '<p style="margin:6px 0;font-size:14px;"><strong>Correo:</strong> ' + (customer ? customer.email : "N/A") + '</p>' +
        '<p style="margin:6px 0;font-size:14px;"><strong>Teléfono:</strong> ' + (customer ? customer.phone : "N/A") + '</p>' +
        '<p style="margin:6px 0;font-size:14px;"><strong>Boletos:</strong> ' + ord.quantity + '</p>' +
        '<p style="margin:6px 0;font-size:16px;"><strong>Monto Total:</strong> <span style="color:#10b981;font-weight:bold;">$' + ord.totalAmount + ' MXN</span></p>' +
      '</div>' +
      '<div style="text-align:center;margin:28px 0;">' +
        '<a href="' + receiptUrl + '" target="_blank" style="background-color:#dc2626;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;font-size:14px;margin-right:10px;">Ver Comprobante en Drive</a> ' +
        '<a href="https://halloween-theravit360.netlify.app/admin/orders" target="_blank" style="background-color:#27272a;color:#f4ebd0;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;font-size:14px;border:1px solid #52525b;">Ir a Validar en Panel Admin</a>' +
      '</div>' +
      '<p style="font-size:12px;color:#71717a;text-align:center;margin-top:20px;">Este correo se generó automáticamente tras la carga del comprobante en la plataforma web.</p>' +
    '</div>';

    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("Admin receipt alert sent to " + adminEmail + " for order " + ord.folio);
  } catch (e) {
    Logger.log("Error sending admin receipt alert: " + e.message);
  }
}

function sendCustomerClaimCodeEmail(ord, customer, claimCode) {
  try {
    if (!customer || !customer.email) return;
    
    var subject = "🎟️ ¡Pago Confirmado! Código de Desbloqueo de Boletos - Folio " + ord.folio;
    var unlockUrl = "https://halloween-theravit360.netlify.app/mis-boletos?folio=" + encodeURIComponent(ord.folio) + "&codigo=" + encodeURIComponent(claimCode);
    
    var htmlBody = '<div style="background-color:#07050d;color:#f4ebd0;font-family:Arial,sans-serif;padding:30px;border-radius:12px;max-width:600px;margin:0 auto;border:1px solid #7f1d1d;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
        '<h1 style="color:#ef4444;font-size:24px;margin:0;text-transform:uppercase;letter-spacing:2px;">🎃 Halloween Theravit360 2026</h1>' +
        '<p style="color:#34d399;font-size:16px;font-weight:bold;margin:8px 0 0 0;">¡Tu transferencia ha sido validada y confirmada!</p>' +
      '</div>' +
      '<p style="font-size:15px;line-height:1.6;color:#e4e4e7;">Hola <strong>' + (customer.name || "Asistente") + '</strong>,</p>' +
      '<p style="font-size:14px;line-height:1.6;color:#a1a1aa;">Tu pago para la orden <strong>' + ord.folio + '</strong> por <strong>' + ord.quantity + ' boleto(s)</strong> ha sido acreditado exitosamente.</p>' +
      '<div style="background-color:#130f1c;padding:24px;border-radius:10px;border:2px dashed #dc2626;text-align:center;margin:25px 0;">' +
        '<span style="font-size:12px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Tu Código Alfanumérico de Seguridad:</span>' +
        '<div style="font-family:monospace;font-size:32px;font-weight:900;letter-spacing:4px;color:#f4ebd0;background:#1e1828;padding:12px 20px;border-radius:8px;display:inline-block;border:1px solid #dc2626;">' +
          claimCode +
        '</div>' +
        '<p style="font-size:12px;color:#a1a1aa;margin-top:12px;">Usa este código en la web para desbloquear y descargar tus boletos digitales.</p>' +
      '</div>' +
      '<div style="text-align:center;margin:30px 0;">' +
        '<a href="' + unlockUrl + '" target="_blank" style="background-color:#dc2626;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;font-size:15px;box-shadow:0 4px 15px rgba(220,38,38,0.4);">' +
          'Desbloquear y Descargar Boletos Directamente' +
        '</a>' +
      '</div>' +
      '<div style="background-color:#181422;padding:16px;border-radius:8px;margin-top:20px;font-size:12px;color:#a1a1aa;border-left:4px solid #ef4444;">' +
        '<p style="margin:0 0 6px 0;"><strong>Importante:</strong></p>' +
        '<ul style="margin:0;padding-left:18px;">' +
          '<li>Cada boleto cuenta con un código QR único e intransferible.</li>' +
          '<li>Guarda tus boletos en tu celular o descárgalos en PDF antes de llegar al evento.</li>' +
          '<li>El evento inicia a las 20:00 hrs en Theravit 360°. Presenta tu identificación oficial y disfraz.</li>' +
        '</ul>' +
      '</div>' +
      '<p style="font-size:11px;color:#52525b;text-align:center;margin-top:25px;">Theravit360 Eventos • Si tienes dudas, contáctanos vía WhatsApp oficial.</p>' +
    '</div>';

    MailApp.sendEmail({
      to: customer.email,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("Customer claim code email sent to " + customer.email + " for order " + ord.folio);
  } catch (e) {
    Logger.log("Error sending customer claim code email: " + e.message);
  }
}

function logAudit(actor, action, entity, entityId, details) {
  try {
    insertRow("AUDIT_LOG", {
      logId: "LOG-" + generateRandomToken(12),
      timestamp: new Date().toISOString(),
      actor: actor || "SYSTEM",
      action: action,
      entity: entity,
      entityId: entityId || "",
      details: typeof details === "object" ? JSON.stringify(details) : details
    });
  } catch (e) {
    Logger.log("Error logging audit: " + e.message);
  }
}

// ============================================================================
// 4. CONTROLADORES DE LÓGICA DE NEGOCIO
// ============================================================================

// --- Configuración ---
function handleGetConfig() {
  cleanupExpiredOrdersInternal();
  
  var configRows = getTableData("CONFIG");
  var config = {};
  for (var i = 0; i < configRows.length; i++) {
    config[configRows[i].key] = configRows[i].value;
  }
  
  var types = getTableData("TICKET_TYPES");
  var ticketTypes = [];
  for (var j = 0; j < types.length; j++) {
    if (types[j].active === true || types[j].active === "TRUE") {
      var avail = Math.max(0, Number(types[j].quantity) - (Number(types[j].sold) + Number(types[j].reserved)));
      ticketTypes.push({
        id: types[j].id,
        name: types[j].name,
        description: types[j].description,
        price: Number(types[j].price),
        quantity: Number(types[j].quantity),
        sold: Number(types[j].sold),
        reserved: Number(types[j].reserved),
        available: avail,
        maxPerOrder: Number(types[j].maxPerOrder || 10),
        isSoldOut: avail <= 0
      });
    }
  }
  
  return { success: true, config: config, ticketTypes: ticketTypes };
}

// --- Limpieza de Órdenes Expiradas ---
function cleanupExpiredOrdersInternal() {
  var orders = getTableData("ORDERS");
  var now = new Date().getTime();
  var tickets = getTableData("TICKETS");
  var ticketTypes = getTableData("TICKET_TYPES");
  
  for (var i = 0; i < orders.length; i++) {
    var ord = orders[i];
    if (ord.status === "RESERVADA") {
      var exp = new Date(ord.reservationExpiresAt).getTime();
      if (now > exp) {
        // Expirar orden
        updateRow("ORDERS", ord._rowIndex, {
          status: "EXPIRADA",
          updatedAt: new Date().toISOString()
        });
        
        // Expirar boletos
        for (var j = 0; j < tickets.length; j++) {
          if (tickets[j].orderId === ord.orderId) {
            updateRow("TICKETS", tickets[j]._rowIndex, {
              status: "EXPIRADO",
              updatedAt: new Date().toISOString()
            });
          }
        }
        
        // Retornar inventario a disponibles
        for (var k = 0; k < ticketTypes.length; k++) {
          if (ticketTypes[k].id === ord.ticketTypeId) {
            var newRes = Math.max(0, Number(ticketTypes[k].reserved) - Number(ord.quantity));
            updateRow("TICKET_TYPES", ticketTypes[k]._rowIndex, {
              reserved: newRes
            });
          }
        }
        
        logAudit("SYSTEM", "RESERVATION_EXPIRED", "ORDER", ord.orderId, { folio: ord.folio, released: ord.quantity });
      }
    }
  }
}

// --- Reserva Atómica de Orden (Protección con LockService) ---
function handleReserveOrder(params) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    cleanupExpiredOrdersInternal();
    
    var ticketTypes = getTableData("TICKET_TYPES");
    var targetType = null;
    for (var i = 0; i < ticketTypes.length; i++) {
      if (ticketTypes[i].id === params.ticketTypeId) {
        targetType = ticketTypes[i];
        break;
      }
    }
    
    if (!targetType || (!targetType.active && targetType.active !== "TRUE")) {
      return { success: false, error: "El tipo de boleto seleccionado no está disponible." };
    }
    
    var qty = Number(params.quantity);
    if (qty <= 0) return { success: false, error: "Cantidad mínima inválida." };
    
    var available = Number(targetType.quantity) - (Number(targetType.sold) + Number(targetType.reserved));
    if (available < qty) {
      return { success: false, error: "Lo sentimos, solo quedan " + available + " boletos disponibles." };
    }
    
    // 1. Crear o buscar Cliente
    var customers = getTableData("CUSTOMERS");
    var customerId = "CUS-" + generateRandomToken(8);
    var cleanEmail = (params.email || "").trim().toLowerCase();
    var existingCus = null;
    for (var c = 0; c < customers.length; c++) {
      if (String(customers[c].email).toLowerCase() === cleanEmail) {
        existingCus = customers[c];
        break;
      }
    }
    
    if (existingCus) {
      customerId = existingCus.customerId;
      updateRow("CUSTOMERS", existingCus._rowIndex, {
        name: params.name,
        phone: params.phone,
        updatedAt: new Date().toISOString()
      });
    } else {
      insertRow("CUSTOMERS", {
        customerId: customerId,
        name: params.name,
        email: cleanEmail,
        phone: params.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // 2. Generar Orden y Token
    var orders = getTableData("ORDERS");
    var folio = generateFolio(orders.length);
    var orderId = "ORD-" + generateRandomToken(12);
    var orderAccessToken = generateRandomToken(32);
    
    var configRows = getTableData("CONFIG");
    var resMin = 15;
    for (var cf = 0; cf < configRows.length; cf++) {
      if (configRows[cf].key === "reservationDurationMinutes") {
        resMin = Number(configRows[cf].value) || 15;
      }
    }
    var expiresAt = new Date(new Date().getTime() + resMin * 60000).toISOString();
    var totalAmount = Number(targetType.price) * qty;
    
    insertRow("ORDERS", {
      orderId: orderId,
      folio: folio,
      orderAccessToken: orderAccessToken,
      customerId: customerId,
      ticketTypeId: targetType.id,
      quantity: qty,
      unitPrice: Number(targetType.price),
      totalAmount: totalAmount,
      status: "RESERVADA",
      reservationExpiresAt: expiresAt,
      notes: params.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // 3. Crear Boletos Individuales
    var orderSeq = folio.replace("HAL-2026-", "");
    var createdTickets = [];
    for (var t = 1; t <= qty; t++) {
      var ticketSeq = ("0" + t).slice(-2);
      var ticketNumber = "HAL-" + orderSeq + "-" + ticketSeq;
      var secureToken = generateRandomToken(32);
      var ticketId = "TKT-" + generateRandomToken(12);
      var templateIndex = Math.floor(Math.random() * 7) + 1;
      
      insertRow("TICKETS", {
        ticketId: ticketId,
        ticketNumber: ticketNumber,
        orderId: orderId,
        ticketTypeId: targetType.id,
        secureToken: secureToken,
        attendeeName: params.name,
        attendeePhone: params.phone,
        templateIndex: templateIndex,
        status: "RESERVADO",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usedAt: "",
        usedBy: "",
        revokedAt: ""
      });
      
      createdTickets.push({
        ticketNumber: ticketNumber,
        secureToken: secureToken,
        templateIndex: templateIndex
      });
    }
    
    // 4. Actualizar contador reserved
    updateRow("TICKET_TYPES", targetType._rowIndex, {
      reserved: Number(targetType.reserved) + qty
    });
    
    logAudit("CUSTOMER", "ORDER_CREATED", "ORDER", orderId, { folio: folio, quantity: qty, total: totalAmount });
    
    return {
      success: true,
      folio: folio,
      orderAccessToken: orderAccessToken,
      totalAmount: totalAmount,
      quantity: qty,
      expiresAt: expiresAt,
      tickets: createdTickets
    };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    lock.releaseLock();
  }
}

// --- Consulta de Orden por orderAccessToken ---
function handleGetOrder(accessToken) {
  cleanupExpiredOrdersInternal();
  var orders = getTableData("ORDERS");
  var ord = null;
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].orderAccessToken === accessToken) {
      ord = orders[i];
      break;
    }
  }
  if (!ord) return { success: false, error: "Orden no encontrada." };
  
  var customers = getTableData("CUSTOMERS");
  var customer = null;
  for (var c = 0; c < customers.length; c++) {
    if (customers[c].customerId === ord.customerId) {
      customer = customers[c];
      break;
    }
  }
  
  var ticketTypes = getTableData("TICKET_TYPES");
  var ticketType = null;
  for (var tt = 0; tt < ticketTypes.length; tt++) {
    if (ticketTypes[tt].id === ord.ticketTypeId) {
      ticketType = ticketTypes[tt];
      break;
    }
  }
  
function getDeterministicTemplateIndex(seed) {
  var s = String(seed || "1");
  var hash = 0;
  for (var i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) % 7;
  }
  return (Math.abs(hash) % 7) + 1;
}

  var allTickets = getTableData("TICKETS");
  var orderTickets = [];
  for (var t = 0; t < allTickets.length; t++) {
    if (allTickets[t].orderId === ord.orderId) {
      orderTickets.push({
        ticketId: allTickets[t].ticketId,
        ticketNumber: allTickets[t].ticketNumber,
        secureToken: allTickets[t].secureToken,
        attendeeName: allTickets[t].attendeeName,
        attendeePhone: allTickets[t].attendeePhone,
        status: allTickets[t].status,
        templateIndex: allTickets[t].templateIndex || getDeterministicTemplateIndex(allTickets[t].ticketNumber || allTickets[t].secureToken)
      });
    }
  }
  
  var payments = getTableData("PAYMENTS");
  var payment = null;
  for (var p = 0; p < payments.length; p++) {
    if (payments[p].orderId === ord.orderId) {
      payment = payments[p];
      break;
    }
  }
  
  var config = handleGetConfig().config;
  
  return {
    success: true,
    order: {
      orderId: ord.orderId,
      folio: ord.folio,
      orderAccessToken: ord.orderAccessToken,
      status: ord.status,
      quantity: Number(ord.quantity),
      unitPrice: Number(ord.unitPrice),
      totalAmount: Number(ord.totalAmount),
      reservationExpiresAt: ord.reservationExpiresAt,
      customer: customer,
      ticketType: ticketType,
      tickets: orderTickets,
      payment: payment
    },
    bankInfo: {
      bankName: config.bankName,
      bankHolder: config.bankHolder,
      bankClabe: config.bankClabe,
      bankAccount: config.bankAccount,
      instructions: config.transferInstructions
    }
  };
}

// --- Subida de Comprobante de Pago a Google Drive ---
function handleUploadReceipt(params) {
  var orders = getTableData("ORDERS");
  var ord = null;
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].orderAccessToken === params.orderAccessToken) {
      ord = orders[i];
      break;
    }
  }
  if (!ord) return { success: false, error: "Orden no encontrada." };
  if (ord.status === "PAGADA") return { success: false, error: "Esta orden ya se encuentra confirmada." };
  if (ord.status === "EXPIRADA" || ord.status === "CANCELADA") {
    return { success: false, error: "No es posible subir comprobante a una orden " + ord.status };
  }
  
  // Guardar en Google Drive
  var rootFolders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  var rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
  
  var pendingFolders = rootFolder.getFoldersByName("Pendientes");
  var pendingFolder = pendingFolders.hasNext() ? pendingFolders.next() : rootFolder.createFolder("Pendientes");
  
  // params.fileData: Base64 string, params.fileName, params.mimeType
  var contentType = params.mimeType || "image/jpeg";
  var decodedBytes = Utilities.base64Decode(params.fileData);
  var blob = Utilities.newBlob(decodedBytes, contentType, ord.folio + "_" + (params.fileName || "comprobante.jpg"));
  var file = pendingFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileUrl = file.getUrl();
  var fileId = file.getId();
  
  // Actualizar Pago
  var paymentId = "PAY-" + generateRandomToken(10);
  insertRow("PAYMENTS", {
    paymentId: paymentId,
    orderId: ord.orderId,
    amount: ord.totalAmount,
    method: "TRANSFERENCIA",
    receiptDriveFileId: fileId,
    receiptUrl: fileUrl,
    status: "PENDIENTE",
    uploadedAt: new Date().toISOString(),
    reviewedAt: "",
    reviewedBy: "",
    rejectionReason: ""
  });
  
  // Pausar expiración: Estado COMPROBANTE_RECIBIDO
  updateRow("ORDERS", ord._rowIndex, {
    status: "COMPROBANTE_RECIBIDO",
    updatedAt: new Date().toISOString()
  });
  
  // Boletos pasan a PAGO_PENDIENTE
  var tickets = getTableData("TICKETS");
  for (var t = 0; t < tickets.length; t++) {
    if (tickets[t].orderId === ord.orderId) {
      updateRow("TICKETS", tickets[t]._rowIndex, {
        status: "PAGO_PENDIENTE",
        updatedAt: new Date().toISOString()
      });
    }
  }
  
  logAudit("CUSTOMER", "RECEIPT_UPLOADED", "ORDER", ord.orderId, { folio: ord.folio, fileId: fileId });
  
  // Enviar alerta instantánea por correo al administrador
  try {
    var customers = getTableData("CUSTOMERS");
    var customer = null;
    for (var c = 0; c < customers.length; c++) {
      if (customers[c].customerId === ord.customerId) {
        customer = customers[c];
        break;
      }
    }
    sendAdminReceiptAlert(ord, fileUrl, customer);
  } catch (errAlert) {
    Logger.log("Error al notificar al admin por correo: " + errAlert.message);
  }

  return {
    success: true,
    message: "Comprobante subido exitosamente. El administrador validará tu transferencia.",
    receiptUrl: fileUrl
  };
}

// --- Búsqueda de Órdenes por Folio, Email o Teléfono (Portal del Asistente) ---
function handleLookupOrders(params) {
  cleanupExpiredOrdersInternal();
  ensureOrdersClaimCodeColumn();
  
  var folioQuery = (params.folio || "").trim().toUpperCase();
  var generalQuery = (params.query || "").trim().toLowerCase();
  var providedClaimCode = (params.claimCode || "").trim().toUpperCase();
  
  if (!folioQuery && !generalQuery) {
    return { success: false, error: "Debe ingresar su folio o su correo/teléfono." };
  }
  
  var orders = getTableData("ORDERS");
  var customers = getTableData("CUSTOMERS");
  var allTickets = getTableData("TICKETS");
  
  // Mapa de clientes por customerId
  var customerMap = {};
  for (var c = 0; c < customers.length; c++) {
    customerMap[customers[c].customerId] = customers[c];
  }
  
  var matchedOrders = [];
  var matchedOrderIds = {};
  
  for (var i = 0; i < orders.length; i++) {
    var ord = orders[i];
    var cust = customerMap[ord.customerId] || {};
    var isMatch = false;
    
    // 1. Coincidencia por folio
    if (folioQuery && ord.folio && ord.folio.toUpperCase().indexOf(folioQuery) !== -1) {
      isMatch = true;
    }
    
    // 2. Coincidencia por correo o teléfono en cliente
    if (!isMatch && generalQuery) {
      var email = (cust.email || "").toLowerCase();
      var phone = String(cust.phone || "").replace(/[^0-9]/g, "");
      var cleanQueryDigits = generalQuery.replace(/[^0-9]/g, "");
      
      if (email && email.indexOf(generalQuery) !== -1) {
        isMatch = true;
      } else if (cleanQueryDigits.length >= 7 && phone && phone.indexOf(cleanQueryDigits) !== -1) {
        isMatch = true;
      } else if (cust.name && cust.name.toLowerCase().indexOf(generalQuery) !== -1) {
        isMatch = true;
      }
    }
    
    // 3. Coincidencia por teléfono o nombre en boletos
    if (!isMatch && generalQuery) {
      for (var t = 0; t < allTickets.length; t++) {
        if (allTickets[t].orderId === ord.orderId) {
          var tktPhone = String(allTickets[t].attendeePhone || "").replace(/[^0-9]/g, "");
          var cleanQueryDigits = generalQuery.replace(/[^0-9]/g, "");
          if (cleanQueryDigits.length >= 7 && tktPhone && tktPhone.indexOf(cleanQueryDigits) !== -1) {
            isMatch = true;
            break;
          }
          if (allTickets[t].attendeeName && allTickets[t].attendeeName.toLowerCase().indexOf(generalQuery) !== -1) {
            isMatch = true;
            break;
          }
        }
      }
    }
    
    if (isMatch && !matchedOrderIds[ord.orderId]) {
      matchedOrderIds[ord.orderId] = true;
      
      var isPaid = ord.status === "PAGADA";
      var storedClaimCode = (ord.claimCode || "").trim().toUpperCase();
      
      // Una orden SOLO se desbloquea si ESTÁ PAGADA y su claimCode coincide con el proporcionado (o si no tiene claimCode asignado)
      var isUnlocked = isPaid && (!storedClaimCode || (providedClaimCode && providedClaimCode === storedClaimCode));
      var requiresClaimCode = isPaid && !isUnlocked;
      
      var ordTickets = [];
      for (var k = 0; k < allTickets.length; k++) {
        if (allTickets[k].orderId === ord.orderId) {
          var tktPaid = isPaid && (allTickets[k].status === "PAGADO" || allTickets[k].status === "UTILIZADO");
          ordTickets.push({
            ticketNumber: allTickets[k].ticketNumber,
            // Proteger token: SOLO se expone si la orden está PAGADA Y DESBLOQUEADA
            secureToken: (isUnlocked && tktPaid) ? allTickets[k].secureToken : "",
            attendeeName: allTickets[k].attendeeName || "Invitado",
            status: allTickets[k].status,
            templateIndex: allTickets[k].templateIndex || 1
          });
        }
      }
      
      matchedOrders.push({
        folio: ord.folio,
        orderAccessToken: ord.orderAccessToken,
        quantity: Number(ord.quantity),
        totalAmount: Number(ord.totalAmount),
        status: ord.status,
        createdAt: ord.createdAt,
        unlocked: isUnlocked,
        requiresClaimCode: requiresClaimCode,
        tickets: ordTickets
      });
    }
  }
  
  return {
    success: true,
    orders: matchedOrders
  };
}

// --- Validación de Código Alfanumérico de Boletos ---
function handleValidateClaimCode(params) {
  var folio = (params.folio || "").trim().toUpperCase();
  var code = (params.claimCode || "").trim().toUpperCase();
  
  if (!folio || !code) {
    return { success: false, error: "Debes ingresar tu folio y el código de seguridad." };
  }
  
  var orders = getTableData("ORDERS");
  var ord = null;
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].folio && orders[i].folio.toUpperCase() === folio) {
      ord = orders[i];
      break;
    }
  }
  if (!ord) return { success: false, error: "Orden no encontrada." };
  
  if (ord.status !== "PAGADA") {
    return { 
      success: false, 
      error: "Esta orden aún no ha sido validada como PAGADA por el organizador. Tu comprobante sigue en revisión." 
    };
  }
  
  var storedCode = (ord.claimCode || "").trim().toUpperCase();
  if (!storedCode || storedCode !== code) {
    return { success: false, error: "Código alfanumérico incorrecto para esta orden." };
  }
  
  var allTickets = getTableData("TICKETS");
  var ordTickets = [];
  for (var k = 0; k < allTickets.length; k++) {
    if (allTickets[k].orderId === ord.orderId) {
      ordTickets.push({
        ticketNumber: allTickets[k].ticketNumber,
        secureToken: allTickets[k].secureToken,
        attendeeName: allTickets[k].attendeeName || "Invitado",
        status: allTickets[k].status,
        templateIndex: allTickets[k].templateIndex || 1
      });
    }
  }
  
  return {
    success: true,
    unlocked: true,
    folio: ord.folio,
    orderAccessToken: ord.orderAccessToken,
    tickets: ordTickets
  };
}

// --- Consulta de Boleto Individual por secureToken ---
function handleGetTicket(secureToken) {
  var tickets = getTableData("TICKETS");
  var tkt = null;
  for (var i = 0; i < tickets.length; i++) {
    if (tickets[i].secureToken === secureToken) {
      tkt = tickets[i];
      break;
    }
  }
  if (!tkt) return { success: false, error: "Boleto no encontrado o código no válido." };
  
  if (tkt.status !== "PAGADO" && tkt.status !== "UTILIZADO") {
    return { 
      success: false, 
      error: "Este boleto no está activo. Su orden se encuentra en proceso de validación o no ha sido pagada." 
    };
  }
  
  var ticketTypes = getTableData("TICKET_TYPES");
  var ticketType = null;
  for (var tt = 0; tt < ticketTypes.length; tt++) {
    if (ticketTypes[tt].id === tkt.ticketTypeId) {
      ticketType = ticketTypes[tt];
      break;
    }
  }
  
  var config = handleGetConfig().config;
  
  return {
    success: true,
    ticket: {
      ticketId: tkt.ticketId,
      ticketNumber: tkt.ticketNumber,
      secureToken: tkt.secureToken,
      attendeeName: tkt.attendeeName,
      attendeePhone: tkt.attendeePhone,
      status: tkt.status,
      usedAt: tkt.usedAt,
      ticketTypeName: ticketType ? ticketType.name : "GENERAL",
      templateIndex: tkt.templateIndex || getDeterministicTemplateIndex(tkt.ticketNumber || tkt.secureToken)
    },
    event: {
      name: config.eventName,
      date: config.eventDate,
      time: config.eventTime,
      location: config.eventLocation,
      address: config.eventAddress,
      rules: config.eventRules
    }
  };
}

function getDeterministicTemplateIndex(seed) {
  if (!seed) return 1;
  var hash = 0;
  for (var i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 7) + 1;
}

// --- Asignación de Asistente a Boleto Individual ---
function handleUpdateAttendee(params) {
  var tickets = getTableData("TICKETS");
  var tkt = null;
  for (var i = 0; i < tickets.length; i++) {
    if (tickets[i].secureToken === params.secureToken) {
      tkt = tickets[i];
      break;
    }
  }
  if (!tkt) return { success: false, error: "Boleto no encontrado." };
  
  updateRow("TICKETS", tkt._rowIndex, {
    attendeeName: params.attendeeName || tkt.attendeeName,
    attendeePhone: params.attendeePhone || tkt.attendeePhone,
    updatedAt: new Date().toISOString()
  });
  
  return { success: true, message: "Asistente asignado correctamente." };
}

// --- Check-in Atómico con LockService ---
function handleCheckInScan(params) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    var token = (params.secureToken || params.code || "").trim();
    var tickets = getTableData("TICKETS");
    var tkt = null;
    
    for (var i = 0; i < tickets.length; i++) {
      if (tickets[i].secureToken === token || tickets[i].ticketNumber === token) {
        tkt = tickets[i];
        break;
      }
    }
    
    if (!tkt) {
      return { success: false, code: "INVALID", message: "✕ CÓDIGO NO VÁLIDO. No existe en el sistema." };
    }
    
    if (tkt.revokedAt && tkt.revokedAt !== "") {
      return { success: false, code: "REVOKED", message: "✕ BOLETO REVOCADO. Este código fue reemitido." };
    }
    
    if (tkt.status === "UTILIZADO") {
      var dateFormatted = tkt.usedAt ? new Date(tkt.usedAt).toLocaleTimeString() : "Previamente";
      return {
        success: false,
        code: "ALREADY_USED",
        message: "⚠ TICKET YA UTILIZADO a las " + dateFormatted + " por " + (tkt.usedBy || "Staff"),
        ticket: tkt
      };
    }
    
    if (tkt.status !== "PAGADO") {
      return {
        success: false,
        code: "NOT_PAID",
        message: "✕ ACCESO NO AUTORIZADO. El boleto está en estado: " + tkt.status,
        ticket: tkt
      };
    }
    
    // TRANSICIÓN ATÓMICA: PAGADO -> UTILIZADO
    var nowIso = new Date().toISOString();
    var operator = params.operatorName || "Staff Puerta";
    
    updateRow("TICKETS", tkt._rowIndex, {
      status: "UTILIZADO",
      usedAt: nowIso,
      usedBy: operator,
      updatedAt: nowIso
    });
    
    // Registrar Check-in
    insertRow("CHECK_INS", {
      checkInId: "CHK-" + generateRandomToken(10),
      ticketId: tkt.ticketId,
      checkedInAt: nowIso,
      checkedInBy: operator,
      deviceInfo: params.deviceInfo || "Scanner Móvil",
      method: params.method || "QR_CAMERA"
    });
    
    logAudit(operator, "CHECK_IN_SUCCESS", "TICKET", tkt.ticketId, { ticketNumber: tkt.ticketNumber, attendee: tkt.attendeeName });
    
    var ticketTypes = getTableData("TICKET_TYPES");
    var typeName = "GENERAL";
    for (var tt = 0; tt < ticketTypes.length; tt++) {
      if (ticketTypes[tt].id === tkt.ticketTypeId) {
        typeName = ticketTypes[tt].name;
        break;
      }
    }
    
    return {
      success: true,
      code: "AUTHORIZED",
      message: "✓ ACCESO AUTORIZADO",
      ticket: {
        ticketNumber: tkt.ticketNumber,
        attendeeName: tkt.attendeeName,
        ticketTypeName: typeName,
        usedAt: nowIso
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    lock.releaseLock();
  }
}

// --- Autenticación Administrativa ---
function handleAdminLogin(params) {
  var admins = getTableData("ADMINS");
  var email = (params.email || "").trim().toLowerCase();
  var pass = params.password || "";
  
  for (var i = 0; i < admins.length; i++) {
    if (String(admins[i].email).toLowerCase() === email && String(admins[i].passwordHash) === pass) {
      if (admins[i].active === true || admins[i].active === "TRUE") {
        logAudit(admins[i].email, "ADMIN_LOGIN", "ADMIN", admins[i].adminId, {});
        return {
          success: true,
          admin: {
            adminId: admins[i].adminId,
            email: admins[i].email,
            name: admins[i].name,
            role: admins[i].role
          }
        };
      }
    }
  }
  return { success: false, error: "Credenciales incorrectas o usuario inactivo." };
}

// --- Dashboard de Métricas y Reconciliación ---
function handleGetDashboardStats() {
  cleanupExpiredOrdersInternal();
  
  var ticketTypes = getTableData("TICKET_TYPES");
  var tickets = getTableData("TICKETS");
  var orders = getTableData("ORDERS");
  var checkIns = getTableData("CHECK_INS");
  var payments = getTableData("PAYMENTS");
  
  var totalQuantity = 0;
  for (var i = 0; i < ticketTypes.length; i++) {
    totalQuantity += Number(ticketTypes[i].quantity || 0);
  }
  
  var counts = {
    RESERVADO: 0,
    PAGO_PENDIENTE: 0,
    PAGADO: 0,
    UTILIZADO: 0,
    CANCELADO: 0,
    EXPIRADO: 0
  };
  
  for (var t = 0; t < tickets.length; t++) {
    var st = tickets[t].status;
    if (counts[st] !== undefined) counts[st]++;
  }
  
  var sold = counts.PAGADO + counts.UTILIZADO;
  var reserved = counts.RESERVADO + counts.PAGO_PENDIENTE;
  var available = Math.max(0, totalQuantity - (sold + reserved));
  
  var totalConfirmedIncome = 0;
  for (var o = 0; o < orders.length; o++) {
    if (orders[o].status === "PAGADA") {
      totalConfirmedIncome += Number(orders[o].totalAmount || 0);
    }
  }
  
  var pendingReceiptsCount = 0;
  for (var p = 0; p < payments.length; p++) {
    if (payments[p].status === "PENDIENTE") pendingReceiptsCount++;
  }
  
  // Últimos 10 accesos
  var recentCheckIns = checkIns.slice(-10).reverse();
  
  return {
    success: true,
    stats: {
      totalQuantity: totalQuantity,
      sold: sold,
      reserved: reserved,
      available: available,
      used: counts.UTILIZADO,
      pendingEntrance: counts.PAGADO,
      pendingReceipts: pendingReceiptsCount,
      confirmedIncome: totalConfirmedIncome,
      recentCheckIns: recentCheckIns
    }
  };
}

// --- Aprobación / Rechazo de Pago por Admin ---
function handleReviewPayment(params) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    var orders = getTableData("ORDERS");
    var ord = null;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].orderId === params.orderId) {
        ord = orders[i];
        break;
      }
    }
    if (!ord) return { success: false, error: "Orden no encontrada." };
    
    var payments = getTableData("PAYMENTS");
    var pay = null;
    for (var p = 0; p < payments.length; p++) {
      if (payments[p].orderId === ord.orderId) {
        pay = payments[p];
        break;
      }
    }
    
    var ticketTypes = getTableData("TICKET_TYPES");
    var targetType = null;
    for (var tt = 0; tt < ticketTypes.length; tt++) {
      if (ticketTypes[tt].id === ord.ticketTypeId) {
        targetType = ticketTypes[tt];
        break;
      }
    }
    
    var tickets = getTableData("TICKETS");
    var reviewer = params.reviewerName || "Admin";
    var nowIso = new Date().toISOString();
    
    if (params.decision === "APPROVE") {
      ensureOrdersClaimCodeColumn();
      var claimCode = (ord.claimCode || "").trim().toUpperCase() || generateClaimCode();

      // 1. Orden PAGADA con claimCode
      updateRow("ORDERS", ord._rowIndex, {
        status: "PAGADA",
        claimCode: claimCode,
        updatedAt: nowIso
      });
      // 2. Boletos PAGADO
      for (var t = 0; t < tickets.length; t++) {
        if (tickets[t].orderId === ord.orderId) {
          updateRow("TICKETS", tickets[t]._rowIndex, {
            status: "PAGADO",
            updatedAt: nowIso
          });
        }
      }
      // 3. Ajuste de contadores
      if (targetType) {
        updateRow("TICKET_TYPES", targetType._rowIndex, {
          reserved: Math.max(0, Number(targetType.reserved) - Number(ord.quantity)),
          sold: Number(targetType.sold) + Number(ord.quantity)
        });
      }
      // 4. Pago APROBADO
      if (pay) {
        updateRow("PAYMENTS", pay._rowIndex, {
          status: "APROBADO",
          reviewedAt: nowIso,
          reviewedBy: reviewer
        });
      }
      
      // 5. Enviar código de desbloqueo al correo del cliente
      try {
        var customers = getTableData("CUSTOMERS");
        var customer = null;
        for (var c = 0; c < customers.length; c++) {
          if (customers[c].customerId === ord.customerId) {
            customer = customers[c];
            break;
          }
        }
        sendCustomerClaimCodeEmail(ord, customer, claimCode);
      } catch (errEmail) {
        Logger.log("Error al enviar correo con código al comprador: " + errEmail.message);
      }

      logAudit(reviewer, "PAYMENT_APPROVED", "ORDER", ord.orderId, { folio: ord.folio, total: ord.totalAmount, claimCode: claimCode });
      return { success: true, message: "Pago aprobado. Se envió el código " + claimCode + " al cliente.", claimCode: claimCode };
    } else {
      // RECHAZAR
      updateRow("ORDERS", ord._rowIndex, {
        status: "RECHAZADA",
        updatedAt: nowIso
      });
      for (var tr = 0; tr < tickets.length; tr++) {
        if (tickets[tr].orderId === ord.orderId) {
          updateRow("TICKETS", tickets[tr]._rowIndex, {
            status: "CANCELADO",
            updatedAt: nowIso
          });
        }
      }
      if (targetType) {
        updateRow("TICKET_TYPES", targetType._rowIndex, {
          reserved: Math.max(0, Number(targetType.reserved) - Number(ord.quantity))
        });
      }
      if (pay) {
        updateRow("PAYMENTS", pay._rowIndex, {
          status: "RECHAZADO",
          reviewedAt: nowIso,
          reviewedBy: reviewer,
          rejectionReason: params.rejectionReason || "Comprobante no válido"
        });
      }
      logAudit(reviewer, "PAYMENT_REJECTED", "ORDER", ord.orderId, { reason: params.rejectionReason });
      return { success: true, message: "Pago rechazado. Los boletos han sido liberados." };
    }
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

// --- Reconciliación de Inventario ---
function handleReconcileInventory() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    cleanupExpiredOrdersInternal();
    
    var ticketTypes = getTableData("TICKET_TYPES");
    var tickets = getTableData("TICKETS");
    
    var results = [];
    for (var i = 0; i < ticketTypes.length; i++) {
      var typeId = ticketTypes[i].id;
      var realSold = 0;
      var realReserved = 0;
      
      for (var t = 0; t < tickets.length; t++) {
        if (tickets[t].ticketTypeId === typeId) {
          if (tickets[t].status === "PAGADO" || tickets[t].status === "UTILIZADO") realSold++;
          if (tickets[t].status === "RESERVADO" || tickets[t].status === "PAGO_PENDIENTE") realReserved++;
        }
      }
      
      var prevSold = Number(ticketTypes[i].sold);
      var prevRes = Number(ticketTypes[i].reserved);
      
      updateRow("TICKET_TYPES", ticketTypes[i]._rowIndex, {
        sold: realSold,
        reserved: realReserved
      });
      
      results.push({
        name: ticketTypes[i].name,
        prevSold: prevSold,
        realSold: realSold,
        prevReserved: prevRes,
        realReserved: realReserved,
        adjusted: prevSold !== realSold || prevRes !== realReserved
      });
    }
    
    logAudit("ADMIN", "INVENTORY_RECONCILED", "INVENTORY", "", results);
    return { success: true, reconciliation: results };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

// --- Regeneración de Token Seguro ---
function handleRegenerateToken(params) {
  var tickets = getTableData("TICKETS");
  var tkt = null;
  for (var i = 0; i < tickets.length; i++) {
    if (tickets[i].ticketId === params.ticketId || tickets[i].ticketNumber === params.ticketNumber) {
      tkt = tickets[i];
      break;
    }
  }
  if (!tkt) return { success: false, error: "Boleto no encontrado." };
  
  var newToken = generateRandomToken(32);
  updateRow("TICKETS", tkt._rowIndex, {
    secureToken: newToken,
    updatedAt: new Date().toISOString()
  });
  
  logAudit(params.adminName || "ADMIN", "TOKEN_REGENERATED", "TICKET", tkt.ticketId, {
    ticketNumber: tkt.ticketNumber,
    reason: params.reason || "Reemisión administrativa"
  });
  
  return { success: true, message: "Código QR regenerado con éxito.", newSecureToken: newToken };
}

// --- Actualización de Configuración General (Superadmin) ---
function handleUpdateConfig(params) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var updates = params.config || {};
    var configRows = getTableData("CONFIG");
    var now = new Date();
    
    for (var key in updates) {
      var found = false;
      for (var i = 0; i < configRows.length; i++) {
        if (configRows[i].key === key) {
          updateRow("CONFIG", configRows[i]._rowIndex, {
            value: updates[key],
            updatedAt: now
          });
          found = true;
          break;
        }
      }
      if (!found) {
        insertRow("CONFIG", {
          key: key,
          value: updates[key],
          category: "custom",
          description: "Ajuste Superadmin",
          updatedAt: now
        });
      }
    }
    
    logAudit(params.actor || "SUPERADMIN", "CONFIG_UPDATED", "CONFIG", "GENERAL", updates);
    return { success: true, message: "Configuración actualizada con éxito." };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

// --- Actualización de Precios y Cupos de Boletos (Superadmin) ---
function handleUpdateTicketTypes(params) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var incomingTypes = params.ticketTypes || [];
    var existingTypes = getTableData("TICKET_TYPES");
    
    for (var i = 0; i < incomingTypes.length; i++) {
      var item = incomingTypes[i];
      var found = false;
      for (var j = 0; j < existingTypes.length; j++) {
        if (existingTypes[j].id === item.id) {
          updateRow("TICKET_TYPES", existingTypes[j]._rowIndex, {
            name: item.name !== undefined ? item.name : existingTypes[j].name,
            description: item.description !== undefined ? item.description : existingTypes[j].description,
            price: item.price !== undefined ? Number(item.price) : existingTypes[j].price,
            quantity: item.quantity !== undefined ? Number(item.quantity) : existingTypes[j].quantity,
            maxPerOrder: item.maxPerOrder !== undefined ? Number(item.maxPerOrder) : existingTypes[j].maxPerOrder,
            active: item.active !== undefined ? item.active : existingTypes[j].active
          });
          found = true;
          break;
        }
      }
      if (!found && item.name && item.price !== undefined) {
        insertRow("TICKET_TYPES", {
          id: item.id || ("TT-" + generateRandomToken(6).toUpperCase()),
          name: item.name,
          description: item.description || "",
          price: Number(item.price),
          quantity: Number(item.quantity || 100),
          sold: 0,
          reserved: 0,
          active: item.active !== false,
          maxPerOrder: Number(item.maxPerOrder || 10),
          createdAt: new Date()
        });
      }
    }
    
    logAudit(params.actor || "SUPERADMIN", "TICKET_TYPES_UPDATED", "TICKET_TYPES", "ALL", incomingTypes);
    return { success: true, message: "Tipos de boletos actualizados con éxito." };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// 5. ENRUTADOR PRINCIPAL (doPost / doGet)
// ============================================================================

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }
    
    // Validar clave secreta si está configurada (acepta clave estándar o clave personalizada)
    var isDefaultScriptSecret = !SCRIPT_SECRET_KEY || SCRIPT_SECRET_KEY === "TU_CLAVE_SECRETA_AQUI";
    var isStandardSecret = payload.secretKey === "theravit360_halloween_secret_key_2026" || payload.secretKey === "TU_CLAVE_SECRETA_AQUI" || !payload.secretKey;
    var isMatchingSecret = payload.secretKey === SCRIPT_SECRET_KEY;

    if (!isDefaultScriptSecret && !isStandardSecret && !isMatchingSecret) {
      output.setContent(JSON.stringify({ success: false, error: "No autorizado. Clave secreta inválida." }));
      return output;
    }
    
    var action = payload.action;
    var result = { success: false, error: "Acción no reconocida: " + action };
    
    switch (action) {
      case "getConfig":
        result = handleGetConfig();
        break;
      case "reserveOrder":
        result = handleReserveOrder(payload);
        break;
      case "getOrder":
        result = handleGetOrder(payload.orderAccessToken);
        break;
      case "lookupOrders":
        result = handleLookupOrders(payload);
        break;
      case "validateClaimCode":
        result = handleValidateClaimCode(payload);
        break;
      case "uploadReceipt":
        result = handleUploadReceipt(payload);
        break;
      case "getTicket":
        result = handleGetTicket(payload.secureToken);
        break;
      case "updateAttendee":
        result = handleUpdateAttendee(payload);
        break;
      case "checkInScan":
        result = handleCheckInScan(payload);
        break;
      case "adminLogin":
        result = handleAdminLogin(payload);
        break;
      case "getDashboardStats":
        result = handleGetDashboardStats();
        break;
      case "reviewPayment":
        result = handleReviewPayment(payload);
        break;
      case "reconcileInventory":
        result = handleReconcileInventory();
        break;
      case "regenerateToken":
        result = handleRegenerateToken(payload);
        break;
      case "cleanupExpired":
        cleanupExpiredOrdersInternal();
        result = { success: true, message: "Limpieza ejecutada." };
        break;
      case "getAdminOrders":
        result = { success: true, orders: getTableData("ORDERS"), payments: getTableData("PAYMENTS") };
        break;
      case "getAdminTickets":
        result = { success: true, tickets: getTableData("TICKETS") };
        break;
      case "getAuditLogs":
        result = { success: true, logs: getTableData("AUDIT_LOG").reverse() };
        break;
      case "getAdminConfig":
        result = { success: true, config: handleGetConfig().config, ticketTypes: getTableData("TICKET_TYPES") };
        break;
      case "updateConfig":
        result = handleUpdateConfig(payload);
        break;
      case "updateTicketTypes":
        result = handleUpdateTicketTypes(payload);
        break;
      default:
        result = { success: false, error: "Acción no soportada." };
    }
    
    output.setContent(JSON.stringify(result));
    return output;
  } catch (error) {
    output.setContent(JSON.stringify({ success: false, error: error.message }));
    return output;
  }
}
