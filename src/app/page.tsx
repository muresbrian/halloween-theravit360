import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import CircusAtmosphere from "@/components/CircusAtmosphere";
import BackgroundGifs from "@/components/BackgroundGifs";
import CircusHero from "@/components/CircusHero";
import CircusActs from "@/components/CircusActs";
import CircusVideoIntro from "@/components/CircusVideoIntro";
import { callAppsScript } from "@/lib/sheets-api";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  ArrowRight,
  Ticket,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  MessageCircle,
  CheckCircle2,
  ExternalLink,
  Navigation,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await callAppsScript("getConfig");
  const config = data.config || {};
  const rawTicketTypes = data.ticketTypes || [];
  // Exclusivamente 1 tipo de boleto: GENERAL PASS
  const ticketTypes = rawTicketTypes.filter(
    (t: any) => t.id === "TT-GEN" || !t.name.toUpperCase().includes("VIP")
  );
  if (ticketTypes.length === 0 && rawTicketTypes.length > 0) {
    ticketTypes.push(rawTicketTypes[0]);
  }

  const eventName = config.eventName || "HALLOWEEN THERAVIT360";
  const eventDate = config.eventDate || "31 de Octubre, 2026";
  const eventTime = config.eventTime || "20:00 - 04:00 hrs";
  const eventLocation =
    config.eventLocation && config.eventLocation !== "Mansión Theravit Club & Garden"
      ? config.eventLocation
      : "Theravit 360°";
  const eventAddress =
    config.eventAddress && config.eventAddress !== "Av. Las Ánimas #666, Zona Metropolitana"
      ? config.eventAddress
      : "Calle Pte. 128 191, Lindavista Vallejo III Secc, Gustavo A. Madero, 07750 Ciudad de México, CDMX";
  const eventMapUrl = config.eventMapUrl || "https://maps.app.goo.gl/77H3QkF9ZfhtC4WB9";
  const eventMinAge = config.eventMinAge || "18+";
  const eventDressCode = config.eventDressCode || "Disfraz Temático Obligatorio / Elegante Oscuro";
  const eventRules =
    config.eventRules ||
    "• Identificación oficial obligatoria.\n• Cero tolerancia a sustancias ilícitas.\n• Cada boleto es de un solo acceso.\n• No reingreso.";

  const rulesList = eventRules.split("\n").filter((r: string) => r.trim().length > 0);

  const faqs = [
    {
      num: "01",
      q: "¿Cómo funciona la reserva y compra de boletos?",
      a: "Seleccionas la cantidad de accesos General Pass en la taquilla oficial. El sistema aparta tus boletos en tiempo real durante 15 minutos mientras realizas tu transferencia bancaria a los datos de la pantalla y subes tu comprobante. En cuanto validemos tu pago, recibirás un correo con tu clave única alfanumérica para desbloquear y descargar tus boletos.",
    },
    {
      num: "02",
      q: "¿Cuándo y cómo recibo mis códigos QR de acceso?",
      a: "En cuanto el administrador valida tu pago bancario, recibirás un correo electrónico con tu Código Alfanumérico de Seguridad único (ej. THV-XXXXXX). Con este código único podrás entrar a la sección 'Mis Boletos' o usar el botón directo del correo para desbloquear y descargar tus boletos oficiales.",
    },
    {
      num: "03",
      q: "¿Por qué se requiere una clave alfanumérica única para descargar los boletos?",
      a: "Por máxima seguridad antifraude. Así garantizamos que únicamente la persona que realizó la compra y recibió el correo de confirmación pueda visualizar y descargar los códigos QR de acceso, evitando que terceros descarguen boletos ajenos conociendo solo un número de orden o correo.",
    },
    {
      num: "04",
      q: "¿Cada boleto es individual e intransferible?",
      a: "Sí. Cada entrada genera un código QR criptográfico independiente. Puedes asignar el nombre de cada invitado a su pase digital. El acceso de una persona no afecta la validez de los demás boletos de tu orden.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050408]/60 text-[#f5f5f7] flex flex-col selection:bg-[#b91c1c] selection:text-white overflow-x-hidden relative">
      {/* ── FONDOS ANIMADOS DE CIRCO (GIFS DINÁMICOS CON TRANSICIÓN) ── */}
      <BackgroundGifs />

      {/* ── VIDEO INTRO CINEMATOGRÁFICO & BOLETO DE ENTRADA AL CIRCO ── */}
      <CircusVideoIntro />

      {/* ── ATMÓSFERA DE CIRCO (PARTÍCULAS Y BRASAS VIVAS) ── */}
      <CircusAtmosphere />

      {/* ── NAVEGACIÓN PRINCIPAL ── */}
      <Navbar />

      {/* ========================================================================= */}
      {/* ESCENA 1: LA ENTRADA AL CIRCO (HERO CINEMATOGRÁFICO)                     */}
      {/* ========================================================================= */}
      <CircusHero
        eventName={eventName}
        eventDate={eventDate}
        eventLocation={eventLocation}
        eventMapUrl={eventMapUrl}
      />

      {/* ========================================================================= */}
      {/* ESCENA 2: ADÉNTRATE EN LA EXPERIENCIA (EL UMBRAL & LOS 4 ACTOS)           */}
      {/* ========================================================================= */}
      <CircusActs />

      {/* ========================================================================= */}
      {/* ESCENA 3: LA CARTELERA DEL ESPECTÁCULO (COORDENADAS & MANIFIESTO)        */}
      {/* ========================================================================= */}
      <section id="evento" className="scroll-mt-20 py-28 px-4 sm:px-6 lg:px-8 bg-[#07060a]/75 backdrop-blur-[3px] border-b border-zinc-900 relative">
        <div id="ubicacion" className="relative -top-28 pointer-events-none" />
        {/* Iluminación de fondo */}
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          {/* Cabecera Escena 3 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/30 border border-red-700/40 text-[10px] font-mono uppercase tracking-[0.3em] text-[#f4ebd0]">
                <span className="text-red-500 font-bold">ESCENA III</span>
                <span className="text-red-400/50">·</span>
                <span>COORDENADAS & REGLAS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                La Cartelera Oficial
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md font-light leading-relaxed">
              Todo lo que necesitas conocer antes de presentarte en las puertas del circo.
              Puntualidad, elegancia oscura y caracterización temática requerida.
            </p>
          </div>

          {/* Tarjetas de Coordenadas de Circo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-3xl bg-[#0c0a14] border border-zinc-800/80 hover:border-red-600/40 transition-colors shadow-lg shadow-black/80">
              <div className="w-10 h-10 rounded-2xl bg-red-950/50 border border-red-700/40 flex items-center justify-center text-red-500 mb-5">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest block">
                FECHA OFICIAL
              </span>
              <h3 className="font-bold text-[#f4ebd0] text-lg mt-1">{eventDate}</h3>
              <p className="text-zinc-400 text-xs mt-2 font-light">Recepción de invitados desde las 20:00 hrs.</p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0c0a14] border border-zinc-800/80 hover:border-red-600/40 transition-colors shadow-lg shadow-black/80">
              <div className="w-10 h-10 rounded-2xl bg-red-950/50 border border-red-700/40 flex items-center justify-center text-red-500 mb-5">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest block">
                HORARIO DE ADMISIÓN
              </span>
              <h3 className="font-bold text-[#f4ebd0] text-lg mt-1">{eventTime}</h3>
              <p className="text-zinc-400 text-xs mt-2 font-light">Cierre de accesos y último ingreso 23:00 hrs.</p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0c0a14] border border-zinc-800/80 hover:border-red-600/40 transition-colors shadow-lg shadow-black/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-red-950/50 border border-red-700/40 flex items-center justify-center text-red-500 mb-5">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest block">
                  RECINTO PRINCIPAL
                </span>
                <h3 className="font-bold text-[#f4ebd0] text-lg mt-1">{eventLocation}</h3>
                <p className="text-zinc-400 text-xs mt-2 font-light leading-relaxed">{eventAddress}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-800/70">
                <a
                  href={eventMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 hover:text-[#f4ebd0] transition-colors group/map"
                >
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/map:translate-x-0.5 group-hover/map:-translate-y-0.5" />
                </a>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#0c0a14] border border-zinc-800/80 hover:border-red-600/40 transition-colors shadow-lg shadow-black/80">
              <div className="w-10 h-10 rounded-2xl bg-red-950/50 border border-red-700/40 flex items-center justify-center text-red-500 mb-5">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest block">
                DRESS CODE & EDAD
              </span>
              <h3 className="font-bold text-[#f4ebd0] text-lg mt-1">{eventDressCode}</h3>
              <p className="text-zinc-400 text-xs mt-2 font-light">Edad mínima requerida: {eventMinAge}.</p>
            </div>
          </div>

          {/* ── MÓDULO DESTACADO DE UBICACIÓN & GOOGLE MAPS ── */}
          <div className="mt-12 p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#140c12] via-[#0d070b] to-[#070407] border border-red-800/40 relative overflow-hidden backdrop-blur-md shadow-2xl shadow-black/90">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-700/40 text-[10px] font-mono uppercase tracking-[0.25em] text-[#f4ebd0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>CÓMO LLEGAR · UBICACIÓN OFICIAL</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {eventLocation}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-light flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{eventAddress}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={eventMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold text-[#f4ebd0] bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 shadow-lg shadow-red-950/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#f4ebd0]" />
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>

                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=19.4868869,-99.1445003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-red-400" />
                  <span>Trazar Ruta</span>
                </a>
              </div>
            </div>

            {/* Mapa interactivo embebido con filtro nocturno */}
            <div className="mt-6 rounded-2xl overflow-hidden border border-red-950/80 shadow-inner relative aspect-[16/9] sm:aspect-[21/9] max-h-[340px] w-full bg-[#0a070e]">
              <iframe
                title="Ubicación Theravit 360 en Google Maps"
                src="https://maps.google.com/maps?q=19.4868869,-99.1445003&hl=es&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(110%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
              <div className="absolute bottom-3 right-3 pointer-events-none sm:pointer-events-auto">
                <a
                  href={eventMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-red-700/50 text-[10px] font-mono text-[#f4ebd0] hover:text-white flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  <span>Ver mapa completo</span>
                  <ExternalLink className="w-3 h-3 text-red-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Manifiesto y Reglamento del Circo */}
          <div className="mt-12 p-8 sm:p-10 rounded-3xl bg-[#0c0a14]/90 border border-zinc-800/90 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-bold text-[#f4ebd0] uppercase tracking-[0.25em] font-mono">
                Reglamento del Circo & Políticas de Admisión
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-zinc-300 font-light">
              {rulesList.map((rule: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-red-500 font-mono text-sm leading-none">•</span>
                  <span>{rule.replace(/^•\s*/, "")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cuenta Regresiva al Evento */}
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#170a0e] via-[#0d0609] to-[#170a0e] border border-red-700/30 text-center space-y-4">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#f4ebd0] font-bold block">
              TIEMPO RESTANTE PARA LA FUNCIÓN
            </span>
            <div className="flex justify-center">
              <Countdown targetDate="2026-10-31T20:00:00" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ESCENA 4: LA TAQUILLA DEL CIRCO (PASES & COMPRA DE BOLETOS)              */}
      {/* ========================================================================= */}
      <section id="taquilla" className="scroll-mt-20 py-28 px-4 sm:px-6 lg:px-8 bg-[#040306]/75 backdrop-blur-[3px] border-b border-zinc-900 relative">
        <div id="boletos" className="relative -top-28 pointer-events-none" />
        {/* Iluminación escénica focal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/25 rounded-full blur-[160px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          {/* Cabecera Escena 4 */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/30 border border-red-700/40 text-[10px] font-mono uppercase tracking-[0.3em] text-[#f4ebd0]">
              <span className="text-red-500 font-bold">ESCENA IV</span>
              <span className="text-red-400/50">·</span>
              <span>TAQUILLA OFICIAL</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
              Asegura Tu Entrada
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              El inventario se sincroniza en vivo con la base de datos oficial.
              Selecciona tu pase para ingresar al sistema de apartado seguro.
            </p>
          </div>

          {/* Tarjeta de Pase General Oficial (Taquilla de Circo) */}
          <div className="max-w-xl mx-auto">
            {ticketTypes.map((type: any) => {
              const isSoldOut = type.available <= 0;

              return (
                <div
                  key={type.id}
                  className="relative rounded-3xl p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between bg-gradient-to-b from-[#18090d] via-[#100609] to-[#0a0406] border-2 border-red-600/60 shadow-2xl shadow-red-950/40 hover:scale-[1.01]"
                >
                  <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-red-800 to-red-600 text-[#f4ebd0] font-mono font-bold text-[9px] px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-950/60 border border-red-400/40">
                    BOLETO OFICIAL · ACCESO GENERAL
                  </div>

                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                          TICKET PASS // {type.id}
                        </span>
                        <h3 className="text-2xl font-black text-white tracking-wide uppercase mt-1">
                          {type.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl sm:text-4xl font-mono font-black text-[#f4ebd0] block">
                          ${type.price}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">MXN / ACCESO</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 mt-5 leading-relaxed min-h-[44px] font-light">
                      {type.description}
                    </p>

                    <div className="mt-8 pt-5 border-t border-zinc-800/80 space-y-2.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Aforo Máximo:</span>
                        <span className="text-zinc-200 font-semibold">{type.quantity} accesos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Disponibilidad en Vivo:</span>
                        {isSoldOut ? (
                          <span className="font-bold text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            AGOTADO
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {type.available} disponibles
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    {isSoldOut ? (
                      <button
                        disabled
                        className="w-full py-4 rounded-xl font-mono text-xs font-bold bg-zinc-900 text-zinc-500 cursor-not-allowed uppercase tracking-wider text-center"
                      >
                        BOLETOS AGOTADOS
                      </button>
                    ) : (
                      <Link
                        href={`/apartar?tipo=${type.id}`}
                        className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] text-[#f4ebd0] bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#b91c1c] hover:shadow-xl hover:shadow-red-600/40 shadow-lg shadow-red-950/50 transition-all hover:scale-[1.02] active:scale-95 border border-red-500/40"
                      >
                        <Ticket className="w-4 h-4 text-[#f4ebd0]" />
                        <span>Apartar Este Pase</span>
                        <ArrowRight className="w-4 h-4 ml-1 text-[#f4ebd0]" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ESCENA 5: EL TELÓN FINAL (PREGUNTAS FRECUENTES & CIERRE)                 */}
      {/* ========================================================================= */}
      <section id="faq" className="py-28 px-4 sm:px-6 lg:px-8 bg-[#060409]/75 backdrop-blur-[3px] border-b border-zinc-900 relative">
        <div className="max-w-4xl mx-auto">
          {/* Cabecera Escena 5 */}
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/30 border border-red-700/40 text-[10px] font-mono uppercase tracking-[0.3em] text-[#f4ebd0]">
              <span className="text-red-500 font-bold">ESCENA V</span>
              <span className="text-red-400/50">·</span>
              <span>TELÓN FINAL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Resolvemos tus dudas sobre el proceso de apartado, validación bancaria y códigos QR.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-7 sm:p-8 rounded-3xl bg-[#0b0912] border border-zinc-800/80 hover:border-red-900/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs font-bold text-red-400 bg-red-950/50 px-2.5 py-1 rounded-lg border border-red-600/30">
                    {faq.num}
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{faq.q}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contacto Directo de Asistencia */}
          <div className="mt-14 p-8 rounded-3xl bg-[#12080a] border border-red-800/30 text-center space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white">¿Tienes alguna duda sobre tu acceso?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto font-light">
              Nuestro equipo de producción está listo para asistirte en la validación de tu orden o consultas de aforo.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${(config.contactWhatsApp || "+525512023739").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  "Hola, tengo dudas sobre mis boletos de Halloween Theravit360 2026."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contacto WhatsApp</span>
              </a>

              <Link
                href="/mis-boletos"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                <span>Consultar Mis Boletos</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIE DE PÁGINA OFICIAL ── */}
      <Footer />
    </div>
  );
}
