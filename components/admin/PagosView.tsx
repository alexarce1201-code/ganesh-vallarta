"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRECIO_GRUPAL, PRECIO_INDIVIDUAL } from "@/lib/constants";

type Cliente = { id: string; nombre: string; tipo: string };
type Pago = { id: string; cliente_id: string; monto: number; estado: string; tipo: string };

export default function PagosView({
  clientes,
  pagos: initialPagos,
  mesActual,
}: {
  clientes: Cliente[];
  pagos: Pago[];
  mesActual: string;
}) {
  const [pagos, setPagos] = useState(initialPagos);
  const [loading, setLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const supabase = createClient();

  function getPago(clienteId: string) {
    return pagos.find((p) => p.cliente_id === clienteId);
  }

  const totalPagado = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((s, p) => s + (p.monto ?? 0), 0);

  const totalPendiente = pagos
    .filter((p) => p.estado === "pendiente")
    .reduce((s, p) => s + (p.monto ?? 0), 0);

  async function toggleEstado(clienteId: string) {
    const pago = getPago(clienteId);
    if (!pago) return;
    setLoading(clienteId);
    const nuevoEstado = pago.estado === "pagado" ? "pendiente" : "pagado";
    const { error } = await supabase
      .from("pagos")
      .update({ estado: nuevoEstado })
      .eq("id", pago.id);
    if (!error) {
      setPagos((prev) =>
        prev.map((p) => (p.id === pago.id ? { ...p, estado: nuevoEstado } : p))
      );
    }
    setLoading(null);
  }

  async function generarMes() {
    setGenerating(true);
    const clientesSinPago = clientes.filter((c) => !getPago(c.id));
    if (clientesSinPago.length === 0) {
      setGenerating(false);
      return;
    }
    const inserts = clientesSinPago.map((c) => ({
      cliente_id: c.id,
      mes: mesActual,
      monto: c.tipo === "individual" ? PRECIO_INDIVIDUAL : PRECIO_GRUPAL,
      estado: "pendiente",
      tipo: c.tipo,
    }));
    const { data, error } = await supabase.from("pagos").insert(inserts).select("*");
    if (!error && data) {
      setPagos((prev) => [...prev, ...data]);
    }
    setGenerating(false);
  }

  const sinPago = clientes.filter((c) => !getPago(c.id));

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-green/10 border border-green/20 rounded-xl p-3 text-center">
          <p className="font-data font-bold text-xl text-green">
            ${totalPagado.toLocaleString("es-MX")}
          </p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Pagado</p>
        </div>
        <div className="bg-amber/10 border border-amber/20 rounded-xl p-3 text-center">
          <p className="font-data font-bold text-xl text-amber">
            ${totalPendiente.toLocaleString("es-MX")}
          </p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Pendiente</p>
        </div>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-center col-span-2 lg:col-span-1">
          <p className="font-data font-bold text-xl text-text">
            ${(totalPagado + totalPendiente).toLocaleString("es-MX")}
          </p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Total mes</p>
        </div>
      </div>

      {/* Generate button */}
      {sinPago.length > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-text">
            {sinPago.length} cliente{sinPago.length > 1 ? "s" : ""} sin registro de pago este mes.
          </p>
          <button
            onClick={generarMes}
            disabled={generating}
            className="bg-accent text-white font-display font-bold text-xs px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {generating ? "Generando..." : "Generar mes"}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs font-display uppercase tracking-widest text-muted">
            Clientes ({clientes.length})
          </p>
        </div>
        {clientes.length === 0 ? (
          <p className="px-5 py-8 text-center text-muted text-sm">Sin clientes activos.</p>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {clientes.map((c) => {
              const pago = getPago(c.id);
              const pagado = pago?.estado === "pagado";
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-display font-bold text-accent text-xs flex-shrink-0">
                    {c.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{c.nombre}</p>
                    <p className="text-xs text-muted">
                      {c.tipo} — ${(c.tipo === "individual" ? PRECIO_INDIVIDUAL : PRECIO_GRUPAL).toLocaleString("es-MX")}/mes
                    </p>
                  </div>
                  {pago ? (
                    <button
                      onClick={() => toggleEstado(c.id)}
                      disabled={loading === c.id}
                      className={`text-xs px-3 py-1.5 rounded-lg font-display font-bold transition-all ${
                        pagado
                          ? "bg-green/15 text-green border border-green/20 hover:bg-green/25"
                          : "bg-amber/15 text-amber border border-amber/20 hover:bg-amber/25"
                      }`}
                    >
                      {loading === c.id ? "..." : pagado ? "✓ Pagado" : "Pendiente"}
                    </button>
                  ) : (
                    <span className="text-xs text-muted font-display">Sin registro</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
