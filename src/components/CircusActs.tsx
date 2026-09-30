"use client";

import Image from "next/image";
import { Disc3, Beer, UtensilsCrossed, Sparkles } from "lucide-react";

export default function CircusActs() {
  const highlights = [
    {
      num: "01",
      tag: "MÚSICA EN VIVO",
      title: "DJ en Vivo",
      desc: "Sets y ritmos continuos durante toda la velada para mantener la pista de baile encendida con la mejor selección musical.",
      icon: Disc3,
      color: "border-red-900/30 hover:border-red-600/60",
      accent: "text-red-500",
      badgeBg: "bg-red-950/40 text-red-400 border-red-800/40",
    },
    {
      num: "02",
      tag: "BARRA CONTINUA",
      title: "Venta de Bebidas",
      desc: "Servicio de bebidas frías, cerveza, cócteles y tragos preparados para brindar y disfrutar cada minuto del evento.",
      icon: Beer,
      color: "border-[#f4ebd0]/20 hover:border-[#f4ebd0]/50",
      accent: "text-[#f4ebd0]",
      badgeBg: "bg-[#f4ebd0]/10 text-[#f4ebd0] border-[#f4ebd0]/30",
    },
    {
      num: "03",
      tag: "GASTRONOMÍA",
      title: "Venta de Alimentos",
      desc: "Deliciosas opciones de comida y snacks listos para consumir en cualquier momento y recargar energía en la fiesta.",
      icon: UtensilsCrossed,
      color: "border-red-900/30 hover:border-red-600/60",
      accent: "text-red-400",
      badgeBg: "bg-red-950/40 text-red-400 border-red-800/40",
    },
    {
      num: "04",
      tag: "LA MEJOR VIBRA",
      title: "Muy Buen Ambiente",
      desc: "La mejor energía, increíbles disfraces y una atmósfera inigualable de convivencia y diversión con la comunidad Theravit 360°.",
      icon: Sparkles,
      color: "border-[#f4ebd0]/20 hover:border-[#f4ebd0]/50",
      accent: "text-[#f4ebd0]",
      badgeBg: "bg-[#f4ebd0]/10 text-[#f4ebd0] border-[#f4ebd0]/30",
    },
  ];

  return (
    <section id="experiencia" className="relative py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#050408]/75 backdrop-blur-[3px] border-t border-b border-zinc-900 overflow-hidden">
      {/* ── ILUMINACIÓN ESCÉNICA AMBIENTAL ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-950/20 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-10 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Cabecera de la Escena 2 */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/40 border border-red-700/50 text-[10px] font-mono uppercase tracking-[0.3em] text-[#f4ebd0]">
            <span className="text-red-500 font-bold">ESCENA II</span>
            <span className="text-red-400/50">·</span>
            <span>LA PISTA CENTRAL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#f4ebd0] uppercase tracking-tight leading-tight">
            Todo Listo Para la Fiesta
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
            Una noche pensada para disfrutar al máximo. Música en vivo, barra de bebidas,
            comida y la mejor vibra con los anfitriones de Theravit 360°.
          </p>
        </div>

        {/* ── COMPOSICIÓN ESCÉNICA: 2 CARDS IZQUIERDA | ANFITRIONES CENTRO | 2 CARDS DERECHA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Columna Izquierda (Cards 1 y 2): DJ & Bebidas */}
          <div className="order-2 lg:order-1 lg:col-span-3 space-y-6">
            {highlights.slice(0, 2).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 sm:p-7 rounded-3xl bg-[#0c0a14]/90 border ${item.color} backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-[#120f1e] shadow-xl shadow-black/80 group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeBg} font-bold tracking-wider`}>
                      {item.tag}
                    </span>
                    <Icon className={`w-5 h-5 ${item.accent} transition-transform group-hover:scale-110`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Columna Central (Dúo de Socios Fundadores) */}
          <div className="order-1 lg:order-2 lg:col-span-6 relative flex flex-col items-center justify-center py-4 lg:py-0">
            {/* Foco cenital teatral */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-96 bg-gradient-to-b from-red-600/25 via-red-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

            {/* Contenedor del Dúo de Anfitriones */}
            <div className="relative w-full max-w-[520px] flex items-end justify-center gap-2 sm:gap-4 px-2">
              {/* Partner 1: Diablo de Espejos */}
              <div className="relative w-1/2 max-w-[240px] aspect-[392/636] flex items-end justify-center transition-transform duration-500 hover:scale-[1.03]">
                <Image
                  src="/images/devil-transparent.png"
                  alt="Socio Fundador - Diablo de Espejos"
                  fill
                  priority
                  className="object-contain object-bottom select-none pointer-events-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
                  sizes="(max-width: 768px) 45vw, 25vw"
                />
              </div>

              {/* Partner 2: Forzudo de Espejos */}
              <div className="relative w-1/2 max-w-[240px] aspect-[408/612] flex items-end justify-center transition-transform duration-500 hover:scale-[1.03]">
                <Image
                  src="/images/strongman-transparent.png"
                  alt="Socio Fundador - Forzudo de Espejos"
                  fill
                  priority
                  className="object-contain object-bottom select-none pointer-events-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
                  sizes="(max-width: 768px) 45vw, 25vw"
                />
              </div>

              {/* Sombra de contacto escénica unificada */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-black/95 rounded-[100%] blur-md pointer-events-none" />
            </div>

            {/* Placa de los Socios Fundadores */}
            <div className="mt-5 px-5 py-2.5 rounded-2xl bg-black/90 border border-red-700/50 text-center backdrop-blur-md shadow-xl shadow-black/90 flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-red-500 uppercase font-black">
                <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
                <span>SOCIOS FUNDADORES</span>
                <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-[#f4ebd0] uppercase tracking-wider mt-0.5">
                THERAVIT 360°
              </span>
              <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mt-0.5">
                Tus Anfitriones Oficiales
              </span>
            </div>
          </div>

          {/* Columna Derecha (Cards 3 y 4): Alimentos & Gran Ambiente */}
          <div className="order-3 lg:order-3 lg:col-span-3 space-y-6">
            {highlights.slice(2, 4).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 sm:p-7 rounded-3xl bg-[#0c0a14]/90 border ${item.color} backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-[#120f1e] shadow-xl shadow-black/80 group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeBg} font-bold tracking-wider`}>
                      {item.tag}
                    </span>
                    <Icon className={`w-5 h-5 ${item.accent} transition-transform group-hover:scale-110`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
