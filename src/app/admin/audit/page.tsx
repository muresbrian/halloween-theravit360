"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, RefreshCw, ShieldAlert, Clock, User } from "lucide-react";

export default function AdminAuditPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  async function loadLogs() {
    try {
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
            TRAZABILIDAD Y REGISTRO
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Bitácora de Auditoría</h1>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            loadLogs();
          }}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar Registros
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          Consultando AUDIT_LOG desde Google Sheets...
        </div>
      ) : (
        <div className="rounded-2xl border border-orange-500/15 overflow-hidden bg-[#12101b]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181524] text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Fecha / Hora</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Entidad</th>
                  <th className="p-4">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                      No hay registros de auditoría en la hoja AUDIT_LOG.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any, idx: number) => (
                    <tr key={log.logId || idx} className="hover:bg-[#161322] transition-colors">
                      <td className="p-4 font-mono text-zinc-400 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/D"}
                      </td>

                      <td className="p-4 font-semibold text-white">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-orange-400" />
                          {log.actor || "SISTEMA"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/20">
                          {log.action}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-zinc-400">
                        {log.entity} {log.entityId ? `(${log.entityId})` : ""}
                      </td>

                      <td className="p-4 text-zinc-300 font-mono text-[11px] max-w-xs truncate">
                        {typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details || "")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
