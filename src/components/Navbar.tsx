"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050507]/85 backdrop-blur-xl border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-950 via-zinc-950 to-black border border-red-700/60 flex items-center justify-center text-red-500 font-mono text-xs font-black shadow-inner">
              T
            </div>
            <div>
              <span className="font-extrabold tracking-[0.2em] text-lg sm:text-xl text-white group-hover:text-red-400 transition-colors block leading-none">
                THERAVIT360
              </span>
              <span className="block text-[9px] tracking-[0.3em] text-[#e8d5b5]/70 uppercase font-mono mt-1 font-semibold">
                OCT 31 · HALLOWEEN 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            <Link href="/#evento" className="text-xs uppercase tracking-widest text-[#f4ebd0]/75 hover:text-white transition-colors font-medium">
              El Evento
            </Link>
            <Link href="/#experiencia" className="text-xs uppercase tracking-widest text-[#f4ebd0]/75 hover:text-white transition-colors font-medium">
              Experiencia
            </Link>
            <Link href="/#boletos" className="text-xs uppercase tracking-widest text-[#f4ebd0]/75 hover:text-white transition-colors font-medium">
              Boletos
            </Link>
            <Link href="/#ubicacion" className="text-xs uppercase tracking-widest text-[#f4ebd0]/75 hover:text-white transition-colors font-medium">
              Ubicación
            </Link>
            <Link href="/#faq" className="text-xs uppercase tracking-widest text-[#f4ebd0]/75 hover:text-white transition-colors font-medium">
              Preguntas
            </Link>
            <Link
              href="/mis-boletos"
              className="text-xs uppercase tracking-widest text-[#f4ebd0]/75 hover:text-red-400 transition-colors font-medium flex items-center gap-1.5"
            >
              Mis Boletos
            </Link>
          </div>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/apartar"
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[#f4ebd0] bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Apartar Boletos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 focus:outline-none"
              aria-label="Abrir menú"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#09080d]/95 backdrop-blur-2xl border-b border-zinc-800 px-5 pt-3 pb-6 space-y-3">
          <Link
            href="/#evento"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm uppercase tracking-wider font-semibold text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
          >
            El Evento
          </Link>
          <Link
            href="/#experiencia"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm uppercase tracking-wider font-semibold text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
          >
            Experiencia
          </Link>
          <Link
            href="/#boletos"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm uppercase tracking-wider font-semibold text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
          >
            Boletos
          </Link>
          <Link
            href="/#ubicacion"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm uppercase tracking-wider font-semibold text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
          >
            Ubicación
          </Link>
          <Link
            href="/#faq"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm uppercase tracking-wider font-semibold text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
          >
            Preguntas Frecuentes
          </Link>
          <Link
            href="/mis-boletos"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm uppercase tracking-wider font-semibold text-red-400 hover:bg-zinc-800/60"
          >
            Mis Boletos
          </Link>

          <div className="pt-3 border-t border-zinc-800">
            <Link
              href="/apartar"
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#f4ebd0] bg-[#b91c1c] hover:bg-[#991b1b] border border-red-500/40 shadow-lg shadow-red-950/50"
            >
              <span>Apartar Boletos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
