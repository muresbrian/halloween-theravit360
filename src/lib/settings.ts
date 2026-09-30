import { prisma } from "@/lib/prisma";

export interface EventSettings {
  // Info
  eventName: string;
  eventSubtitle: string;
  eventDescription: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  eventTimezone: string;
  eventVenue: string;
  eventAddress: string;
  eventMinAge: string;
  eventDressCode: string;
  eventRules: string;
  eventAdditionalInfo: string;

  // UI
  uiLogoText: string;
  uiPrimaryColor: string;
  uiSecondaryColor: string;
  uiAccentColor: string;

  // Bank
  bankName: string;
  bankAccountHolder: string;
  bankClabe: string;
  bankAccountNumber: string;
  bankConceptInstructions: string;

  // Sales
  saleActive: boolean;
  reservationTimeMinutes: number;
  maxTicketsPerOrder: number;

  // Contact
  contactWhatsapp: string;
  contactWhatsappLink: string;
  contactEmail: string;
  contactInstagram: string;
  contactFacebook: string;
  contactTiktok: string;

  // FAQ
  faqList: Array<{ q: string; a: string }>;
}

export async function getEventSettings(): Promise<EventSettings> {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  let faqList: Array<{ q: string; a: string }> = [];
  try {
    if (map["faq_list"]) {
      faqList = JSON.parse(map["faq_list"]);
    }
  } catch {
    faqList = [];
  }

  return {
    eventName: map["event_name"] || "HALLOWEEN THERAVIT360 2026",
    eventSubtitle: map["event_subtitle"] || "La Noche Más Oscura y Exclusiva del Año",
    eventDescription: map["event_description"] || "Experiencia de terror inmersivo de alta gama.",
    eventDate: map["event_date"] || "31 de Octubre, 2026",
    eventStartTime: map["event_start_time"] || "20:00",
    eventEndTime: map["event_end_time"] || "04:00",
    eventTimezone: map["event_timezone"] || "America/Mexico_City",
    eventVenue: map["event_venue"] || "Mansión Theravit Club & Garden",
    eventAddress: map["event_address"] || "Av. Las Ánimas #666",
    eventMinAge: map["event_min_age"] || "18+",
    eventDressCode: map["event_dress_code"] || "Disfraz Temático / Elegante Oscuro",
    eventRules: map["event_rules"] || "",
    eventAdditionalInfo: map["event_additional_info"] || "",

    uiLogoText: map["ui_logo_text"] || "🎃 THERAVIT360",
    uiPrimaryColor: map["ui_primary_color"] || "#FF5722",
    uiSecondaryColor: map["ui_secondary_color"] || "#190D2E",
    uiAccentColor: map["ui_accent_color"] || "#8B0000",

    bankName: map["bank_name"] || "BBVA",
    bankAccountHolder: map["bank_account_holder"] || "Theravit360",
    bankClabe: map["bank_clabe"] || "012180001234567890",
    bankAccountNumber: map["bank_account_number"] || "0123456789",
    bankConceptInstructions:
      map["bank_concept_instructions"] || "Coloca tu folio como concepto para validación inmediata.",

    saleActive: map["sale_active"] !== "false",
    reservationTimeMinutes: parseInt(map["reservation_time_minutes"] || "15", 10),
    maxTicketsPerOrder: parseInt(map["max_tickets_per_order"] || "10", 10),

    contactWhatsapp: map["contact_whatsapp"] || "",
    contactWhatsappLink: map["contact_whatsapp_link"] || "",
    contactEmail: map["contact_email"] || "",
    contactInstagram: map["contact_instagram"] || "",
    contactFacebook: map["contact_facebook"] || "",
    contactTiktok: map["contact_tiktok"] || "",

    faqList,
  };
}
