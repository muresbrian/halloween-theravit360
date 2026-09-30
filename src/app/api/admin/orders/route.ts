import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { callAppsScript } from "@/lib/sheets-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role === "SCANNER") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const result = await callAppsScript("getAdminOrders");
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al obtener órdenes" }, { status: 500 });
    }

    return NextResponse.json({
      orders: result.orders || [],
      payments: result.payments || [],
      customers: result.customers || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
