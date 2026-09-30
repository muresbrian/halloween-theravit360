import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { callAppsScript } from "@/lib/sheets-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (admin.role === "SCANNER") {
      return NextResponse.json({ error: "Acceso no permitido para rol SCANNER" }, { status: 403 });
    }

    const result = await callAppsScript("getDashboardStats");
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al obtener estadísticas" }, { status: 500 });
    }

    return NextResponse.json({ stats: result.stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
