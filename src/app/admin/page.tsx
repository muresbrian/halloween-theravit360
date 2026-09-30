"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  QrCode,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Error loading stats:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 20000); // Polling cada 20 segundos
    return () => clearInterval(interval);
  }, []);

  async function handleReconcile() {
    setReconciling(true);
    setReconcileResult(null);
    try {
      const res = await fetch("/api/admin/inventory/reconcile", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setReconcileResult(data.reconciliation);
        await loadStats();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReconciling(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
        Sincronizando métricas con Google Sheets...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
            ESTADO OPERATIVO EN TIEMPO REAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Dashboard General</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${reconciling ? "animate-spin" : ""}`} />
            Reconciliar Inventario
          </button>

          <Link
            href="/admin/scanner"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <QrCode className="w-4 h-4" />
            Abrir Escáner
          </Link>
        </div>
      </div>

      {/* Alerta de Reconciliación si se ejecutó */}
      {reconcileResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
          <span className="font-bold block">✓ Inventario Reconciliado con Éxito</span>
          <span className="text-zinc-400 block">
            Se auditaron los boletos individuales en Google Sheets y se sincronizaron los contadores de inventario.
          </span>
        </div>
      )}

      {/* Alerta de Comprobantes Pendientes */}
      {stats?.pendingReceipts > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white text-sm block">
                Tienes {stats.pendingReceipts} comprobante(s) pendiente(s) de revisión
              </span>
              <span className="text-xs text-amber-200/80">
                Los compradores esperan la validación de su transferencia para recibir sus códigos QR.
              </span>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs shrink-0 flex items-center gap-1.5"
          >
            Revisar
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Grid de KPIs de Inventario & Finanzas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-[#12101b] border border-orange-500/15">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>BOLETOS VENDIDOS</span>
            <Ticket className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-3xl sm:text-4xl font-black text-white font-mono">{stats?.sold || 0}</span>
          <span className="text-[11px] text-zinc-500 block mt-1">de {stats?.totalQuantity || 200} en total</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#12101b] border border-orange-500/15">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>DISPONIBLES</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">{stats?.available || 0}</span>
          <span className="text-[11px] text-zinc-500 block mt-1">{stats?.reserved || 0} en reserva temporal</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#12101b] border border-orange-500/15">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>ACCESOS (PUERTA)</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">{stats?.used || 0}</span>
          <span className="text-[11px] text-zinc-500 block mt-1">{stats?.pendingEntrance || 0} pendientes de entrar</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#12101b] border border-orange-500/15">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>INGRESOS CONFIRMADOS</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            ${stats?.confirmedIncome || 0}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1 font-mono">MXN en cuenta</span>
        </div>
      </div>

      {/* Feed de Últimos Accesos en Puerta */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-orange-500/15 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">Últimos Accesos Registrados en Puerta</h2>
            <p className="text-xs text-zinc-400">Historial en vivo proveniente de la hoja CHECK_INS.</p>
          </div>
          <Link href="/admin/scanner" className="text-xs text-orange-400 hover:underline font-semibold">
            Ir al Escáner →
          </Link>
        </div>

        {stats?.recentCheckIns?.length > 0 ? (
          <div className="divide-y divide-zinc-800/80">
            {stats.recentCheckIns.map((chk: any) => (
              <div key={chk.checkInId} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-white text-xs block">{chk.ticketId}</span>
                    <span className="text-[11px] text-zinc-400">
                      Operador: {chk.checkedInBy} • {chk.method}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-zinc-300">
                    {new Date(chk.checkedInAt).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    {new Date(chk.checkedInAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-zinc-500 font-mono">
            Aún no se registran accesos en puerta.
          </div>
        )}
      </div>
    </div>
  );
}
