import { NextResponse } from "next/server";
import { z } from "zod";
import { callAppsScript } from "@/lib/sheets-api";

const ReserveSchema = z.object({
  ticketTypeId: z.string().min(1, "Debe seleccionar un tipo de boleto"),
  quantity: z.number().int().min(1, "Mínimo 1 boleto").max(20, "Máximo permitido superado"),
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z.string().trim().email("Correo electrónico no válido"),
  phone: z.string().trim().min(7, "Teléfono no válido"),
  notes: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalizar nombre si envían firstName y lastName
    if (!body.name && body.firstName) {
      body.name = `${body.firstName} ${body.lastName || ""}`.trim();
    }

    const validated = ReserveSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Datos incompletos o inválidos", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await callAppsScript("reserveOrder", validated.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "No fue posible apartar los boletos." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Boletos apartados exitosamente",
      order: {
        folio: result.folio,
        orderAccessToken: result.orderAccessToken,
        totalAmount: result.totalAmount,
        quantity: result.quantity,
        expiresAt: result.expiresAt,
        tickets: result.tickets,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
