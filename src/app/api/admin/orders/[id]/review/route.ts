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
    const body = await req.json();

    const result = await callAppsScript("reviewPayment", {
      orderId: id,
      decision: body.decision, // 'APPROVE' o 'REJECT'
      rejectionReason: body.rejectionReason,
      reviewerName: admin.name,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al procesar la revisión" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
