import Link from "next/link";
import { Shield, ArrowUpRight, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050507]/80 backdrop-blur-[3px] border-t border-zinc-800/80 text-zinc-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-red-800/60 flex items-center justify-center text-red-500 font-mono text-xs font-black">
              T
            </div>
            <span className="font-extrabold tracking-[0.2em] text-lg text-white">
              THERAVIT360 <span className="text-red-500">2026</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
            Plataforma oficial de acceso y boletaje para la experiencia Halloween Theravit360.
            Cada pase emitido cuenta con un código QR único e independiente con control antifraude atómico.
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span>Sistema Seguro · Encriptación y Validación Atómica</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold text-[#f4ebd0] uppercase tracking-widest mb-4">Navegación</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/#evento" className="hover:text-[#f4ebd0] transition-colors">
                El Evento & Atmósfera
              </Link>
            </li>
            <li>
              <Link href="/#experiencia" className="hover:text-[#f4ebd0] transition-colors">
                Pilares de Producción
              </Link>
            </li>
            <li>
              <Link href="/#boletos" className="hover:text-[#f4ebd0] transition-colors">
                Pases & Disponibilidad
              </Link>
            </li>
            <li>
              <Link href="/apartar" className="hover:text-red-400 transition-colors flex items-center gap-1 font-semibold text-zinc-300">
                Apartar Boletos
                <ArrowUpRight className="w-3 h-3 text-red-400" />
              </Link>
            </li>
            <li>
              <Link href="/mis-boletos" className="hover:text-[#f4ebd0] transition-colors">
                Consultar Mis Boletos
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                Preguntas Frecuentes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold text-[#f4ebd0] uppercase tracking-widest mb-4">Atención & Ayuda</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <span className="text-zinc-400 block">Atención Personalizada:</span>
              <span className="text-zinc-200 font-mono font-semibold">Mesa de Ayuda Oficial</span>
            </li>
            <li className="pt-1">
              <span className="text-zinc-400 block">Dudas sobre tu Folio o Pago:</span>
              <span className="text-zinc-200 font-mono">WhatsApp: 55 1202 3739</span>
            </li>
          </ul>

          <div className="mt-5">
            <a
              href="https://wa.me/525512023739"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Mesa de Ayuda WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 font-mono">
        <p>© 2026 THERAVIT360. Todos los derechos reservados.</p>
        <p className="mt-2 sm:mt-0 tracking-wider uppercase">FIESTA PRIVADA · RESERVA EXCLUSIVA</p>
      </div>
    </footer>
  );
}
