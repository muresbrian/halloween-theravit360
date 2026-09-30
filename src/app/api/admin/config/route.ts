import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { callAppsScript } from "@/lib/sheets-api";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role === "SCANNER") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const result = await callAppsScript("getAdminConfig");
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al obtener configuración" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: result.config,
      ticketTypes: result.ticketTypes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Acceso exclusivo para SUPERADMIN. No tienes permisos para alterar precios o configuración." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { config, ticketTypes } = body;

    // Actualizar configuración de evento, banco, contacto
    if (config && typeof config === "object") {
      const configRes = await callAppsScript("updateConfig", {
        config,
        actor: admin.name || "SUPERADMIN",
      });
      if (!configRes.success) {
        return NextResponse.json({ error: configRes.error || "Error al guardar configuración" }, { status: 500 });
      }
    }

    // Actualizar tipos de boletos (precios, aforo, reglas)
    if (ticketTypes && Array.isArray(ticketTypes)) {
      const ticketRes = await callAppsScript("updateTicketTypes", {
        ticketTypes,
        actor: admin.name || "SUPERADMIN",
      });
      if (!ticketRes.success) {
        return NextResponse.json({ error: ticketRes.error || "Error al actualizar tipos de boletos" }, { status: 500 });
      }
    }

    // Obtener estado consolidado actualizado
    const refreshed = await callAppsScript("getAdminConfig");

    return NextResponse.json({
      success: true,
      message: "Configuración y boletos actualizados exitosamente en tiempo real.",
      config: refreshed.config,
      ticketTypes: refreshed.ticketTypes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
