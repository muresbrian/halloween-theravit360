"use client";

import { useEffect, useState, useRef } from "react";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  Keyboard,
  Flashlight,
  User,
  Ticket as TicketIcon,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [lastResult, setLastResult] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [manualCode, setManualCode] = useState("");
  const [processingCode, setProcessingCode] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Reproductor de tonos web audio API sin archivos externos
  function playAudioTone(type: "success" | "error" | "warning") {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "error") {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext no permitido sin interacción previa
    }
  }

  async function handleScanSuccess(decodedText: string) {
    if (processingCode) return;
    setProcessingCode(true);

    try {
      const res = await fetch("/api/admin/check-in/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secureToken: decodedText,
          method: "QR_CAMERA",
        }),
      });

      const data = await res.json();
      setLastResult(data);

      if (data.success && data.code === "AUTHORIZED") {
        playAudioTone("success");
      } else if (data.code === "ALREADY_USED") {
        playAudioTone("error");
      } else {
        playAudioTone("warning");
      }
    } catch (e: any) {
      setLastResult({ success: false, code: "ERROR", message: "Error de red: " + e.message });
      playAudioTone("error");
    } finally {
      // Pausa de 2.5 segundos antes del próximo escaneo para evitar lecturas dobles accidentales
      setTimeout(() => {
        setProcessingCode(false);
      }, 2500);
    }
  }

  async function startScanner() {
    setCameraError("");
    setLastResult(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Ignorar frames sin QR
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error(err);
      setCameraError("No se pudo iniciar la cámara trasera. Asegúrate de conceder permisos o usa el ingreso manual.");
      setScanning(false);
    }
  }

  async function stopScanner() {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim() || processingCode) return;
    setProcessingCode(true);

    try {
      const res = await fetch("/api/admin/check-in/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: manualCode.trim(),
          method: "MANUAL_ENTRY",
        }),
      });

      const data = await res.json();
      setLastResult(data);

      if (data.success && data.code === "AUTHORIZED") {
        playAudioTone("success");
      } else if (data.code === "ALREADY_USED") {
        playAudioTone("error");
      } else {
        playAudioTone("warning");
      }
      setManualCode("");
    } catch (e: any) {
      setLastResult({ success: false, code: "ERROR", message: "Error: " + e.message });
      playAudioTone("error");
    } finally {
      setProcessingCode(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      {/* Barra superior de controles del staff */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-orange-400 font-bold uppercase block">
            CONTROL DE ACCESO
          </span>
          <h1 className="text-xl font-black text-white">Escáner de Puerta</h1>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
            soundEnabled
              ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-400"
          }`}
          title={soundEnabled ? "Sonido activado" : "Sonido silenciado"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Visor de Cámara */}
      <div className="rounded-3xl overflow-hidden bg-black border-2 border-orange-500/30 relative shadow-2xl">
        <div id="reader" className="w-full min-h-[300px] flex items-center justify-center" />

        {!scanning && (
          <div className="absolute inset-0 bg-[#0e0c16] flex flex-col items-center justify-center p-6 text-center">
            <Camera className="w-12 h-12 text-orange-500 mb-3" />
            <span className="text-sm font-bold text-white mb-1">Cámara Inactiva</span>
            <span className="text-xs text-zinc-400 max-w-xs mb-6">
              Apunta la cámara trasera a los códigos QR que presenten los invitados.
            </span>
            <button
              onClick={startScanner}
              className="px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Activar Cámara Trasera
            </button>
          </div>
        )}

        {scanning && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={stopScanner}
              className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-white border border-zinc-700 text-xs font-semibold cursor-pointer"
            >
              Detener Cámara
            </button>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
          {cameraError}
        </div>
      )}

      {/* Tarjeta de Resultado del Escaneo (Feedback Inmediato) */}
      {lastResult && (
        <div
          className={`p-6 rounded-3xl border-2 transition-all transform animate-in fade-in zoom-in-95 duration-200 ${
            lastResult.code === "AUTHORIZED"
              ? "bg-emerald-950/90 border-emerald-500 text-white shadow-2xl shadow-emerald-900/50"
              : lastResult.code === "ALREADY_USED"
              ? "bg-red-950/90 border-red-500 text-white shadow-2xl shadow-red-900/50"
              : "bg-amber-950/90 border-amber-500 text-white shadow-2xl shadow-amber-900/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {lastResult.code === "AUTHORIZED" && <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />}
            {lastResult.code === "ALREADY_USED" && <XCircle className="w-8 h-8 text-red-400 shrink-0" />}
            {lastResult.code !== "AUTHORIZED" && lastResult.code !== "ALREADY_USED" && (
              <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
            )}
            <div>
              <h2 className="text-xl font-black tracking-tight">{lastResult.message}</h2>
              {lastResult.ticket && (
                <span className="font-mono text-xs opacity-90 block">
                  Boleto: {lastResult.ticket.ticketNumber} • {lastResult.ticket.ticketTypeName}
                </span>
              )}
            </div>
          </div>

          {lastResult.ticket?.attendeeName && (
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-sm font-bold">
              <User className="w-4 h-4 opacity-80" />
              <span>Invitado: {lastResult.ticket.attendeeName}</span>
            </div>
          )}
        </div>
      )}

      {/* Ingreso Manual de Código */}
      <div className="p-5 rounded-3xl bg-[#12101b] border border-orange-500/15 space-y-3">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-orange-400" />
          Ingreso Manual por Folio o Token
        </span>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ej. HAL-0042-01"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#1a1726] border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500 font-mono uppercase"
          />
          <button
            type="submit"
            disabled={processingCode || !manualCode.trim()}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            {processingCode ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Validar
          </button>
        </form>
      </div>
    </div>
  );
}
