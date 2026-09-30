import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await callAppsScript("getConfig");
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al obtener configuración" }, { status: 500 });
    }
    return NextResponse.json({
      settings: result.config,
      ticketTypes: result.ticketTypes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
