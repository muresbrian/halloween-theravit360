"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import {
  Search,
  Ticket,
  ExternalLink,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Mail,
  CheckCircle2,
} from "lucide-react";

function MisBoletosContent() {
  const searchParams = useSearchParams();
  const initialFolio = searchParams.get("folio") || "";
  const initialQuery = searchParams.get("query") || "";
  const initialCode = searchParams.get("codigo") || searchParams.get("code") || "";

  const [folio, setFolio] = useState(initialFolio);
  const [query, setQuery] = useState(initialQuery);
  const [claimCodeInput, setClaimCodeInput] = useState(initialCode);

  const [searching, setSearching] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado para desbloquear órdenes individuales
  const [orderClaimCodes, setOrderClaimCodes] = useState<Record<string, string>>({});
  const [unlockingFolio, setUnlockingFolio] = useState<string | null>(null);
  const [unlockErrors, setUnlockErrors] = useState<Record<string, string>>({});

  // Búsqueda principal
  async function performSearch(f: string, q: string, c?: string) {
    if (!f.trim() && !q.trim()) {
      setErrorMessage("Por favor ingresa tu folio o tu correo/teléfono.");
      return;
    }

    setSearching(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/public/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folio: f.trim(),
          query: q.trim(),
          claimCode: c ? c.trim().toUpperCase() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "No se encontraron órdenes.");
        setOrders([]);
        return;
      }

      const foundOrders = data.orders || [];
      setOrders(foundOrders);

      if (foundOrders.length === 0) {
        setErrorMessage("No encontramos ninguna orden con los datos ingresados.");
      } else {
        // Si alguna orden resultó desbloqueada mediante el código en URL, celebrar con confetti
        const hasUnlockedPaid = foundOrders.some((o: any) => o.status === "PAGADA" && o.unlocked);
        if (hasUnlockedPaid) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#b91c1c", "#f4ebd0", "#10b981", "#ffffff"],
            });
          } catch {
            // no-op
          }
        }
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión: " + err.message);
    } finally {
      setSearching(false);
    }
  }

  // Auto-buscar si los parámetros vienen en la URL
  useEffect(() => {
    if (initialFolio || initialQuery) {
      performSearch(initialFolio, initialQuery, initialCode);
    }
    if (initialFolio && initialCode) {
      setOrderClaimCodes((prev) => ({ ...prev, [initialFolio.toUpperCase()]: initialCode.toUpperCase() }));
    }
  }, []);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch(folio, query, claimCodeInput);
  }

  // Desbloquear una orden pagada específica mediante su código alfanumérico
  async function handleUnlockOrder(targetFolio: string) {
    const code = (orderClaimCodes[targetFolio] || "").trim().toUpperCase();
    if (!code) {
      setUnlockErrors((prev) => ({ ...prev, [targetFolio]: "Ingresa el código alfanumérico." }));
      return;
    }

    setUnlockingFolio(targetFolio);
    setUnlockErrors((prev) => ({ ...prev, [targetFolio]: "" }));

    try {
      const res = await fetch("/api/public/orders/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folio: targetFolio,
          claimCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUnlockErrors((prev) => ({
          ...prev,
          [targetFolio]: data.error || "Código incorrecto. Verifica el correo que recibiste.",
        }));
        return;
      }

      // Actualizar la orden en la lista local con los boletos desbloqueados
      setOrders((prev) => {
        if (!prev) return prev;
        return prev.map((ord) => {
          if (ord.folio.toUpperCase() === targetFolio.toUpperCase()) {
            return {
              ...ord,
              unlocked: true,
              requiresClaimCode: false,
              tickets: data.tickets || ord.tickets,
            };
          }
          return ord;
        });
      });

      // Efecto visual de celebración
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#b91c1c", "#f4ebd0", "#10b981", "#ffffff"],
        });
      } catch {
        // no-op
      }
    } catch (err: any) {
      setUnlockErrors((prev) => ({
        ...prev,
        [targetFolio]: "Error al validar código: " + err.message,
      }));
    } finally {
      setUnlockingFolio(null);
    }
  }

  return (
    <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#f4ebd0] font-mono font-bold">
          PORTAL DEL ASISTENTE • SEGURIDAD 2-PASOS
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-2">
          Consultar Mis Boletos
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto font-light leading-relaxed">
          Ingresa tu folio de orden (ej. <span className="font-mono text-zinc-300">HAL-2026-0042</span>) o el correo con el que realizaste tu compra para consultar tus boletos.
        </p>
      </div>

      {/* Buscador */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0b12] border border-zinc-800 mb-8 shadow-xl">
        <form onSubmit={handleFormSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 font-mono flex items-center justify-between">
              <span>Código Alfanumérico de Desbloqueo (Opcional)</span>
              <span className="text-[10px] text-zinc-500 font-sans normal-case">Enviado a tu correo al validar pago</span>
            </label>
            <input
              type="text"
              placeholder="Ej. THV-84A92K"
              value={claimCodeInput}
              onChange={(e) => setClaimCodeInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl bg-[#14121a] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none text-[#f4ebd0] text-sm font-mono uppercase tracking-wider"
            />
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
          <h2 className="text-xl font-bold text-white flex items-center justify-between">
            <span>Órdenes Encontradas ({orders.length})</span>
          </h2>

          {orders.map((ord) => {
            const isPaid = ord.status === "PAGADA";
            const isUnlocked = ord.unlocked !== false;

            return (
              <div
                key={ord.folio}
                className="p-6 sm:p-8 rounded-3xl bg-[#14121d] border border-red-700/20 space-y-6 shadow-xl"
              >
                {/* Cabecera de la Orden */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-mono uppercase block">FOLIO DE ORDEN</span>
                    <span className="text-2xl font-black text-[#f4ebd0] font-mono tracking-tight">{ord.folio}</span>
                    <span className="text-xs text-zinc-400 block mt-1">
                      {ord.quantity} Boletos • Total: ${ord.totalAmount} MXN
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full font-mono ${
                        isPaid
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                          : ord.status === "COMPROBANTE_RECIBIDO"
                          ? "bg-amber-950/80 text-amber-300 border border-amber-500/30"
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

                {/* Si la orden está PAGADA pero BLOQUEADA: Card de Seguridad */}
                {isPaid && !isUnlocked && (
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1b101c] to-[#110d18] border border-red-600/40 shadow-xl space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-red-950/90 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-[#f4ebd0] uppercase tracking-wide">
                          Boletos Protegidos con Código de Seguridad
                        </h4>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          Por seguridad, para prevenir que terceros descarguen tus boletos, ingresa el <strong>código alfanumérico</strong> (ej. <span className="font-mono text-red-300 font-bold">THV-XXXXXX</span>) que enviamos a tu correo electrónico al aprobar tu pago.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <input
                        type="text"
                        placeholder="THV-XXXXXX"
                        value={orderClaimCodes[ord.folio] || ""}
                        onChange={(e) =>
                          setOrderClaimCodes({
                            ...orderClaimCodes,
                            [ord.folio]: e.target.value.toUpperCase(),
                          })
                        }
                        className="flex-1 px-4 py-3 rounded-xl bg-[#0e0c14] border border-red-900/60 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none text-[#f4ebd0] text-sm font-mono uppercase tracking-widest font-bold placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        disabled={unlockingFolio === ord.folio || !(orderClaimCodes[ord.folio] || "").trim()}
                        onClick={() => handleUnlockOrder(ord.folio)}
                        className="px-6 py-3 rounded-xl bg-[#b91c1c] hover:bg-red-700 disabled:opacity-40 text-[#f4ebd0] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-500/40 shadow-lg shadow-red-950/50"
                      >
                        {unlockingFolio === ord.folio ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#f4ebd0]" />
                            <span>Validando...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            <span>Desbloquear Boletos</span>
                          </>
                        )}
                      </button>
                    </div>

                    {unlockErrors[ord.folio] && (
                      <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{unlockErrors[ord.folio]}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                      <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Revisa tu bandeja de entrada o spam. También puedes abrir el enlace directo incluido en el correo.</span>
                    </div>
                  </div>
                )}

                {/* Si la orden está PAGADA y DESBLOQUEADA: Notificación verde */}
                {isPaid && isUnlocked && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold">Boletos Desbloqueados y Autenticados</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400/80">Código Verificado ✓</span>
                  </div>
                )}

                {/* Lista de Boletos Individuales */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#f4ebd0] font-bold mb-3 flex items-center justify-between">
                    <span>Boletos Individuales ({ord.tickets?.length || ord.quantity})</span>
                    {!isUnlocked && isPaid && (
                      <span className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Requiere Código para Acceso
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(ord.tickets || []).map((tkt: any) => {
                      const canAccess = isUnlocked && Boolean(tkt.secureToken);

                      return (
                        <div
                          key={tkt.ticketNumber}
                          className="p-4 rounded-2xl bg-[#18141f] border border-zinc-800 flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-xs font-mono font-bold text-white block">
                              {tkt.ticketNumber}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {tkt.attendeeName || "Invitado"}
                            </span>
                          </div>

                          {canAccess ? (
                            <a
                              href={`/ticket/${tkt.secureToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-[#f4ebd0] border border-red-700/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Abrir pase digital en nueva pestaña"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                              <span>Ver Pase</span>
                            </a>
                          ) : (
                            <div
                              className="px-3 py-1.5 rounded-lg bg-zinc-900/80 text-zinc-500 border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed"
                              title="Debes validar el código alfanumérico para abrir este pase"
                            >
                              <Lock className="w-3 h-3 text-zinc-500" />
                              <span>Bloqueado</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function MisBoletosPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f6] flex flex-col selection:bg-[#b91c1c] selection:text-white">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-[#f4ebd0]" />
          </div>
        }
      >
        <MisBoletosContent />
      </Suspense>
      <Footer />
    </div>
  );
}
