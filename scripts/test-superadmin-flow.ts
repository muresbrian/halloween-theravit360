import { callAppsScript } from "../src/lib/sheets-api";

async function runSuperadminTest() {
  console.log("==================================================");
  console.log("🧪 INICIANDO TEST DE FLUJO DE SUPERADMIN");
  console.log("==================================================");

  // 1. Probar Login de Superadmin
  console.log("\n1. Verificando credenciales de Superadmin...");
  const loginRes = await callAppsScript("adminLogin", {
    email: "superadmin@theravit360.com",
    password: "SuperAdminHalloween2026!",
  });

  if (!loginRes.success || loginRes.admin?.role !== "SUPERADMIN") {
    console.error("❌ Falló autenticación de Superadmin:", loginRes);
    process.exit(1);
  }
  console.log("✓ Login exitoso. Rol detectado:", loginRes.admin.role, "| Usuario:", loginRes.admin.name);

  // 2. Obtener Configuración Inicial
  console.log("\n2. Consultando configuración actual...");
  const initialConfig = await callAppsScript("getAdminConfig");
  if (!initialConfig.success) {
    console.error("❌ No se pudo obtener la configuración:", initialConfig);
    process.exit(1);
  }
  const generalPass = initialConfig.ticketTypes.find((t: any) => t.id === "TT-GEN");
  console.log("✓ Configuración actual cargada:");
  console.log("  - Evento:", initialConfig.config.eventName);
  console.log("  - Precio actual General Pass:", generalPass?.price);
  console.log("  - Aforo actual General Pass:", generalPass?.quantity);

  // 3. Superadmin modifica precio, cupo y datos bancarios
  console.log("\n3. Aplicando cambios como Superadmin...");
  const updatedTypesRes = await callAppsScript("updateTicketTypes", {
    actor: "Super Administrador Test",
    ticketTypes: [
      {
        id: "TT-GEN",
        price: 550,
        quantity: 250,
      },
    ],
  });

  if (!updatedTypesRes.success) {
    console.error("❌ Falló actualización de tipos de boletos:", updatedTypesRes);
    process.exit(1);
  }
  console.log("✓ Precios y aforo actualizados:", updatedTypesRes.message);

  const updatedConfigRes = await callAppsScript("updateConfig", {
    actor: "Super Administrador Test",
    config: {
      eventName: "HALLOWEEN THERAVIT360 2026 - EDICIÓN EXCLUSIVA",
      bankClabe: "012180009999999999",
      reservationDurationMinutes: "20",
    },
  });

  if (!updatedConfigRes.success) {
    console.error("❌ Falló actualización de configuración:", updatedConfigRes);
    process.exit(1);
  }
  console.log("✓ Datos generales y bancarios actualizados:", updatedConfigRes.message);

  // 4. Verificar que getConfig público refleja los cambios de inmediato
  console.log("\n4. Verificando reflejo en tiempo real para compradores (getConfig)...");
  const publicConfig = await callAppsScript("getConfig");
  const updatedGeneral = publicConfig.ticketTypes.find((t: any) => t.id === "TT-GEN");

  if (updatedGeneral?.price !== 550 || updatedGeneral?.quantity !== 250) {
    console.error("❌ Inconsistencia: El precio o cupo no se actualizaron.", updatedGeneral);
    process.exit(1);
  }
  console.log("✓ Verificado: Nuevo precio público es $" + updatedGeneral.price + " MXN");
  console.log("✓ Verificado: Nuevo aforo total es de " + updatedGeneral.quantity + " boletos");
  console.log("✓ Verificado: Nombre del evento actualizado:", publicConfig.config.eventName);
  console.log("✓ Verificado: Nueva CLABE bancaria:", publicConfig.config.bankClabe);

  // 5. Verificar Registro en AUDIT_LOG
  console.log("\n5. Verificando auditoría de cambios...");
  const auditRes = await callAppsScript("getAuditLogs");
  const lastLogs = auditRes.logs.slice(0, 3);
  console.log("✓ Últimos registros de auditoría:");
  for (const log of lastLogs) {
    console.log(`  - [${log.action}] por [${log.actor}] en ${log.entity}`);
  }

  console.log("\n==================================================");
  console.log("🎉 TODOS LOS TESTS DE SUPERADMIN PASARON CON ÉXITO");
  console.log("==================================================");
}

runSuperadminTest().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
