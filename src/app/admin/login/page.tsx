"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, AlertCircle, Loader2, Sparkles, QrCode, Crown } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@theravit360.com");
  const [password, setPassword] = useState("AdminHalloween2026!");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // Redirección según rol
      if (data.admin?.role === "SCANNER") {
        router.push("/admin/scanner");
      } else if (data.admin?.role === "SUPERADMIN") {
        router.push("/admin/config");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión: " + err.message);
      setLoading(false);
    }
  }

  function setDemoCredentials(role: "superadmin" | "admin" | "scanner") {
    if (role === "superadmin") {
      setEmail("superadmin@theravit360.com");
      setPassword("SuperAdminHalloween2026!");
    } else if (role === "admin") {
      setEmail("admin@theravit360.com");
      setPassword("AdminHalloween2026!");
    } else {
      setEmail("puerta@theravit360.com");
      setPassword("Puerta2026!");
    }
  }

  return (
    <div className="min-h-screen bg-[#07060a] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-orange-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">🎃</span>
            <span className="font-extrabold text-2xl tracking-wider text-white">THERAVIT360</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-200">Panel de Control & Staff</h1>
          <p className="text-xs text-zinc-400 mt-1">Ingresa con tus credenciales administrativas asignadas.</p>
        </div>

        <div className="p-8 rounded-3xl bg-[#12101b] border border-orange-500/20 shadow-2xl shadow-black">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 font-mono">
                Correo Administrativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 font-mono">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Entrar al Panel"
              )}
            </button>
          </form>

          {/* Cuentas de Demostración Rápidas */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 block mb-2 text-center">
              Accesos Demo Rápidos (Google Sheets)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("superadmin")}
                className="py-2 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Superadmin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                className="py-2 px-2.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("scanner")}
                className="py-2 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                Staff Puerta
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Regresar al sitio público
          </Link>
        </div>
      </div>
    </div>
  );
}
