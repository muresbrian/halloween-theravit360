"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import {
  Copy,
  Check,
  Clock,
  UploadCloud,
  FileCheck,
  AlertCircle,
  QrCode,
  Share2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Building,
  CreditCard,
  User,
  Download,
  Sparkles,
} from "lucide-react";
import { downloadTicketPdf } from "@/lib/pdf-ticket";
import { resolveTicketTemplate } from "@/lib/ticket-templates";

export default function OrderPage({
  params,
}: {
  params: Promise<{ orderAccessToken: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.orderAccessToken;

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [copiedClabe, setCopiedClabe] = useState(false);
  const [copiedFolio, setCopiedFolio] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });

  async function handleDownloadTicket(ticket: any) {
    try {
      setDownloadingTicketId(ticket.ticketId || ticket.ticketNumber);
      await downloadTicketPdf({
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName || orderData?.customer?.name,
        ticketTypeName: orderData?.ticketType?.name,
        eventName: "HALLOWEEN THERAVIT360 2026",
        eventDate: "31 de Octubre, 2026",
        eventTime: "20:00 - 04:00 hrs",
        eventLocation: "Theravit 360°",
        qrDataUrl: ticket.qrDataUrl,
        templateIndex: ticket.templateIndex || ticket.template?.id,
      });
    } catch (err) {
      console.error("Error al descargar boleto:", err);
      alert("Hubo un error al generar el PDF. Puedes abrir el pase directamente.");
    } finally {
      setDownloadingTicketId(null);
    }
  }

  async function handleDownloadAllTickets() {
    if (!orderData?.tickets?.length) return;
    setDownloadingTicketId("all");
    try {
      for (const tkt of orderData.tickets) {
        await downloadTicketPdf({
          ticketNumber: tkt.ticketNumber,
          attendeeName: tkt.attendeeName || orderData?.customer?.name,
          ticketTypeName: orderData?.ticketType?.name,
          eventName: "HALLOWEEN THERAVIT360 2026",
          eventDate: "31 de Octubre, 2026",
          eventTime: "20:00 - 04:00 hrs",
          eventLocation: "Theravit 360°",
          qrDataUrl: tkt.qrDataUrl,
          templateIndex: tkt.templateIndex || tkt.template?.id,
        });
        await new Promise((r) => setTimeout(r, 450));
      }
    } catch (err) {
      console.error("Error al descargar boletos:", err);
    } finally {
      setDownloadingTicketId(null);
    }
  }

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/public/orders/${token}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        setErrorMessage(data.error || "Orden no encontrada.");
        setLoading(false);
        return;
      }
      setOrderData(data.order);
      setBankInfo(data.bankInfo);

      if (data.order.status === "PAGADA") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff5722", "#ff7a00", "#8b5cf6", "#ffffff"],
        });
      }
    } catch (e: any) {
      setErrorMessage("Error de conexión: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000); // Polling cada 15 segundos para detectar confirmación de pago
    return () => clearInterval(interval);
  }, [token]);

  // Temporizador de reserva
  useEffect(() => {
    if (!orderData || orderData.status !== "RESERVADA") return;

    function updateTimer() {
      const diff = +new Date(orderData.reservationExpiresAt) - +new Date();
      if (diff > 0) {
        setTimeLeft({
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ minutes: 0, seconds: 0 });
      }
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [orderData]);

  function copyText(text: string, type: "clabe" | "folio") {
    navigator.clipboard.writeText(text);
    if (type === "clabe") {
      setCopiedClabe(true);
      setTimeout(() => setCopiedClabe(false), 2000);
    } else {
      setCopiedFolio(true);
      setTimeout(() => setCopiedFolio(false), 2000);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("receipt", selectedFile);

      const res = await fetch(`/api/public/orders/${token}/receipt`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Error al subir comprobante.");
        setUploading(false);
        return;
      }

      setUploadSuccess(true);
      await fetchOrder();
    } catch (err: any) {
      setErrorMessage("Error al enviar archivo: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090c] text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-sm font-mono text-zinc-400">Cargando detalles de tu orden...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMessage && !orderData) {
    return (
      <div className="min-h-screen bg-[#09090c] text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Orden no disponible</h1>
          <p className="text-zinc-400 max-w-md text-sm">{errorMessage}</p>
          <Link href="/apartar" className="mt-6 px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm">
            Apartar nuevos boletos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isReserved = orderData.status === "RESERVADA";
  const isPending = orderData.status === "COMPROBANTE_RECIBIDO";
  const isPaid = orderData.status === "PAGADA";
  const isRejected = orderData.status === "RECHAZADA";
  const isExpired = orderData.status === "EXPIRADA";

  const whatsappMessage = encodeURIComponent(
    `🎃 ¡Hola! Acabo de apartar ${orderData.quantity} boletos para Halloween Theravit360 2026.\nFolio: ${orderData.folio}\nTotal: $${orderData.totalAmount} MXN.`
  );

  return (
    <div className="min-h-screen bg-[#09090c] text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Banner de Estado */}
        <div className="mb-8">
          {isReserved && (
            <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-white text-base">Boletos Apartados Temporalmente</h3>
                  <p className="text-xs text-amber-200/80">
                    Realiza tu transferencia y sube tu comprobante antes de que expire el tiempo.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#100e18] px-4 py-2 rounded-2xl border border-amber-500/40">
                <span className="text-xs text-zinc-400 font-mono">Tiempo restante:</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}

          {isPending && (
            <div className="p-6 rounded-3xl bg-blue-950/30 border border-blue-500/30 flex items-center gap-4">
              <FileCheck className="w-8 h-8 text-blue-400 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-base">Comprobante en Revisión</h3>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  Hemos recibido tu comprobante bancario. El administrador validará tu transferencia y tus códigos QR se
                  activarán en breve. El temporizador ha sido pausado.
                </p>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center gap-4 shadow-xl shadow-emerald-950/30">
              <Check className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-lg">¡Pago Confirmado y Boletos Activos!</h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Tus boletos digitales ya están listos para el evento. A continuación encontrarás cada código QR individual.
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="p-6 rounded-3xl bg-red-950/30 border border-red-500/30 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-base">Comprobante Rechazado</h3>
                <p className="text-xs text-red-200/80 mt-0.5">
                  El comprobante no pudo ser validado. Motivo: {orderData.payment?.rejectionReason || "No legible o monto incorrecto."}
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-700 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-zinc-500 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-base">Reserva Expirada</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  El tiempo límite de 15 minutos concluyó sin comprobante. Los boletos han sido liberados al inventario.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Encabezado de la Orden */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#140e13] border border-red-700/25 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <span className="text-xs text-zinc-400 font-mono block">FOLIO DE ORDEN</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">{orderData.folio}</span>
                <button
                  onClick={() => copyText(orderData.folio, "folio")}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Copiar folio"
                >
                  {copiedFolio ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-400 font-mono block">IMPORTE TOTAL</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#f4ebd0] font-mono">
                ${orderData.totalAmount} MXN
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-300">
            <div>
              <span className="text-zinc-500 block">Comprador:</span>
              <span className="font-semibold text-white">{orderData.customer?.name}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Boletos:</span>
              <span className="font-semibold text-white">
                {orderData.quantity} × {orderData.ticketType?.name}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">WhatsApp de Contacto:</span>
              <span className="font-semibold text-white">{orderData.customer?.phone}</span>
            </div>
          </div>
        </div>

        {/* Datos Bancarios para Transferencia (Solo visible si no está pagada o expirada) */}
        {!isPaid && !isExpired && bankInfo && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#140e13] border border-red-700/25 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-500" />
              Datos para Transferencia Bancaria
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1c131a] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-zinc-400 font-mono block">BANCO</span>
                  <span className="text-base font-bold text-white">{bankInfo.bankName}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-mono block">TITULAR</span>
                  <span className="text-sm font-semibold text-zinc-200">{bankInfo.bankHolder}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1c131a] border border-red-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#f4ebd0] font-mono font-bold block">CLABE INTERBANCARIA</span>
                  <span className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-wider">
                    {bankInfo.bankClabe}
                  </span>
                </div>
                <button
                  onClick={() => copyText(bankInfo.bankClabe, "clabe")}
                  className="px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-700/50 text-[#f4ebd0] text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  {copiedClabe ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedClabe ? "¡Copiada!" : "Copiar CLABE"}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-700/30 text-xs text-[#f4ebd0]/90 leading-relaxed">
                <strong>IMPORTANTE:</strong> En el campo <strong>Concepto / Motivo</strong> de tu transferencia bancaria,
                coloca exactamente tu folio: <strong>{orderData.folio}</strong> para que el administrador identifique tu pago
                de inmediato.
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <a
                href={`https://wa.me/525512345678?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-900/40 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar datos por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Subida de Comprobante (Visible si está en RESERVADA o RECHAZADA) */}
        {(isReserved || isRejected) && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#140e13] border border-red-700/25 mb-8">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-red-500" />
              Sube Tu Comprobante de Pago
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Aceptamos capturas de pantalla o recibos en formato JPG, PNG o PDF (máx. 10 MB).
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-zinc-700 hover:border-red-600/50 rounded-2xl p-6 text-center transition-colors">
                <input
                  type="file"
                  id="receipt-input"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="receipt-input" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud className="w-10 h-10 text-red-500 mb-2" />
                  <span className="text-sm font-semibold text-white">
                    {selectedFile ? selectedFile.name : "Selecciona o arrastra tu comprobante aquí"}
                  </span>
                  <span className="text-xs text-zinc-500 mt-1">Formatos permitidos: JPG, PNG, PDF</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-3.5 rounded-xl font-bold text-[#f4ebd0] bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 shadow-lg shadow-red-950/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#f4ebd0]" />
                    Subiendo comprobante...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Enviar Comprobante para Validación
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Sección de Boletos Individuales (Solo si está PAGADA) */}
        {isPaid && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Tus Boletos Individuales</h2>
                <p className="text-xs text-zinc-400">Cada invitado debe presentar su propio código QR en la entrada.</p>
              </div>

              {(orderData.tickets || []).length > 1 && (
                <button
                  onClick={handleDownloadAllTickets}
                  disabled={downloadingTicketId === "all"}
                  className="px-4 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/50 text-[#f4ebd0] border border-red-700/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloadingTicketId === "all" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#f4ebd0]" />
                      <span>Descargando todos los pases...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#f4ebd0]" />
                      <span>Descargar Todos en PDF</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(orderData.tickets || []).map((ticket: any, idx: number) => {
                const template = ticket.template || resolveTicketTemplate(ticket);
                return (
                  <div
                    key={ticket.ticketId || idx}
                    className="p-5 rounded-3xl bg-[#140e13] border border-red-700/25 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-[#f4ebd0] bg-red-950/60 px-3 py-1 rounded-full border border-red-700/40">
                          {ticket.ticketNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full font-mono ${
                            ticket.status === "UTILIZADO"
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white mb-0.5">
                            {ticket.attendeeName || orderData.customer?.name}
                          </h3>
                          <p className="text-xs text-zinc-400">{orderData.ticketType?.name}</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#f4ebd0] bg-red-950/40 px-2 py-0.5 rounded border border-red-800/30">
                          {template.name}
                        </span>
                      </div>

                      {/* Miniatura del Boleto Coleccionable con su QR integrado */}
                      <div className="relative mx-auto max-w-[210px] my-3 rounded-xl overflow-hidden drop-shadow-md">
                        <img
                          src={template.path}
                          alt={template.name}
                          className="w-full h-auto block select-none pointer-events-none"
                        />
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
                          {ticket.qrDataUrl ? (
                            <div
                              className="w-full h-full rounded-sm flex items-center justify-center overflow-hidden"
                              style={{ backgroundColor: template.parchmentColor || "#d29f68" }}
                            >
                              <img src={ticket.qrDataUrl} alt={`QR ${ticket.ticketNumber}`} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[7px] text-zinc-800 font-mono">
                              Pendiente
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadTicket(ticket)}
                        disabled={downloadingTicketId === (ticket.ticketId || ticket.ticketNumber)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 text-[#f4ebd0] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-950/30 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                      >
                        {downloadingTicketId === (ticket.ticketId || ticket.ticketNumber) ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f4ebd0]" />
                            <span>Generando...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-[#f4ebd0]" />
                            <span>Descargar PDF</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`/ticket/${ticket.secureToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-red-950/50 hover:bg-red-900/50 text-[#f4ebd0] border border-red-700/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        title="Abrir pase interactivo en nueva pestaña"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                        <span>Ver Pase</span>
                      </a>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🎃 ¡Aquí está tu boleto para Halloween Theravit360 2026!\nBoleto: ${ticket.ticketNumber}\nÁbrelo aquí: ${
                            typeof window !== "undefined" ? window.location.origin : ""
                          }/ticket/${ticket.secureToken}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Compartir por WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
