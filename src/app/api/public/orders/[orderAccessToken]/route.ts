import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";
import { generateQrDataUrl, buildTicketQrPayload } from "@/lib/qr";
import { resolveTicketTemplate } from "@/lib/ticket-templates";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderAccessToken: string }> }
) {
  try {
    const { orderAccessToken } = await params;
    const cleanToken = orderAccessToken.trim();

    const result = await callAppsScript("getOrder", { orderAccessToken: cleanToken });
    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Orden no encontrada" }, { status: 404 });
    }

    const order = result.order;
    const isPaid = order.status === "PAGADA";

    // Enriquecer cada boleto con su QR si ya está pagado y su plantilla coleccionable
    const ticketsWithQr = await Promise.all(
      (order.tickets || []).map(async (t: any) => {
        let qrDataUrl = null;
        if (isPaid) {
          const payload = buildTicketQrPayload(t.secureToken);
          qrDataUrl = await generateQrDataUrl(payload);
        }
        const template = resolveTicketTemplate(t);
        return {
          ...t,
          templateIndex: template.id,
          template,
          qrDataUrl,
          shareUrl: `/ticket/${t.secureToken}`,
        };
      })
    );

    order.tickets = ticketsWithQr;

    return NextResponse.json({
      order,
      bankInfo: result.bankInfo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
