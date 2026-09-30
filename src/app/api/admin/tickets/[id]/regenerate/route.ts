import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { callAppsScript } from "@/lib/sheets-api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role === "SCANNER") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await callAppsScript("regenerateToken", {
      ticketId: id,
      reason: body.reason || "Reemisión de QR extraviado",
      adminName: admin.name,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al regenerar código QR" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      newSecureToken: result.newSecureToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
