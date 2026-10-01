"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Ticket,
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Loader2,
  Clock,
  ShieldCheck,
} from "lucide-react";

function ApartarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTypeId = searchParams.get("tipo") || "";

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState(initialTypeId);
  const [quantity, setQuantity] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/public/config");
        const data = await res.json();
        const validTypes = (data.ticketTypes || []).filter(
          (t: any) => t.id === "TT-GEN" || !t.name.toUpperCase().includes("VIP")
        );
        const typesToUse = validTypes.length > 0 ? validTypes : data.ticketTypes || [];
        if (typesToUse.length > 0) {
          setTicketTypes(typesToUse);
          if (!selectedTypeId || !typesToUse.some((t: any) => t.id === selectedTypeId)) {
            setSelectedTypeId(typesToUse[0].id);
          }
        }
      } catch (e) {
        console.error("Error loading config:", e);
      } finally {
        setLoadingConfig(false);
      }
    }
    load();
  }, [selectedTypeId]);

  const selectedType = ticketTypes.find((t) => t.id === selectedTypeId) || ticketTypes[0];
  const maxQty = selectedType ? Math.min(selectedType.maxPerOrder || 10, selectedType.available || 1) : 1;
  const totalAmount = selectedType ? selectedType.price * quantity : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage("Por favor llena todos los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/orders/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketTypeId: selectedTypeId,
          quantity: Number(quantity),
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          notes: formData.notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "No se pudo realizar el apartado. Intenta nuevamente.");
        setSubmitting(false);
        return;
      }

      // Redirigir a la pantalla de la orden protegida por token
      router.push(`/orden/${data.order.orderAccessToken}`);
    } catch (err: any) {
      setErrorMessage("Error de conexión al servidor: " + err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f6] flex flex-col selection:bg-[#b91c1c] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header Editorial de Compra */}
        <div className="mb-10 text-left sm:text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-700/40 text-[10px] font-mono uppercase tracking-[0.25em] text-[#f4ebd0]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>PASO 1 · SELECCIÓN Y REGISTRO</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Aparta Tus Entradas
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
            Tus boletos se reservarán temporalmente en tiempo real mientras realizas tu transferencia bancaria.
          </p>
        </div>

        {loadingConfig ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="text-xs text-zinc-400 font-mono">Sincronizando inventario en vivo...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Banner de Error */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECCIÓN 1: SELECCIONA TU ACCESO */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0b12] border border-zinc-800/80 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span className="text-red-500">01.</span> Selecciona el Tipo de Acceso
                </h2>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  INVENTARIO EN VIVO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ticketTypes.map((t) => {
                  const isSelected = t.id === selectedTypeId;
                  const isSoldOut = t.available <= 0;

                  return (
                    <div
                      key={t.id}
                      onClick={() => !isSoldOut && setSelectedTypeId(t.id)}
                      className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSoldOut
                          ? "opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-900"
                          : isSelected
                          ? "bg-[#160d11] border-red-600/80 shadow-xl shadow-red-950/40"
                          : "bg-[#09080e] border-zinc-800/90 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-extrabold text-white text-base uppercase tracking-wide">
                            {t.name}
                          </span>
                          <span className="text-xl font-mono font-extrabold text-[#f4ebd0]">
                            ${t.price} <span className="text-[10px] text-zinc-500 font-normal">MXN</span>
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">
                          {t.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-500">{t.id}</span>
                        {isSoldOut ? (
                          <span className="text-red-400 font-bold uppercase">Agotado</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">{t.available} disponibles</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selector de Cantidad */}
              {selectedType && (
                <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                      Cantidad de Boletos
                    </label>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Máximo {selectedType.maxPerOrder} accesos por compra.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-white font-bold flex items-center justify-center text-lg border border-zinc-800 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-xl font-mono text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      disabled={quantity >= maxQty}
                      className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-white font-bold flex items-center justify-center text-lg border border-zinc-800 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: TUS DATOS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0b12] border border-zinc-800/80 space-y-6">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span className="text-red-500">02.</span> Datos del Comprador
                </h2>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  A estos datos se vinculará tu folio oficial y podrás recuperar tus boletos en caso necesario.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Brian Mures"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#08070d] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#08070d] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                    WhatsApp / Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Ej. +52 55 1234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#08070d] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                    Notas especiales (Opcional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={2}
                      placeholder="Indica cualquier detalle o requerimiento especial..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#08070d] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none text-white text-sm font-light"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: RESUMEN & CONFIRMACIÓN */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0b12] border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#f4ebd0] font-mono font-bold block mb-1">
                    RESUMEN DE RESERVA
                  </span>
                  <div className="text-xl font-black text-white uppercase tracking-wide">
                    {quantity} × {selectedType ? selectedType.name : "Boleto"}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono block mt-1">
                    Cada boleto contará con un código QR único e individual.
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                    TOTAL DE LA ORDEN
                  </span>
                  <span className="text-3xl sm:text-4xl font-mono font-extrabold text-[#f4ebd0] block">
                    ${totalAmount} <span className="text-xs font-normal text-zinc-400">MXN</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>Bloqueo temporal de boletos por 15 minutos.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedType || selectedType.available < quantity}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-[#f4ebd0] bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 shadow-xl shadow-red-950/50 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#f4ebd0]" />
                      <span>Apartando boletos...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar y Ver Datos Bancarios</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ApartarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050507] text-zinc-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      }
    >
      <ApartarContent />
    </Suspense>
  );
}
