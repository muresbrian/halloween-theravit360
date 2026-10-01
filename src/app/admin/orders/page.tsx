"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Check,
  X,
  ExternalLink,
  Clock,
  AlertCircle,
  Loader2,
  FileCheck,
  Filter,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [filterStatus, setFilterStatus] = useState("TODAS");
  const [searchQuery, setSearchQuery] = useState("");

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        setPayments(data.payments || []);
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleReview(orderId: string, decision: "APPROVE" | "REJECT") {
    let rejectionReason = "";
    if (decision === "REJECT") {
      const promptRes = window.prompt("Ingresa el motivo del rechazo del comprobante:");
      if (!promptRes) return;
      rejectionReason = promptRes;
    }

    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, rejectionReason }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.message) {
          alert("✓ " + data.message);
        }
        await loadOrders();
      } else {
        alert(data.error || "Error al procesar acción.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      filterStatus === "TODAS"
        ? true
        : filterStatus === "COMPROBANTE_RECIBIDO"
        ? o.status === "COMPROBANTE_RECIBIDO"
        : o.status === filterStatus;

    const cus = customers.find((c) => c.customerId === o.customerId);
    const cusName = cus ? cus.name.toLowerCase() : "";
    const cusPhone = cus ? cus.phone.toLowerCase() : "";
    const cusEmail = cus ? cus.email.toLowerCase() : "";
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      !q ||
      o.folio?.toLowerCase().includes(q) ||
      cusName.includes(q) ||
      cusPhone.includes(q) ||
      cusEmail.includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
            GESTIÓN DE COMPRAS Y PAGOS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Órdenes de Boletos</h1>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-[#12101b] border border-orange-500/15 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filtros por estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["TODAS", "COMPROBANTE_RECIBIDO", "PAGADA", "RESERVADA", "RECHAZADA", "EXPIRADA"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-orange-500 text-white font-bold"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-white"
              }`}
            >
              {st === "COMPROBANTE_RECIBIDO" ? "Por Revisar" : st}
            </button>
          ))}
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por folio, nombre, tel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1a1726] border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Tabla de Órdenes */}
      {loading ? (
        <div className="py-20 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          Cargando órdenes desde Google Sheets...
        </div>
      ) : (
        <div className="rounded-2xl border border-orange-500/15 overflow-hidden bg-[#12101b]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181524] text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Folio / Fecha</th>
                  <th className="p-4">Comprador</th>
                  <th className="p-4">Boletos / Total</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Comprobante</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                      No se encontraron órdenes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const cus = customers.find((c) => c.customerId === ord.customerId);
                    const pay = payments.find((p) => p.orderId === ord.orderId);
                    const isReviewable = ord.status === "COMPROBANTE_RECIBIDO";

                    return (
                      <tr key={ord.orderId} className="hover:bg-[#161322] transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-white block text-sm">{ord.folio}</span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {ord.claimCode && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-amber-300 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-600/30">
                              Código: {ord.claimCode}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-white block">{cus ? cus.name : "Anónimo"}</span>
                          <span className="text-[11px] text-zinc-400 block">{cus ? cus.phone : ""}</span>
                          <span className="text-[11px] text-zinc-500 block">{cus ? cus.email : ""}</span>
                        </td>

                        <td className="p-4 font-mono">
                          <span className="font-bold text-white block">{ord.quantity} boletos</span>
                          <span className="text-orange-400 font-extrabold text-sm">${ord.totalAmount} MXN</span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                              ord.status === "PAGADA"
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                                : ord.status === "COMPROBANTE_RECIBIDO"
                                ? "bg-blue-950/80 text-blue-400 border border-blue-500/30"
                                : ord.status === "RESERVADA"
                                ? "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {ord.status === "COMPROBANTE_RECIBIDO" ? "Por Validar" : ord.status}
                          </span>
                        </td>

                        <td className="p-4">
                          {pay?.receiptUrl ? (
                            <button
                              onClick={() => setSelectedReceipt(pay.receiptUrl)}
                              className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Ver Recibo
                            </button>
                          ) : (
                            <span className="text-zinc-600 text-[11px] font-mono">Sin subir</span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {isReviewable ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleReview(ord.orderId, "APPROVE")}
                                disabled={actionLoading === ord.orderId}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-colors cursor-pointer"
                                title="Aprobar pago y activar boletos"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleReview(ord.orderId, "REJECT")}
                                disabled={actionLoading === ord.orderId}
                                className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                title="Rechazar comprobante"
                              >
                                <X className="w-3.5 h-3.5" />
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span className="text-zinc-600 font-mono text-[11px]">Resuelta</span>
                          )}
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

      {/* Modal Visor de Comprobante de Pago */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14121d] border border-orange-500/30 rounded-3xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Comprobante de Pago en Google Drive</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <iframe
                src={selectedReceipt.replace("/view", "/preview")}
                className="w-full h-[60vh] border-0"
                title="Comprobante en Drive"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={selectedReceipt}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir archivo original en Google Drive
              </a>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
