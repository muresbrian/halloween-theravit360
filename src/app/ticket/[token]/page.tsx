"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Printer,
  Edit2,
  Check,
  AlertCircle,
  ShieldCheck,
  User,
  Loader2,
  Download,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { downloadTicketPdf, downloadTicketImage } from "@/lib/pdf-ticket";
import { resolveTicketTemplate } from "@/lib/ticket-templates";

export default function TicketPassPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [editingAttendee, setEditingAttendee] = useState(false);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [savingAttendee, setSavingAttendee] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImg, setDownloadingImg] = useState(false);

  const template = ticketData ? resolveTicketTemplate(ticketData) : null;

  async function loadTicket() {
    try {
      const res = await fetch(`/api/public/tickets/${token}`);
      const data = await res.json();
      if (!res.ok || !data.ticket) {
        setErrorMessage(data.error || "Boleto no encontrado.");
        setLoading(false);
        return;
      }
      setTicketData(data.ticket);
      setEventData(data.event);
      setAttendeeName(data.ticket.attendeeName || "");
      setAttendeePhone(data.ticket.attendeePhone || "");

      if (typeof window !== "undefined" && window.location.search.includes("print=true")) {
        setTimeout(() => {
          window.print();
        }, 800);
      }
    } catch (e: any) {
      setErrorMessage("Error de conexión: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!ticketData) return;
    try {
      setDownloadingPdf(true);
      await downloadTicketPdf({
        ticketNumber: ticketData.ticketNumber,
        attendeeName: ticketData.attendeeName,
        ticketTypeName: ticketData.ticketTypeName,
        eventName: eventData?.name,
        eventDate: eventData?.date,
        eventTime: eventData?.time,
        eventLocation: eventData?.location,
        qrDataUrl: ticketData.qrDataUrl,
        templateIndex: template?.id,
      });
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      alert("Hubo un error al generar el PDF. Puedes usar la opción Imprimir.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDownloadImage() {
    if (!ticketData) return;
    try {
      setDownloadingImg(true);
      const success = await downloadTicketImage({
        ticketNumber: ticketData.ticketNumber,
        attendeeName: ticketData.attendeeName,
        ticketTypeName: ticketData.ticketTypeName,
        eventName: eventData?.name,
        eventDate: eventData?.date,
        eventTime: eventData?.time,
        eventLocation: eventData?.location,
        qrDataUrl: ticketData.qrDataUrl,
        templateIndex: template?.id,
      });
      if (!success) {
        alert("No se pudo generar la imagen. Puedes descargar el boleto en PDF.");
      }
    } catch (err) {
      console.error("Error al descargar imagen:", err);
      alert("Error al generar la imagen. Puedes usar la opción Descargar PDF.");
    } finally {
      setDownloadingImg(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [token]);

  async function handleSaveAttendee(e: React.FormEvent) {
    e.preventDefault();
    setSavingAttendee(true);
    try {
      const res = await fetch(`/api/public/tickets/${token}/attendee`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeName, attendeePhone }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setEditingAttendee(false);
        setTimeout(() => setSavedSuccess(false), 3000);
        await loadTicket();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAttendee(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090c] text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <span className="text-sm font-mono text-zinc-400">Cargando pase digital...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMessage || !ticketData) {
    return (
      <div className="min-h-screen bg-[#09090c] text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Boleto no válido</h1>
          <p className="text-zinc-400 max-w-md text-sm">{errorMessage}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isUsed = ticketData.status === "UTILIZADO";
  const isPaid = ticketData.status === "PAGADO";
  const shareText = encodeURIComponent(
    `🎃 ¡Aquí está mi boleto digital para ${eventData?.name}!\nBoleto: ${ticketData.ticketNumber}\nEnlace: ${typeof window !== "undefined" ? window.location.href : ""}`
  );

  return (
    <div className="min-h-screen bg-[#050407] text-zinc-100 flex flex-col selection:bg-[#b91c1c] selection:text-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body, html {
                background: #09090c !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              main {
                padding-top: 5px !important;
                padding-bottom: 5px !important;
                max-width: 420px !important;
                margin: 0 auto !important;
              }
              .ticket-card {
                box-shadow: none !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `,
        }}
      />

      <div className="no-print">
        <Navbar />
      </div>

      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full">
        {/* Notificaciones */}
        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 no-print">
            <Check className="w-4 h-4 text-emerald-400" />
            Asistente actualizado con éxito.
          </div>
        )}

        {/* Tarjeta del Pase Digital */}
        <div className="ticket-card rounded-3xl overflow-hidden border border-red-700/50 bg-gradient-to-b from-[#140a0e] via-[#0d070a] to-[#060305] shadow-2xl shadow-red-950/40">
          {/* Header del Ticket */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/80 via-red-900/40 to-red-950/80 border-b border-red-700/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#f4ebd0] font-bold uppercase block">
                PASE DIGITAL OFICIAL • VOL. 4
              </span>
              <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                {eventData?.name}
              </h1>
            </div>
            <span className="text-2xl">🎪</span>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Metadatos superiores: Número y Estado */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 font-mono block">NÚMERO DE BOLETO</span>
                <span className="text-lg font-black text-[#f4ebd0] font-mono tracking-wider">
                  {ticketData.ticketNumber}
                </span>
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-mono ${
                  isUsed
                    ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    : isPaid
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                    : "bg-red-950/80 text-red-300 border border-red-500/40"
                }`}
              >
                {ticketData.status}
              </span>
            </div>

            {/* Ilustración Auténtica del Boleto con QR integrado en el espacio previsto */}
            <div className="relative mx-auto max-w-[310px] rounded-2xl overflow-hidden drop-shadow-[0_15px_30px_rgba(185,28,28,0.35)] transition-transform hover:scale-[1.01]">
              {template && (
                <>
                  <img
                    src={template.path}
                    alt={template.name}
                    className="w-full h-auto block select-none pointer-events-none"
                  />

                  {/* Recuadro de QR posicionado e integrado al tono pergamino del boleto */}
                  <div
                    className="absolute flex items-center justify-center pointer-events-auto"
                    style={{
                      left: `${template.centerXPercent}%`,
                      top: `${template.centerYPercent}%`,
                      width: `${template.sizePercentWidth}%`,
                      aspectRatio: "1 / 1",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {ticketData.qrDataUrl ? (
                      <div
                        className="w-full h-full rounded-sm flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: template.parchmentColor || "#d29f68" }}
                      >
                        <img
                          src={ticketData.qrDataUrl}
                          alt={`QR ${ticketData.ticketNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-800 font-mono">
                        Cargando QR...
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Insignia de Colección */}
            {template && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-red-950/40 border border-red-700/30 text-center">
                <span className="text-[10px] font-mono tracking-widest text-[#f4ebd0] font-bold uppercase block flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-red-400" />
                  BOLETO COLECCIONABLE (#{template.id} DE 7)
                </span>
                <span className="text-xs text-white font-extrabold mt-0.5 block">
                  {template.name} — <span className="text-red-400 font-normal">{template.character}</span>
                </span>
              </div>
            )}

            {/* Asistente */}
            <div className="p-4 rounded-2xl bg-[#1a0f14] border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block">ASISTENTE ASIGNADO:</span>
                <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <User className="w-4 h-4 text-red-500" />
                  {ticketData.attendeeName || "Sin asignar"}
                </span>
                {ticketData.attendeePhone && (
                  <span className="text-xs text-zinc-400 block mt-0.5">{ticketData.attendeePhone}</span>
                )}
              </div>

              {!isUsed && (
                <button
                  onClick={() => setEditingAttendee(!editingAttendee)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-[#f4ebd0] border border-red-700/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer no-print"
                >
                  <Edit2 className="w-3.5 h-3.5 text-red-400" />
                  Cambiar
                </button>
              )}
            </div>

            {/* Formulario para editar asistente */}
            {editingAttendee && (
              <form onSubmit={handleSaveAttendee} className="p-4 rounded-2xl bg-[#180d12] border border-red-700/40 space-y-3 no-print">
                <span className="text-xs font-bold text-[#f4ebd0] block">Asignar Nombre del Asistente</span>
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellido"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#201118] border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#201118] border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingAttendee(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingAttendee}
                    className="px-4 py-1.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-[#f4ebd0] border border-red-500/40 text-xs font-bold"
                  >
                    {savingAttendee ? "Guardando..." : "Guardar Asistente"}
                  </button>
                </div>
              </form>
            )}

            {/* Detalles del Evento */}
            <div className="space-y-3 pt-1 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-red-500 shrink-0" />
                <span>{eventData?.date}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-red-500 shrink-0" />
                <span>{eventData?.time}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/77H3QkF9ZfhtC4WB9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#f4ebd0] flex items-center gap-1.5 group/loc"
                  title="Abrir ubicación en Google Maps"
                >
                  <span>
                    {eventData?.location || "Theravit 360°"} • {eventData?.address || "Calle Pte. 128 191, Lindavista Vallejo III Secc, CDMX"}
                  </span>
                  <ExternalLink className="w-3 h-3 text-red-400 opacity-70 group-hover/loc:opacity-100 shrink-0" />
                </a>
              </div>
            </div>

            {/* Aviso de Seguridad */}
            <div className="p-3.5 rounded-2xl bg-[#160d11] border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                Este boleto permite <strong>un solo acceso</strong>. Al ser validado por el personal en puerta quedará
                marcado como <strong>UTILIZADO</strong> y no podrá reutilizarse.
              </span>
            </div>

            {/* Acciones de Descarga e Impresión */}
            <div className="space-y-2.5 pt-2 no-print">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full py-3.5 px-4 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 text-[#f4ebd0] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/40 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#f4ebd0]" />
                    <span>Generando PDF oficial...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#f4ebd0]" />
                    <span>Descargar Boleto en PDF</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleDownloadImage}
                  disabled={downloadingImg}
                  className="py-2.5 px-2 rounded-xl bg-[#1f1118] hover:bg-[#28151f] text-[#f4ebd0] border border-red-900/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  title="Guardar como imagen PNG en tu galería"
                >
                  {downloadingImg ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span>Imagen PNG</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Imprimir boleto o guardar PDF desde el navegador"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>

                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
