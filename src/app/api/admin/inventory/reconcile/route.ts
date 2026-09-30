import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { callAppsScript } from "@/lib/sheets-api";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role === "SCANNER") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const result = await callAppsScript("reconcileInventory");
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al reconciliar inventario" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reconciliation: result.reconciliation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
