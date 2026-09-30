"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Sparkles, Skull, ArrowRight } from "lucide-react";

export default function CircusVideoIntro() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Bloquear scroll mientras el video o el boleto estén activos
    if (!hasEntered) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [hasEntered]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log("Autoplay con audio bloqueado por navegador, reproduciendo en silencio:", err);
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }
  }, []);

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setVideoEnded(true);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setVideoEnded(true);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleEnterCircus = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setHasEntered(true);
      document.body.style.overflow = "";
    }, 900);
  };

  if (hasEntered) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-all duration-1000 select-none ${
        isTransitioning ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* ── 1. ETAPA DE REPRODUCCIÓN DEL VIDEO ── */}
      {!videoEnded && (
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={videoRef}
            src="/videos/haunted-circus-intro.mp4"
            playsInline
            autoPlay
            muted={isMuted}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />

          {/* Viñeta cinematográfica sobre el video */}
          <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-black/20 to-black/80 pointer-events-none" />

          {/* Controles en esquinas: Mute y Saltar */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-3 rounded-full bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white border border-red-950/60 backdrop-blur-md transition-all cursor-pointer shadow-lg"
              title={isMuted ? "Activar Sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-red-500" />}
            </button>

            <button
              onClick={handleSkip}
              className="px-4 py-2.5 rounded-full bg-black/70 hover:bg-black/90 text-[#f4ebd0] hover:text-white border border-red-950/60 backdrop-blur-md text-xs font-mono tracking-widest uppercase transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <span>Saltar</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. ETAPA DE PANTALLA NEGRA CON BOLETO DE CIRCO ── */}
      {videoEnded && (
        <div className="relative w-full h-full flex flex-col items-center justify-center px-4 overflow-hidden bg-[#040306] animate-in fade-in duration-1000">
          {/* Luz teatral ambiental difusa detrás del boleto */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] bg-gradient-to-b from-red-600/25 via-red-950/20 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

          {/* Sutil niebla oscura de fondo */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/70 to-black pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg w-full">
            {/* Mensaje previo de suspenso */}
            <div className="space-y-1 animate-pulse">
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-[#f4ebd0] uppercase font-bold block drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]">
                HAS LLEGADO A LAS PUERTAS
              </span>
              <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-red-600/70 to-transparent" />
            </div>

            {/* ── EL BOLETO DE CIRCO VINTAGE (CREMA, ROJO, NEGRO Y BLANCO) ── */}
            <div
              onClick={handleEnterCircus}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleEnterCircus();
              }}
              className="group relative w-full max-w-[440px] sm:max-w-[500px] cursor-pointer transition-all duration-500 hover:scale-[1.03] active:scale-95 focus:outline-none"
            >
              {/* Resplandor exterior en hover */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-red-700 via-[#e8d5b5] to-red-600 opacity-40 blur-xl group-hover:opacity-85 transition-opacity duration-500" />

              {/* Contenedor físico del boleto: estilo papel pergamino / boleto antiguo */}
              <div className="relative rounded-2xl bg-[#f5ebd4] border-2 border-[#b91c1c] shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden flex text-zinc-900">
                
                {/* MUESCA SEMICIRCULAR IZQUIERDA */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#040306] border-r-2 border-[#b91c1c] z-20" />

                {/* TALÓN / STUB DEL BOLETO (LADO IZQUIERDO) */}
                <div className="w-20 sm:w-24 bg-[#ebdabb] border-r-2 border-dashed border-[#b91c1c] p-3 sm:p-4 flex flex-col justify-between items-center text-center select-none relative">
                  <span className="text-[9px] font-mono tracking-widest text-[#b91c1c] font-black uppercase rotate-180 [writing-mode:vertical-rl]">
                    ADMIT ONE
                  </span>
                  <Skull className="w-5 h-5 text-[#b91c1c] my-2 group-hover:rotate-12 transition-transform drop-shadow" />
                  <span className="text-[9px] font-mono tracking-widest text-zinc-800 font-bold [writing-mode:vertical-rl] rotate-180">
                    Nº 666-26
                  </span>
                </div>

                {/* CUERPO PRINCIPAL DEL BOLETO */}
                <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between items-center text-center space-y-3 sm:space-y-4 bg-gradient-to-b from-[#faf4e6] to-[#ebdabb] relative">
                  {/* Encabezado del boleto */}
                  <div className="flex items-center justify-between w-full border-b border-[#b91c1c]/40 pb-2">
                    <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-[0.25em] text-[#b91c1c] uppercase">
                      HALLOWEEN THERAVIT360
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-zinc-800 uppercase">
                      EDICIÓN 2026
                    </span>
                  </div>

                  {/* Pregunta principal solicitada por el usuario */}
                  <div className="py-2 sm:py-3">
                    <div className="text-[10px] sm:text-xs font-mono font-bold text-zinc-700 uppercase tracking-[0.2em] mb-1">
                      ★ CIRCO DE LAS SOMBRAS ★
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-[#b91c1c] drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] group-hover:text-[#991b1b] transition-colors">
                      ¿TE ATREVES A ENTRAR?
                    </h2>
                  </div>

                  {/* Pie del boleto / Llamada de acción */}
                  <div className="w-full pt-2.5 border-t border-[#b91c1c]/40 flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold text-zinc-700 tracking-wider">
                      ★ NO REINGRESO ★
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-black text-[#b91c1c] group-hover:text-black uppercase tracking-widest transition-colors">
                      <span>CRUZAR</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* MUESCA SEMICIRCULAR DERECHA */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#040306] border-l-2 border-[#b91c1c] z-20" />
              </div>
            </div>

            {/* Indicación inferior */}
            <p className="text-[11px] font-mono text-[#f4ebd0]/80 tracking-widest uppercase font-medium">
              Toca el boleto para iniciar la experiencia
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
