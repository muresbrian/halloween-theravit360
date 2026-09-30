"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Ticket, ExternalLink, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function MisBoletosPage() {
  const [folio, setFolio] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!folio.trim() && !query.trim()) {
      setErrorMessage("Por favor ingresa tu folio o tu correo/teléfono.");
      return;
    }

    setSearching(true);
    setErrorMessage("");
    setOrders(null);

    try {
      const res = await fetch("/api/public/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folio: folio.trim(), query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "No se encontraron órdenes.");
        return;
      }

      setOrders(data.orders || []);
      if (!data.orders || data.orders.length === 0) {
        setErrorMessage("No encontramos ninguna orden con los datos ingresados.");
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión: " + err.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f6] flex flex-col selection:bg-[#b91c1c] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#f4ebd0] font-mono font-bold">
            PORTAL DEL ASISTENTE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-2">
            Consultar Mis Boletos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto font-light leading-relaxed">
            Ingresa tu folio de orden (ej. HAL-2026-0042) o el correo electrónico con el que realizaste tu compra.
          </p>
        </div>

        {/* Buscador */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0b12] border border-zinc-800 mb-8 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 font-mono">
                  Folio de la Orden
                </label>
                <input
                  type="text"
                  placeholder="Ej. HAL-2026-0042"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#14121a] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none text-white text-sm font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 font-mono">
                  O Tu Correo / Teléfono
                </label>
                <input
                  type="text"
                  placeholder="ejemplo@correo.com o 55 1234 5678"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#14121a] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={searching}
              className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-[#f4ebd0] bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 shadow-lg shadow-red-950/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#f4ebd0]" />
                  <span>Buscando en la base de datos...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar Mis Boletos</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {orders && orders.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Órdenes Encontradas ({orders.length})</h2>

            {orders.map((ord) => (
              <div key={ord.folio} className="p-6 sm:p-8 rounded-3xl bg-[#14121d] border border-red-700/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <span className="text-xs text-zinc-400 font-mono block">FOLIO</span>
                    <span className="text-xl font-black text-[#f4ebd0] font-mono">{ord.folio}</span>
                    <span className="text-xs text-zinc-400 block mt-1">
                      {ord.quantity} Boletos • Total: ${ord.totalAmount} MXN
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full font-mono ${
                        ord.status === "PAGADA"
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-950/80 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {ord.status}
                    </span>

                    <Link
                      href={`/orden/${ord.orderAccessToken}`}
                      className="px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/50 text-[#f4ebd0] border border-red-700/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      Ver Orden
                      <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                    </Link>
                  </div>
                </div>

                {/* Lista de Boletos Individuales */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#f4ebd0] font-bold mb-3">
                    Boletos Individuales de Esta Orden
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(ord.tickets || []).map((tkt: any) => (
                      <div
                        key={tkt.ticketNumber}
                        className="p-4 rounded-2xl bg-[#18141f] border border-zinc-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-xs font-mono font-bold text-white block">{tkt.ticketNumber}</span>
                          <span className="text-xs text-zinc-400">{tkt.attendeeName || "Invitado"}</span>
                        </div>

                        <a
                          href={`/ticket/${tkt.secureToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-[#f4ebd0] border border-red-700/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Abrir pase digital en nueva pestaña"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                          <span>Ver Pase</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
