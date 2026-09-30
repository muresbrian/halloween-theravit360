"use client";

import Link from "next/link";
import { Ticket, ChevronDown, Sparkles, ExternalLink } from "lucide-react";

interface CircusHeroProps {
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  eventMapUrl?: string;
}

export default function CircusHero({
  eventName = "HALLOWEEN THERAVIT360",
  eventDate = "31 de Octubre, 2026",
  eventLocation = "Theravit 360°",
  eventMapUrl = "https://maps.app.goo.gl/77H3QkF9ZfhtC4WB9",
}: CircusHeroProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-between items-center pt-28 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* ── ARQUITECTURA DE FONDO: LA GRAN CARPA Y LUCES TEATRALES ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Carpa silueteada con sutiles franjas de circo vintage */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 35px,
              rgba(185, 28, 28, 0.45) 35px,
              rgba(185, 28, 28, 0.45) 70px
            )`,
          }}
        />

        {/* Gradiente radial de atmósfera nocturna */}
        <div className="absolute inset-0 bg-radial-[at_50%_40%] from-red-950/25 via-[#080509]/90 to-[#040306]" />

        {/* Reflectores volumétricos cruzados (Spotlights de Circo Carmesí y Crema) */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[750px] bg-gradient-to-b from-red-600/20 via-red-900/10 to-transparent blur-[90px] rotate-[22deg] transform-gpu pointer-events-none" />
        <div className="absolute -top-32 right-1/4 w-[500px] h-[750px] bg-gradient-to-b from-[#f4ebd0]/10 via-red-950/10 to-transparent blur-[95px] -rotate-[22deg] transform-gpu pointer-events-none" />

        {/* Arco de marquesina superior con bombillas incandescentes color crema */}
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center gap-4 sm:gap-8 opacity-50">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#f4ebd0] shadow-[0_0_12px_#ffffff] animate-pulse"
              style={{ animationDelay: `${(i % 5) * 0.35}s` }}
            />
          ))}
        </div>

        {/* Niebla inferior que conecta con la siguiente escena */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050406] via-[#050406]/80 to-transparent" />
      </div>

      {/* ── CONTENIDO PRINCIPAL DE LA PORTADA ── */}
      <div className="w-full max-w-5xl mx-auto my-auto text-center z-20 space-y-6 sm:space-y-8 pt-4">
        {/* Etiqueta de Apertura de la Carpa */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#160c0f]/90 border border-red-500/40 backdrop-blur-md shadow-2xl shadow-black/80">
          <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-ping" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.32em] text-[#f4ebd0] uppercase">
            THERAVIT360 PRESENTA
          </span>
          <Sparkles className="w-3.5 h-3.5 text-red-400 opacity-90" />
        </div>

        {/* Título Monumental & Vol. 4 */}
        <div className="space-y-2 sm:space-y-3">
          <div className="text-xs sm:text-sm font-mono tracking-[0.4em] uppercase text-[#e8d5b5]">
            UNA FUNCIÓN SOBRENATURAL · EDICIÓN NOCTURNA
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl xl:text-9xl font-black uppercase tracking-tighter leading-[0.9] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
            HALLOWEEN
          </h1>

          <div className="flex items-center justify-center gap-3 sm:gap-6 pt-1">
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-red-600/70" />
            <span className="text-xl sm:text-3xl md:text-4xl font-mono font-bold tracking-[0.25em] text-[#dc2626] uppercase text-shadow-red">
              VOL. 4 · 2026
            </span>
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-red-600/70" />
          </div>
        </div>

        {/* Lema y Manifiesto de Entrada */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#f4ebd0] font-light leading-relaxed tracking-wide px-2">
          Adéntrate en una experiencia inmersiva de circo nocturno y sombras vivas.
          Donde la alta mixología, los DJs estelares y el arte del terror se unen bajo una sola carpa.
        </p>

        {/* Placas de Coordenadas de Circo */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 rounded-2xl bg-black/70 border border-red-950/80 backdrop-blur-md text-[11px] sm:text-xs font-mono text-[#e8d5b5]">
          <div className="px-3 py-1.5 rounded-xl bg-[#140b0e] border border-red-900/50 text-[#f4ebd0] flex items-center gap-1.5">
            <span className="text-[#dc2626]">📅</span>
            <span>{eventDate}</span>
          </div>
          <a
            href={eventMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir ubicación en Google Maps"
            className="px-3 py-1.5 rounded-xl bg-[#140b0e] hover:bg-[#201016] border border-red-900/50 hover:border-red-600/70 text-[#f4ebd0] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer group/loc"
          >
            <span className="text-[#dc2626]">📍</span>
            <span className="truncate max-w-[200px] sm:max-w-none group-hover/loc:underline">{eventLocation}</span>
            <ExternalLink className="w-3 h-3 text-red-400 opacity-70 group-hover/loc:opacity-100 transition-opacity" />
          </a>
          <div className="px-3 py-1.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 flex items-center gap-1.5">
            <span className="text-red-400">⚡</span>
            <span>AFORO LIMITADO</span>
          </div>
        </div>

        {/* Botones de Acción (Llamada a la Acción Inmediata) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
          <button
            onClick={() => scrollToSection("taquilla")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#991b1b] text-[#f4ebd0] font-black text-xs uppercase tracking-[0.22em] shadow-xl shadow-red-950/70 hover:shadow-red-600/50 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-red-500/50"
          >
            <Ticket className="w-4 h-4 text-[#f4ebd0]" />
            <span>COMPRAR BOLETOS</span>
          </button>

          <button
            onClick={() => scrollToSection("experiencia")}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#120a0d]/90 hover:bg-[#1a0f14] text-[#f4ebd0] hover:text-white font-mono text-xs uppercase tracking-[0.2em] border border-[#e8d5b5]/30 hover:border-[#e8d5b5]/60 transition-all cursor-pointer"
          >
            DESCUBRIR LA FUNCIÓN
          </button>
        </div>
      </div>

      {/* ── INDICADOR DE DESPLAZAMIENTO (SCROLL STORYTELLING) ── */}
      <div className="z-20 pt-8 pb-2 flex flex-col items-center gap-2 cursor-pointer group" onClick={() => scrollToSection("experiencia")}>
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#e8d5b5]/70 group-hover:text-red-400 transition-colors">
          DESLIZA PARA ENTRAR A LA CARPA
        </span>
        <div className="w-6 h-10 rounded-full border border-red-900/60 group-hover:border-red-500 flex items-start justify-center p-1.5 transition-colors">
          <div className="w-1.5 h-2.5 rounded-full bg-[#dc2626] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
