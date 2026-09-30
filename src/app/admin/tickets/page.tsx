"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Search,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { resolveTicketTemplate } from "@/lib/ticket-templates";

export default function AdminTicketsPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  async function loadTickets() {
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        setTicketTypes(data.ticketTypes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleRegenerate(ticketId: string, ticketNumber: string) {
    const confirmReason = window.prompt(
      `¿Deseas invalidar el código QR actual de ${ticketNumber} y generar uno nuevo? Ingresa el motivo:`
    );
    if (!confirmReason) return;

    setRegeneratingId(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: confirmReason }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✓ Código QR regenerado con éxito. El QR anterior ha sido revocado.");
        await loadTickets();
      } else {
        alert(data.error || "No se pudo regenerar el QR.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setRegeneratingId(null);
    }
  }

  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.attendeeName?.toLowerCase().includes(q) ||
      t.attendeePhone?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
            UNIDADES INDIVIDUALES DE ACCESO
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Control de Boletos</h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por boleto, asistente, estado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#12101b] border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          Cargando boletos individuales...
        </div>
      ) : (
        <div className="rounded-2xl border border-orange-500/15 overflow-hidden bg-[#12101b]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181524] text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Boleto / Tipo</th>
                  <th className="p-4">Asistente</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acceso (Check-in)</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                      No se encontraron boletos.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((tkt) => {
                    const isUsed = tkt.status === "UTILIZADO";
                    const isPaid = tkt.status === "PAGADO";
                    const tt = ticketTypes.find((x) => x.id === tkt.ticketTypeId);
                    const template = resolveTicketTemplate(tkt);

                    return (
                      <tr key={tkt.ticketId} className="hover:bg-[#161322] transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-white block text-sm">{tkt.ticketNumber}</span>
                          <span className="text-[11px] text-red-400 font-medium block">{tt ? tt.name : "GENERAL"}</span>
                          <span className="text-[10px] text-zinc-400 font-mono block">🎭 {template.name}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-white block">{tkt.attendeeName || "Sin asignar"}</span>
                          <span className="text-[11px] text-zinc-400 block">{tkt.attendeePhone || "Sin teléfono"}</span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                              isUsed
                                ? "bg-purple-950/80 text-purple-300 border border-purple-500/30"
                                : isPaid
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {tkt.status}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px]">
                          {isUsed ? (
                            <div>
                              <span className="text-purple-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {new Date(tkt.usedAt).toLocaleTimeString()}
                              </span>
                              <span className="text-zinc-500 block">por {tkt.usedBy || "Staff"}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Pendiente
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/ticket/${tkt.secureToken}`}
                              target="_blank"
                              className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Abrir pase del invitado"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Ver Pase
                            </Link>

                            {!isUsed && (
                              <button
                                onClick={() => handleRegenerate(tkt.ticketId, tkt.ticketNumber)}
                                disabled={regeneratingId === tkt.ticketId}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Invalidar QR actual y generar uno nuevo"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === tkt.ticketId ? "animate-spin" : ""}`} />
                                Regenerar QR
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
