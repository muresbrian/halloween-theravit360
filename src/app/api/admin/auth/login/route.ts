import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/sheets-api";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Debe ingresar correo y contraseña." }, { status: 400 });
    }

    const result = await callAppsScript("adminLogin", { email, password });
    if (!result.success || !result.admin) {
      return NextResponse.json({ error: result.error || "Credenciales incorrectas" }, { status: 401 });
    }

    const admin = result.admin;
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const sessionToken = signToken({
      adminId: admin.adminId,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      exp,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        adminId: admin.adminId,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
