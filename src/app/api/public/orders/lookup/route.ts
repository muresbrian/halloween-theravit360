import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";

export async function POST(req: Request) {
  try {
    const { folio, query } = await req.json();

    if (!folio && !query) {
      return NextResponse.json({ error: "Debe ingresar su folio o correo / teléfono." }, { status: 400 });
    }

    const result = await callAppsScript("lookupOrders", { folio, query });
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al buscar órdenes" }, { status: 400 });
    }

    return NextResponse.json({
      orders: result.orders || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
