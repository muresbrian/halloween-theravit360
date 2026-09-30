"use client";

import { useState, useEffect } from "react";

const BACKGROUND_GIFS = [
  {
    id: 1,
    url: "/gifs/bg-1.gif",
    alt: "Fondo animado Halloween 1",
  },
  {
    id: 2,
    url: "/gifs/bg-2.gif",
    alt: "Fondo animado Halloween 2",
  },
  {
    id: 3,
    url: "/gifs/bg-3.gif",
    alt: "Fondo animado Halloween 3",
  },
  {
    id: 4,
    url: "/gifs/bg-4.gif",
    alt: "Fondo animado Halloween 4",
  },
  {
    id: 5,
    url: "/gifs/bg-5.gif",
    alt: "Fondo animado Halloween 5",
  },
  {
    id: 6,
    url: "/gifs/bg-6.gif",
    alt: "Fondo animado Halloween 6",
  },
];

export default function BackgroundGifs() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Cambiar de GIF automáticamente cada 7.5 segundos
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_GIFS.length);
    }, 7500);

    return () => clearInterval(timer);
  }, []);

  return (
    <aside
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* ── CAPAS DE GIFS ANIMADOS CON TRANSICIÓN SUAVE CROSSFADE ── */}
      {BACKGROUND_GIFS.map((gif, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={gif.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-45" : "opacity-0"
            }`}
          >
            {/* Usamos etiqueta img estándar para asegurar el loop continuo de gifs sin reprocesamiento */}
            <img
              src={gif.url}
              alt={gif.alt}
              className="w-full h-full object-cover object-center scale-105 filter contrast-125 brightness-95"
            />
          </div>
        );
      })}

      {/* ── FILTRO ATMOSFÉRICO DE CIRCO OSCURO (MANTIENE LEGIBILIDAD PERFECTA) ── */}
      {/* Tinte general oscuro */}
      <div className="absolute inset-0 bg-[#050408]/60 mix-blend-multiply" />

      {/* Gradiente vertical para suavizar cabeceras y transiciones de scroll */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050408]/90 via-[#050408]/40 to-[#050408]/95" />

      {/* Viñeta radial teatral */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,4,8,0.85)_100%)]" />

      {/* Tinte rojo carmesí sutil de Halloween */}
      <div className="absolute inset-0 bg-red-950/15 mix-blend-color" />
    </aside>
  );
}
