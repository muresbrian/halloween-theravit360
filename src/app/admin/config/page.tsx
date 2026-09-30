"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Ticket,
  Building,
  CreditCard,
  Phone,
  Mail,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Crown,
  Sparkles,
} from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
  reserved: number;
  active: boolean;
  maxPerOrder: number;
}

interface EventConfig {
  eventName?: string;
  eventSubtitle?: string;
  eventDescription?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventAddress?: string;
  eventMapUrl?: string;
  eventMinAge?: string;
  eventDressCode?: string;
  eventRules?: string;
  bankName?: string;
  bankHolder?: string;
  bankClabe?: string;
  bankAccount?: string;
  transferInstructions?: string;
  reservationDurationMinutes?: string;
  contactWhatsApp?: string;
  contactEmail?: string;
  [key: string]: any;
}

export default function SuperadminConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"event" | "tickets" | "bank" | "rules">("tickets");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [config, setConfig] = useState<EventConfig>({});
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo cargar la configuración.");
      }
      setConfig(data.config || {});
      setTicketTypes(data.ticketTypes || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleConfigChange(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleTicketTypeChange(index: number, field: keyof TicketType, value: any) {
    setTicketTypes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addNewTicketType() {
    const newId = `TT-CUSTOM-${Date.now().toString().slice(-4)}`;
    setTicketTypes((prev) => [
      ...prev,
      {
        id: newId,
        name: "NUEVO TIPO DE BOLETO",
        description: "Acceso exclusivo con beneficios específicos.",
        price: 600,
        quantity: 100,
        sold: 0,
        reserved: 0,
        active: true,
        maxPerOrder: 6,
      },
    ]);
  }

  function removeTicketType(index: number) {
    const target = ticketTypes[index];
    if (target.sold > 0) {
      alert("No se puede eliminar esta categoría porque ya tiene boletos vendidos.");
      return;
    }
    if (confirm(`¿Estás seguro de eliminar la categoría "${target.name}"?`)) {
      setTicketTypes((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    // Validación básica de boletos
    for (const tt of ticketTypes) {
      if (Number(tt.price) < 0) {
        setMessage({ type: "error", text: `El precio para ${tt.name} no puede ser negativo.` });
        setSaving(false);
        return;
      }
      if (Number(tt.quantity) < Number(tt.sold || 0)) {
        setMessage({
          type: "error",
          text: `La cantidad total para ${tt.name} (${tt.quantity}) no puede ser menor a los ya vendidos (${tt.sold}).`,
        });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          ticketTypes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al guardar los cambios.");
      }

      setConfig(data.config);
      setTicketTypes(data.ticketTypes);
      setMessage({
        type: "success",
        text: "✓ ¡Cambios guardados con éxito! Los nuevos precios, aforos y datos ya están en vivo.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Cargando panel de configuración de Superadmin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 inline-flex">
              <Crown className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
              Consola de Superadmin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Configuración Total del Evento</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Administra precios de boletos, capacidad de aforo, cuentas de transferencia y detalles oficiales en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchConfig}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Descartar / Recargar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Navegador de Pestañas */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "tickets"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Ticket className="w-4 h-4" />
          Boletos, Precios & Aforo
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/30 text-[10px] text-amber-200">
            {ticketTypes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("bank")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "bank"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Building className="w-4 h-4" />
          Cuentas Bancarias & Transferencias
        </button>

        <button
          onClick={() => setActiveTab("event")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "event"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Información del Evento
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "rules"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Clock className="w-4 h-4" />
          Reglas de Venta & Soporte
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}

      {/* PESTAÑA 1: BOLETOS Y PRECIOS */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Categorías de Boletos Disponibles</h2>
              <p className="text-xs text-zinc-400">
                Ajusta el precio, cupo total de boletos y límites de compra por usuario.
              </p>
            </div>
            <button
              type="button"
              onClick={addNewTicketType}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ticketTypes.map((tkt, idx) => {
              const available = Math.max(0, Number(tkt.quantity) - (Number(tkt.sold || 0) + Number(tkt.reserved || 0)));
              return (
                <div
                  key={tkt.id || idx}
                  className="p-6 rounded-3xl bg-[#12101b] border border-orange-500/20 shadow-xl space-y-5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{tkt.id}</span>
                      <input
                        type="text"
                        value={tkt.name}
                        onChange={(e) => handleTicketTypeChange(idx, "name", e.target.value)}
                        className="w-full text-base font-extrabold text-white bg-transparent border-b border-zinc-700 focus:border-amber-400 focus:outline-none pb-1"
                        placeholder="Nombre de la categoría"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tkt.active}
                          onChange={(e) => handleTicketTypeChange(idx, "active", e.target.checked)}
                          className="rounded text-amber-500 focus:ring-amber-500 bg-zinc-800 border-zinc-700"
                        />
                        <span className={tkt.active ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                          {tkt.active ? "Activo" : "Pausado"}
                        </span>
                      </label>
                      {ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(idx)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Descripción de Beneficios
                    </label>
                    <textarea
                      rows={2}
                      value={tkt.description}
                      onChange={(e) => handleTicketTypeChange(idx, "description", e.target.value)}
                      className="w-full text-xs rounded-xl bg-[#1a1726] border border-zinc-800 p-2.5 text-zinc-200 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Grid de Precio y Cantidad */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-amber-400" /> Precio (MXN)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={tkt.price}
                        onChange={(e) => handleTicketTypeChange(idx, "price", e.target.value)}
                        className="w-full text-lg font-extrabold text-amber-300 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1">
                        <Ticket className="w-3 h-3 text-orange-400" /> Aforo Total
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tkt.quantity}
                        onChange={(e) => handleTicketTypeChange(idx, "quantity", e.target.value)}
                        className="w-full text-lg font-extrabold text-orange-300 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Máx por Orden
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={tkt.maxPerOrder || 10}
                        onChange={(e) => handleTicketTypeChange(idx, "maxPerOrder", e.target.value)}
                        className="w-full text-lg font-extrabold text-zinc-300 bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Barra de Estado de Inventario */}
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex gap-4">
                      <span>
                        Vendidos: <strong className="text-emerald-400">{tkt.sold || 0}</strong>
                      </span>
                      <span>
                        En proceso: <strong className="text-amber-400">{tkt.reserved || 0}</strong>
                      </span>
                    </div>
                    <div>
                      Disponibles:{" "}
                      <strong className={available > 0 ? "text-white" : "text-red-400 font-extrabold"}>
                        {available > 0 ? available : "AGOTADO"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CUENTAS BANCARIAS */}
      {activeTab === "bank" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-orange-500/20 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-orange-400" />
              Datos Bancarios Oficiales para Transferencias
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Esta información se le muestra al usuario inmediatamente después de reservar boletos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Nombre del Banco</label>
              <input
                type="text"
                value={config.bankName || ""}
                onChange={(e) => handleConfigChange("bankName", e.target.value)}
                placeholder="ej. BBVA Bancomer"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
                Titular / Razón Social
              </label>
              <input
                type="text"
                value={config.bankHolder || ""}
                onChange={(e) => handleConfigChange("bankHolder", e.target.value)}
                placeholder="ej. Theravit360 Eventos S.A. de C.V."
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
                CLABE Interbancaria (18 dígitos)
              </label>
              <input
                type="text"
                maxLength={18}
                value={config.bankClabe || ""}
                onChange={(e) => handleConfigChange("bankClabe", e.target.value.replace(/\s+/g, ""))}
                placeholder="ej. 012180001234567890"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-amber-300 font-mono text-sm tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
                Número de Cuenta (Opcional)
              </label>
              <input
                type="text"
                value={config.bankAccount || ""}
                onChange={(e) => handleConfigChange("bankAccount", e.target.value)}
                placeholder="ej. 0123456789"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
              Instrucciones Especiales para el Comprador
            </label>
            <textarea
              rows={3}
              value={config.transferInstructions || ""}
              onChange={(e) => handleConfigChange("transferInstructions", e.target.value)}
              placeholder="Indica al cliente qué poner en el concepto de pago (por ejemplo: tu folio HAL-2026-XXXX)."
              className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
            />
          </div>
        </div>
      )}

      {/* PESTAÑA 3: INFORMACIÓN DEL EVENTO */}
      {activeTab === "event" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-orange-500/20 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              Detalles Públicos del Evento
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Estos textos se exhiben en la Landing Page principal y en el encabezado de los boletos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Nombre Oficial</label>
              <input
                type="text"
                value={config.eventName || ""}
                onChange={(e) => handleConfigChange("eventName", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Subtítulo / Lema</label>
              <input
                type="text"
                value={config.eventSubtitle || ""}
                onChange={(e) => handleConfigChange("eventSubtitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Fecha Visible</label>
              <input
                type="text"
                value={config.eventDate || ""}
                onChange={(e) => handleConfigChange("eventDate", e.target.value)}
                placeholder="ej. 31 de Octubre, 2026"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Horario</label>
              <input
                type="text"
                value={config.eventTime || ""}
                onChange={(e) => handleConfigChange("eventTime", e.target.value)}
                placeholder="ej. 20:00 - 04:00 hrs"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Lugar / Recinto</label>
              <input
                type="text"
                value={config.eventLocation || ""}
                onChange={(e) => handleConfigChange("eventLocation", e.target.value)}
                placeholder="ej. Mansión Theravit Club"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Dirección Física</label>
              <input
                type="text"
                value={config.eventAddress || ""}
                onChange={(e) => handleConfigChange("eventAddress", e.target.value)}
                placeholder="ej. Av. Insurgentes Sur #1234, CDMX"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-red-600 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Enlace Google Maps (URL)</label>
              <input
                type="url"
                value={config.eventMapUrl || ""}
                onChange={(e) => handleConfigChange("eventMapUrl", e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-red-600 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Edad Mínima</label>
              <input
                type="text"
                value={config.eventMinAge || "18+"}
                onChange={(e) => handleConfigChange("eventMinAge", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Código de Vestimenta</label>
              <input
                type="text"
                value={config.eventDressCode || ""}
                onChange={(e) => handleConfigChange("eventDressCode", e.target.value)}
                placeholder="ej. Disfraz Temático Obligatorio"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">Descripción Detallada</label>
            <textarea
              rows={3}
              value={config.eventDescription || ""}
              onChange={(e) => handleConfigChange("eventDescription", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
              Reglamento y Políticas de Acceso
            </label>
            <textarea
              rows={4}
              value={config.eventRules || ""}
              onChange={(e) => handleConfigChange("eventRules", e.target.value)}
              placeholder="Un punto por línea..."
              className="w-full px-4 py-3 rounded-xl bg-[#1a1726] border border-zinc-800 focus:border-orange-500 focus:outline-none text-white text-sm font-mono text-xs"
            />
          </div>
        </div>
      )}

      {/* PESTAÑA 4: REGLAS DE VENTA Y CONTACTO */}
      {activeTab === "rules" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-orange-500/20 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Parámetros de Operación y Soporte
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Controla el tiempo que se reservan los boletos antes de expirar y los canales de atención al cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-400" /> Tiempo de Reserva (Minutos)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={config.reservationDurationMinutes || "15"}
                onChange={(e) => handleConfigChange("reservationDurationMinutes", e.target.value)}
                className="w-full text-2xl font-extrabold text-amber-400 bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 block mt-1">
                Tiempo que tiene el comprador para pagar antes de que se liberen sus boletos.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 flex items-center gap-1">
                <Phone className="w-4 h-4 text-emerald-400" /> WhatsApp Oficial
              </label>
              <input
                type="text"
                value={config.contactWhatsApp || ""}
                onChange={(e) => handleConfigChange("contactWhatsApp", e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full text-sm font-bold text-white bg-transparent focus:outline-none mt-2"
              />
              <span className="text-[10px] text-zinc-500 block mt-2">
                Utilizado para el botón de dudas y para el enlace de compartir boletos.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 flex items-center gap-1">
                <Mail className="w-4 h-4 text-orange-400" /> Email de Aclaraciones
              </label>
              <input
                type="email"
                value={config.contactEmail || ""}
                onChange={(e) => handleConfigChange("contactEmail", e.target.value)}
                placeholder="boletos@theravit360.com"
                className="w-full text-sm font-bold text-white bg-transparent focus:outline-none mt-2"
              />
              <span className="text-[10px] text-zinc-500 block mt-2">
                Correo exhibido al final de la página para soporte.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante inferior para guardar rápido en pantallas móviles */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-2xl flex items-center gap-2 text-xs"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
