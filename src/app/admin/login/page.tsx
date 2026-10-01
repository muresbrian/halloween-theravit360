"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="min-h-screen bg-[#07060a] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-red-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">🎃</span>
            <span className="font-extrabold text-2xl tracking-wider text-white">THERAVIT360</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-200">Panel de Control & Staff</h1>
          <p className="text-xs text-zinc-400 mt-1">Ingresa con tus credenciales administrativas asignadas.</p>
        </div>

        <div className="p-8 rounded-3xl bg-[#12101b] border border-red-500/20 shadow-2xl shadow-black">
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
                  placeholder="admin@theravit360.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-red-500 focus:outline-none text-white text-sm placeholder:text-zinc-600"
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
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-red-500 focus:outline-none text-white text-sm placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-500 shadow-lg shadow-red-950/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-red-500/40"
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
