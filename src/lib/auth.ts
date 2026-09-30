import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET || "halloween_default_secret_key_change_in_prod";

export interface SessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: "SUPERADMIN" | "ADMIN" | "SCANNER";
  exp: number;
}

export function signToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (signature !== expectedSignature) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  if (!sessionCookie) return null;

  const payload = verifyToken(sessionCookie);
  if (!payload) return null;

  return payload;
}
