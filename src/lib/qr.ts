import QRCode from "qrcode";

export const PARCHMENT_BG_COLOR = "#d29f68";
export const INK_DARK_COLOR = "#120406";

/**
 * Genera un DataURL en base64 de un código QR integrado al tono pergamino del boleto de circo.
 */
export async function generateQrDataUrl(
  payload: string,
  options?: { parchmentTheme?: boolean; margin?: number; width?: number }
): Promise<string> {
  const useParchment = options?.parchmentTheme ?? true;
  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: options?.margin ?? 1,
    width: options?.width ?? 320,
    color: {
      dark: INK_DARK_COLOR,
      light: useParchment ? PARCHMENT_BG_COLOR : "#ffffff",
    },
  });
}

/**
 * Genera un SVG string del código QR para renderizado nítido o descarga vectorial.
 */
export async function generateQrSvg(payload: string): Promise<string> {
  return await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#09090c",
      light: "#ffffff",
    },
  });
}

/**
 * Construye el payload estándar del código QR para un boleto individual.
 */
export function buildTicketQrPayload(secureToken: string, appUrl?: string): string {
  const base = appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/ticket/${secureToken}`;
}

/**
 * Extrae el secureToken de un escaneo QR, soportando:
 * 1. URL completa: https://dominio.com/ticket/abcdef123456
 * 2. Formato prefijado: HAL:TKT:abcdef123456
 * 3. Token directo: abcdef123456
 */
export function extractTokenFromScan(scannedText: string): string {
  const trimmed = scannedText.trim();

  // Caso 1: URL con /ticket/[token]
  const ticketUrlMatch = trimmed.match(/\/ticket\/([a-zA-Z0-9_-]+)/);
  if (ticketUrlMatch && ticketUrlMatch[1]) {
    return ticketUrlMatch[1];
  }

  // Caso 2: Formato HAL:TKT:[token]
  if (trimmed.startsWith("HAL:TKT:")) {
    return trimmed.replace("HAL:TKT:", "").trim();
  }

  // Caso 3: Token directo
  return trimmed;
}
