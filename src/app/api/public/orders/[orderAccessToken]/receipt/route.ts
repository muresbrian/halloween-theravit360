import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderAccessToken: string }> }
) {
  try {
    const { orderAccessToken } = await params;
    const formData = await req.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Debe seleccionar un archivo de comprobante." }, { status: 400 });
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no válido. Solo se admiten imágenes JPG, PNG o documentos PDF." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no debe superar 10 MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileDataBase64 = buffer.toString("base64");

    const result = await callAppsScript("uploadReceipt", {
      orderAccessToken: orderAccessToken.trim(),
      fileName: file.name,
      mimeType: file.type,
      fileData: fileDataBase64,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al subir comprobante" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Comprobante recibido con éxito",
      receiptUrl: result.receiptUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
