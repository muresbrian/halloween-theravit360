import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🎃 Inicializando Seed de Halloween Theravit360 2026...");

  // 1. Crear Usuario Superadministrador
  const adminEmail = "admin@theravit360.com";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("AdminHalloween2026!", 10);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Administrador Principal",
        role: "superadmin",
        active: true,
      },
    });
    console.log("✅ Superadmin creado: admin@theravit360.com / AdminHalloween2026!");
  }

  // 2. Crear Ajustes Configurables (Zero Hardcoding)
  const defaultSettings = [
    // Información del Evento
    { key: "event_name", value: "HALLOWEEN THERAVIT360 2026", category: "event" },
    { key: "event_subtitle", value: "La Noche Más Oscura y Exclusiva del Año", category: "event" },
    {
      key: "event_description",
      value: "Una experiencia inmersiva de terror elegante, producción cinematográfica de audio e iluminación, zona lounge VIP, DJs estelares y concurso de disfraces con premios exclusivos.",
      category: "event",
    },
    { key: "event_date", value: "31 de Octubre, 2026", category: "event" },
    { key: "event_start_time", value: "20:00", category: "event" },
    { key: "event_end_time", value: "04:00", category: "event" },
    { key: "event_timezone", value: "America/Mexico_City", category: "event" },
    { key: "event_venue", value: "Mansión Theravit Club & Garden", category: "event" },
    { key: "event_address", value: "Av. Las Ánimas #666, Zona Metropolitana", category: "event" },
    { key: "event_min_age", value: "18+", category: "event" },
    { key: "event_dress_code", value: "Disfraz Temático Obligatorio / Elegante Oscuro", category: "event" },
    {
      key: "event_rules",
      value: "• Identificación oficial obligatoria.\n• Acceso únicamente con boleto digital QR válido.\n• Cero tolerancia a sustancias ilícitas.\n• No se permite el reingreso una vez salido del recinto.\n• Prohibido el ingreso de armas, objetos punzocortantes o botellas externas.",
      category: "event",
    },
    {
      key: "event_additional_info",
      value: "Estacionamiento privado con valet parking disponible. Barra libre de mixología de autor de 20:00 a 22:00 hrs para boletos VIP.",
      category: "event",
    },

    // Identidad Visual
    { key: "ui_logo_text", value: "🎃 THERAVIT360", category: "ui" },
    { key: "ui_primary_color", value: "#FF5722", category: "ui" }, // Naranja fuego
    { key: "ui_secondary_color", value: "#190D2E", category: "ui" }, // Púrpura oscuro
    { key: "ui_accent_color", value: "#8B0000", category: "ui" }, // Carmesí

    // Configuración Bancaria para Transferencias
    { key: "bank_name", value: "BBVA Bancomer", category: "bank" },
    { key: "bank_account_holder", value: "Theravit360 Eventos S.A. de C.V.", category: "bank" },
    { key: "bank_clabe", value: "012180001234567890", category: "bank" },
    { key: "bank_account_number", value: "0123456789", category: "bank" },
    { key: "bank_concept_instructions", value: "Es INDISPENSABLE colocar tu FOLIO de orden como concepto/motivo de pago para validar tu transferencia rápidamente.", category: "bank" },

    // Configuración de Ventas
    { key: "sale_active", value: "true", category: "sales" },
    { key: "reservation_time_minutes", value: "15", category: "sales" },
    { key: "max_tickets_per_order", value: "10", category: "sales" },

    // Contacto y Redes
    { key: "contact_whatsapp", value: "+52 55 1234 5678", category: "contact" },
    { key: "contact_whatsapp_link", value: "https://wa.me/525512345678", category: "contact" },
    { key: "contact_email", value: "contacto@theravit360.com", category: "contact" },
    { key: "contact_instagram", value: "@theravit360_halloween", category: "contact" },
    { key: "contact_facebook", value: "theravit360", category: "contact" },
    { key: "contact_tiktok", value: "@theravit360", category: "contact" },

    // Preguntas Frecuentes (FAQ)
    {
      key: "faq_list",
      value: JSON.stringify([
        {
          q: "¿Cómo aparto y pago mis boletos?",
          a: "Selecciona el tipo de boleto y la cantidad deseada. Al confirmar la orden recibirás un folio único y los datos bancarios. Realiza tu transferencia colocando tu folio en el concepto y sube tu comprobante de pago en la pantalla de la orden.",
        },
        {
          q: "¿Cuánto tiempo tengo para realizar la transferencia?",
          a: "Tus boletos quedan reservados temporalmente por 15 minutos mientras realizas la transferencia y subes tu comprobante. Si no subes el comprobante en ese tiempo, la reserva expira y los boletos se liberan.",
        },
        {
          q: "¿Cómo recibo mis boletos y códigos QR?",
          a: "En cuanto el administrador valide tu comprobante bancario, tu orden pasará a estado PAGADA y se generará automáticamente un código QR único para cada boleto. Podrás descargarlos o verlos en la sección 'Mis Boletos'.",
        },
        {
          q: "¿Puedo compartir un boleto individual con un amigo?",
          a: "¡Sí! Cada boleto cuenta con su propio enlace privado y su propio QR. Puedes asignarle el nombre de tu amigo y enviárselo directamente por WhatsApp. Tu amigo solo verá su boleto, sin acceso al resto de tu orden.",
        },
        {
          q: "¿Qué sucede en el acceso al evento?",
          a: "El personal de staff escaneará el código QR de cada asistente desde su celular. Al escanearlo, únicamente ese boleto pasará a estado UTILIZADO, garantizando que nadie más pueda usarlo.",
        },
      ]),
      category: "faq",
    },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✅ Ajustes del evento inicializados con éxito.");

  // 3. Crear Tipos de Boleto Iniciales (Configurables desde el panel)
  const existingGeneral = await prisma.ticketType.findFirst({
    where: { name: "GENERAL" },
  });

  if (!existingGeneral) {
    await prisma.ticketType.create({
      data: {
        name: "GENERAL",
        description: "Acceso general al evento, concurso de disfraces, pista de baile y shows de terror inmersivo.",
        price: 500.0,
        quantity: 200, // Inicialmente 200 pero 100% dinámico y editable
        sold: 0,
        reserved: 0,
        active: true,
        maxPerOrder: 10,
      },
    });
    console.log("✅ Tipo de boleto GENERAL creado (200 boletos disponibles a $500).");
  }

  const existingVip = await prisma.ticketType.findFirst({
    where: { name: "VIP" },
  });

  if (!existingVip) {
    await prisma.ticketType.create({
      data: {
        name: "VIP MANSION PASS",
        description: "Acceso preferencial sin fila, zona lounge elevada exclusiva, barra libre de mixología de 20:00 a 22:00 hrs y kit conmemorativo.",
        price: 900.0,
        quantity: 50,
        sold: 0,
        reserved: 0,
        active: true,
        maxPerOrder: 6,
      },
    });
    console.log("✅ Tipo de boleto VIP creado (50 boletos disponibles a $900).");
  }

  console.log("🎉 Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
