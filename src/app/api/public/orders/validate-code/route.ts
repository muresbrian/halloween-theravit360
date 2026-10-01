import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";

export async function POST(req: Request) {
  try {
    const { folio, claimCode } = await req.json();

    if (!folio || !claimCode) {
      return NextResponse.json(
        { error: "Debes proporcionar el folio y el código alfanumérico." },
        { status: 400 }
      );
    }

    const result = await callAppsScript("validateClaimCode", {
      folio: folio.trim().toUpperCase(),
      claimCode: claimCode.trim().toUpperCase(),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Código no válido." }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
