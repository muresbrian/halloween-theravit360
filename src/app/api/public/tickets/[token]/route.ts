import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";
import { generateQrDataUrl, buildTicketQrPayload } from "@/lib/qr";
import { resolveTicketTemplate } from "@/lib/ticket-templates";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const cleanToken = token.trim();

    const result = await callAppsScript("getTicket", { secureToken: cleanToken });
    if (!result.success || !result.ticket) {
      return NextResponse.json({ error: result.error || "Boleto no encontrado" }, { status: 404 });
    }

    const ticket = result.ticket;

    if (ticket.status !== "PAGADO" && ticket.status !== "UTILIZADO") {
      return NextResponse.json(
        { error: "Este boleto aún no está disponible. Su orden se encuentra en proceso de validación de pago." },
        { status: 403 }
      );
    }

    const template = resolveTicketTemplate(ticket);
    let qrDataUrl = null;

    // Generar QR independientemente (el escáner validará el estado PAGADO)
    const payload = buildTicketQrPayload(ticket.secureToken);
    qrDataUrl = await generateQrDataUrl(payload);

    return NextResponse.json({
      ticket: {
        ...ticket,
        templateIndex: template.id,
        template,
        qrDataUrl,
      },
      event: result.event,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
