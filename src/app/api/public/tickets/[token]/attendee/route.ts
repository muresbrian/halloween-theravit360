import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    const result = await callAppsScript("updateAttendee", {
      secureToken: token.trim(),
      attendeeName: body.attendeeName,
      attendeePhone: body.attendeePhone,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al actualizar asistente" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Asistente actualizado con éxito",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
