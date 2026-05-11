"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Cliente = { id: string; nombre: string; monto_mensual: number };
type Pago = { id: string; cliente_id: string; monto: number; estado: string };

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
  const [editing, setEditing] = useState<string | null>(null);
  const [editMonto, setEditMonto] = useState<number>(0);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();
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

  async function guardarMonto(pagoId: string) {
    setLoading(pagoId);
    const { error } = await supabase
      .from("pagos")
      .update({ monto: editMonto })
      .eq("id", pagoId);
    if (!error) {
      setPagos((prev) =>
        prev.map((p) => (p.id === pagoId ? { ...p, monto: editMonto } : p))
      );
      setEditing(null);
    }
    setLoading(null);
  }

  async function recalcularDesdeMembresia(pago: Pago, cliente: Cliente) {
    setLoading(pago.id);
    const monto = cliente.monto_mensual ?? 700;
    const { error } = await supabase
      .from("pagos")
      .update({ monto })
      .eq("id", pago.id);
    if (!error) {
      setPagos((prev) =>
        prev.map((p) => (p.id === pago.id ? { ...p, monto } : p))
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
      monto: c.monto_mensual ?? 700,
      estado: "pendiente",
      tipo: "grupal",
    }));
    const { data, error } = await supabase.from("pagos").insert(inserts).select("*");
    if (!error && data) {
      setPagos((prev) => [...prev, ...data]);
    }
    setGenerating(false);
    router.refresh();
  }

  const sinPago = clientes.filter((c) => !getPago(c.id));

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-green/10 border border-green/20 rounded-xl p-3 text-center">
          <p className="font-bold text-xl text-green">${totalPagado.toLocaleString("es-MX")}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted">Pagado</p>
        </div>
        <div className="bg-amber/10 border border-amber/20 rounded-xl p-3 text-center">
          <p className="font-bold text-xl text-amber">${totalPendiente.toLocaleString("es-MX")}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted">Pendiente</p>
        </div>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-center col-span-2 lg:col-span-1">
          <p className="font-bold text-xl text-text">${(totalPagado + totalPendiente).toLocaleString("es-MX")}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted">Total mes</p>
        </div>
      </div>

      {/* Generate button */}
      {sinPago.length > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-text">
            {sinPago.length} miembro{sinPago.length > 1 ? "s" : ""} sin registro de pago este mes.
          </p>
          <button
            onClick={generarMes}
            disabled={generating}
            className="bg-accent text-white font-bold text-xs px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {generating ? "Generando..." : "Generar mes"}
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs uppercase tracking-widest text-muted">
            Miembros ({clientes.length})
          </p>
        </div>
        {clientes.length === 0 ? (
          <p className="px-5 py-8 text-center text-muted text-sm">Sin miembros activos.</p>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {clientes.map((c) => {
              const pago = getPago(c.id);
              const pagado = pago?.estado === "pagado";
              const isEditing = pago && editing === pago.id;
              const desactualizado = pago && pago.monto !== c.monto_mensual;

              return (
                <div key={c.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-xs flex-shrink-0">
                      {c.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text">{c.nombre}</p>
                      <p className="text-xs text-muted">
                        Membresía: ${(c.monto_mensual ?? 700).toLocaleString("es-MX")}/mes
                      </p>
                    </div>

                    {/* Monto del pago — editable */}
                    {pago && (
                      isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted">$</span>
                          <input
                            type="number"
                            value={editMonto}
                            onChange={(e) => setEditMonto(Number(e.target.value))}
                            className="w-20 bg-surface2 border border-accent/40 rounded-lg px-2 py-1 text-sm text-text outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => guardarMonto(pago.id)}
                            disabled={loading === pago.id}
                            className="text-xs font-bold text-green px-2 py-1 hover:bg-green/10 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="text-xs text-muted px-2 py-1 hover:bg-surface2 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditing(pago.id);
                            setEditMonto(pago.monto);
                          }}
                          className={`text-sm font-bold px-2 py-1 rounded hover:bg-surface2 transition-colors ${
                            desactualizado ? "text-amber" : "text-text"
                          }`}
                          title={desactualizado ? "El monto del pago no coincide con la membresía actual" : "Click para editar"}
                        >
                          ${(pago.monto ?? 0).toLocaleString("es-MX")}
                        </button>
                      )
                    )}

                    {pago ? (
                      <button
                        onClick={() => toggleEstado(c.id)}
                        disabled={loading === c.id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                          pagado
                            ? "bg-green/15 text-green border border-green/20 hover:bg-green/25"
                            : "bg-amber/15 text-amber border border-amber/20 hover:bg-amber/25"
                        }`}
                      >
                        {loading === c.id ? "..." : pagado ? "✓ Pagado" : "Pendiente"}
                      </button>
                    ) : (
                      <span className="text-xs text-muted">Sin registro</span>
                    )}
                  </div>

                  {/* Aviso si el monto del pago no coincide con la membresía */}
                  {desactualizado && pago && (
                    <div className="mt-2 ml-13 flex items-center gap-2 text-xs">
                      <span className="text-amber">⚠ El pago ($
                        {pago.monto.toLocaleString("es-MX")}) no coincide con la membresía actual ($
                        {c.monto_mensual.toLocaleString("es-MX")}).</span>
                      <button
                        onClick={() => recalcularDesdeMembresia(pago, c)}
                        disabled={loading === pago.id}
                        className="text-accent font-bold hover:underline"
                      >
                        Actualizar
                      </button>
                    </div>
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
