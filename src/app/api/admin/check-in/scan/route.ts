import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { callAppsScript } from "@/lib/sheets-api";
import { extractTokenFromScan } from "@/lib/qr";

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado para escanear boletos" }, { status: 401 });
    }

    const body = await req.json();
    const rawCode = (body.secureToken || body.code || "").trim();
    if (!rawCode) {
      return NextResponse.json({ error: "No se proporcionó ningún código QR" }, { status: 400 });
    }

    const cleanToken = extractTokenFromScan(rawCode);

    const result = await callAppsScript("checkInScan", {
      secureToken: cleanToken,
      operatorName: admin.name,
      method: body.method || "QR_CAMERA",
      deviceInfo: body.deviceInfo || "Scanner Móvil",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
