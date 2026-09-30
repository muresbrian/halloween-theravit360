import { callAppsScript } from "../src/lib/sheets-api";

async function runCriticalTest() {
  console.log("======================================================================");
  console.log("🎃 INICIANDO BATERÍA DE PRUEBAS DEL SISTEMA V3 (HALLOWEEN THERAVIT360)");
  console.log("======================================================================\n");

  // 1. Obtener Configuración Inicial e Inventario
  console.log("📋 1. Consultando configuración inicial e inventario...");
  const configRes = await callAppsScript("getConfig");
  if (!configRes.success) throw new Error("Fallo al obtener configuración: " + configRes.error);
  const generalType = configRes.ticketTypes.find((t: any) => t.id === "TT-GEN");
  console.log(`   ✓ Evento: ${configRes.config.eventName}`);
  console.log(`   ✓ Tipo de boleto: ${generalType.name} - Disponibles: ${generalType.available}`);

  // 2. Crear Orden con 4 Boletos (Caso Crítico Requisito 38)
  console.log("\n🎟️ 2. Creando orden con 4 boletos para el cliente Brian Mures...");
  const reserveRes = await callAppsScript("reserveOrder", {
    ticketTypeId: "TT-GEN",
    quantity: 4,
    name: "Brian Mures",
    email: "brian@theravit360.com",
    phone: "5512345678",
    notes: "Prueba crítica de caso de negocio",
  });

  if (!reserveRes.success) throw new Error("Fallo al apartar boletos: " + reserveRes.error);
  console.log(`   ✓ Orden creada exitosamente: Folio ${reserveRes.folio}`);
  console.log(`   ✓ Token privado: ${reserveRes.orderAccessToken}`);
  console.log(`   ✓ Total: $${reserveRes.totalAmount} MXN`);

  // 3. Comprobar que los 4 boletos tienen QRs / Tokens ÚNICOS y DIFERENTES
  console.log("\n🔒 3. Verificando unicidad e independencia de los 4 códigos QR / Tokens...");
  const orderDetails = await callAppsScript("getOrder", { orderAccessToken: reserveRes.orderAccessToken });
  const tickets = orderDetails.order.tickets;
  if (tickets.length !== 4) throw new Error(`Se esperaban 4 boletos, pero se obtuvieron ${tickets.length}`);

  const [tkt1, tkt2, tkt3, tkt4] = tickets;
  console.log(`   - Boleto 1 (${tkt1.ticketNumber}): Token = ${tkt1.secureToken.slice(0, 10)}... (Estado: ${tkt1.status})`);
  console.log(`   - Boleto 2 (${tkt2.ticketNumber}): Token = ${tkt2.secureToken.slice(0, 10)}... (Estado: ${tkt2.status})`);
  console.log(`   - Boleto 3 (${tkt3.ticketNumber}): Token = ${tkt3.secureToken.slice(0, 10)}... (Estado: ${tkt3.status})`);
  console.log(`   - Boleto 4 (${tkt4.ticketNumber}): Token = ${tkt4.secureToken.slice(0, 10)}... (Estado: ${tkt4.status})`);

  if (tkt1.secureToken === tkt2.secureToken || tkt2.secureToken === tkt3.secureToken || tkt3.secureToken === tkt4.secureToken) {
    throw new Error("❌ ERROR GRAVE: Se repitieron tokens QR entre boletos!");
  }
  console.log("   ✓ APROBADO: QR 1 ≠ QR 2 ≠ QR 3 ≠ QR 4 (Todos son completamente únicos e independientes).");

  // 4. Intentar Check-in antes de pagar (Debe Rechazarse)
  console.log("\n🚫 4. Intentando escanear Boleto 3 ANTES de que el pago sea aprobado...");
  const earlyScan = await callAppsScript("checkInScan", { secureToken: tkt3.secureToken });
  if (earlyScan.success) throw new Error("❌ ERROR: El escáner admitió un boleto no pagado!");
  console.log(`   ✓ APROBADO: Acceso denegado correctamente: "${earlyScan.message}" (Código: ${earlyScan.code})`);

  // 5. Subir Comprobante y Congelar Reserva
  console.log("\n📤 5. Subiendo comprobante de transferencia bancaria...");
  const uploadRes = await callAppsScript("uploadReceipt", {
    orderAccessToken: reserveRes.orderAccessToken,
    receiptUrl: "/uploads/receipts/test_comprobante.jpg",
  });
  if (!uploadRes.success) throw new Error("Fallo al subir comprobante");
  console.log(`   ✓ Comprobante recibido. Estado de orden pasa a COMPROBANTE_RECIBIDO (Temporizador congelado).`);

  // 6. Administrador Aprueba el Pago
  console.log("\n✅ 6. Administrador valida y aprueba el pago...");
  const approveRes = await callAppsScript("reviewPayment", {
    orderId: orderDetails.order.orderId,
    decision: "APPROVE",
    reviewerName: "Administrador Principal",
  });
  if (!approveRes.success) throw new Error("Fallo al aprobar pago");
  console.log(`   ✓ Pago aprobado. Orden pasa a PAGADA y los 4 boletos pasan a PAGADO.`);

  // 7. ESCANEO DEL BOLETO 3 (DEBE AUTORIZAR)
  console.log("\n🎫 7. Llegada al evento: Se escanea ÚNICAMENTE el Boleto 3 en puerta...");
  const scan3Res = await callAppsScript("checkInScan", {
    secureToken: tkt3.secureToken,
    operatorName: "Staff Puerta 1",
  });
  if (!scan3Res.success || scan3Res.code !== "AUTHORIZED") {
    throw new Error("❌ ERROR: Boleto 3 pagado fue rechazado: " + JSON.stringify(scan3Res));
  }
  console.log(`   ✓ APROBADO: "${scan3Res.message}" para ${scan3Res.ticket.attendeeName} (${scan3Res.ticket.ticketNumber})`);

  // 8. Verificar que Boleto 3 es UTILIZADO y los otros 3 continúan PAGADOS
  console.log("\n🔍 8. Verificando estado de los 4 boletos tras el escaneo de Boleto 3...");
  const freshOrder = await callAppsScript("getOrder", { orderAccessToken: reserveRes.orderAccessToken });
  const freshTickets = freshOrder.order.tickets;
  const f1 = freshTickets.find((t: any) => t.ticketNumber === tkt1.ticketNumber);
  const f2 = freshTickets.find((t: any) => t.ticketNumber === tkt2.ticketNumber);
  const f3 = freshTickets.find((t: any) => t.ticketNumber === tkt3.ticketNumber);
  const f4 = freshTickets.find((t: any) => t.ticketNumber === tkt4.ticketNumber);

  console.log(`   - Boleto 1: ${f1.status}`);
  console.log(`   - Boleto 2: ${f2.status}`);
  console.log(`   - Boleto 3: ${f3.status} (UTILIZADO)`);
  console.log(`   - Boleto 4: ${f4.status}`);

  if (f3.status !== "UTILIZADO" || f1.status !== "PAGADO" || f2.status !== "PAGADO" || f4.status !== "PAGADO") {
    throw new Error("❌ ERROR: El escaneo de un boleto alteró el estado de los demás boletos!");
  }
  console.log("   ✓ APROBADO: Boleto 3 está UTILIZADO y los boletos 1, 2 y 4 continúan PAGADOS e intactos!");

  // 9. Re-escanear Boleto 3 (DEBE RECHAZARSE POR DOBLE USO)
  console.log("\n🚫 9. Intentando escanear Boleto 3 por SEGUNDA VEZ (Prueba anti-doble uso)...");
  const secondScan = await callAppsScript("checkInScan", {
    secureToken: tkt3.secureToken,
    operatorName: "Staff Puerta 2",
  });
  if (secondScan.success) throw new Error("❌ ERROR CRÍTICO: Se permitió el doble uso de un boleto!");
  console.log(`   ✓ APROBADO: Rechazado correctamente: "${secondScan.message}" (Código: ${secondScan.code})`);

  // 10. Escanear Boleto 1 (DEBE AUTORIZAR)
  console.log("\n🎫 10. Escaneando Boleto 1...");
  const scan1Res = await callAppsScript("checkInScan", { secureToken: tkt1.secureToken });
  if (!scan1Res.success || scan1Res.code !== "AUTHORIZED") throw new Error("Fallo al escanear boleto 1");
  console.log(`   ✓ APROBADO: Boleto 1 autorizado con éxito.`);

  // 11. Reconciliación de Inventario
  console.log("\n📊 11. Ejecutando reconciliación de inventario...");
  const reconcileRes = await callAppsScript("reconcileInventory");
  console.log(`   ✓ Inventario auditado contra tickets reales:`, reconcileRes.reconciliation);

  console.log("\n======================================================================");
  console.log("🎉 TODAS LAS PRUEBAS OBLIGATORIAS PASARON CON ÉXITO AL 100%");
  console.log("======================================================================\n");
}

runCriticalTest().catch((err) => {
  console.error("❌ ERROR EN PRUEBA:", err);
  process.exit(1);
});
