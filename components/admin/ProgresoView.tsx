"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProgresoEntry = {
  id: string;
  fecha: string;
  peso?: number;
  nota_coach?: string;
};

type Cliente = {
  id: string;
  nombre: string;
  peso_inicial?: number;
  peso_actual?: number;
  peso_meta?: number;
};

export default function ProgresoView({
  cliente,
  progreso: initial,
}: {
  cliente: Cliente;
  progreso: ProgresoEntry[];
}) {
  const [progreso, setProgreso] = useState(initial);
  const [peso, setPeso] = useState("");
  const [nota, setNota] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const diff =
    cliente.peso_inicial && cliente.peso_actual
      ? (cliente.peso_actual - cliente.peso_inicial).toFixed(1)
      : null;

  // Simple bar chart — last 8 entries
  const chartData = [...progreso].reverse().slice(-8);
  const maxPeso = Math.max(...chartData.map((p) => p.peso ?? 0)) || 1;

  async function handleAdd() {
    if (!peso) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("progreso")
      .insert({
        cliente_id: cliente.id,
        fecha,
        peso: Number(peso),
        nota_coach: nota || null,
      })
      .select("*")
      .single();

    if (!error && data) {
      setProgreso((prev) => [data, ...prev]);
      // Update peso_actual on client
      await supabase.from("clientes").update({ peso_actual: Number(peso) }).eq("id", cliente.id);
      setPeso("");
      setNota("");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-center">
          <p className="font-data font-bold text-xl text-muted">{cliente.peso_inicial ?? "—"}</p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Inicial kg</p>
        </div>
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 text-center">
          <p className="font-data font-bold text-xl text-accent">{cliente.peso_actual ?? "—"}</p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Actual kg</p>
        </div>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-center">
          <p className="font-data font-bold text-xl text-green">{cliente.peso_meta ?? "—"}</p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Meta kg</p>
        </div>
      </div>

      {diff && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-display font-bold ${
          Number(diff) < 0 ? "bg-green/10 text-green border border-green/20" : "bg-accent/10 text-accent border border-accent/20"
        }`}>
          {Number(diff) < 0 ? "▼" : "▲"} {Math.abs(Number(diff))} kg desde el inicio
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
          <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Evolución</p>
          <div className="flex items-end gap-2 h-20 mb-2">
            {chartData.map((p, i) => (
              <div
                key={p.id}
                className={`flex-1 rounded-t-md transition-all ${
                  i === chartData.length - 1 ? "bg-accent" : "bg-accent/25 border border-accent/20"
                }`}
                style={{ height: `${((p.peso ?? 0) / maxPeso) * 100}%`, minHeight: "4px" }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {chartData.map((p) => (
              <div key={p.id} className="flex-1 text-center text-[9px] text-muted font-display truncate">
                {new Date(p.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add entry */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Registrar</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="number" step="0.1" placeholder="Peso (kg)"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className={inputCls}
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={inputCls}
          />
          <input
            placeholder="Nota del coach (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className={inputCls + " col-span-2"}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={saving || !peso}
          className="bg-accent text-white font-display font-bold text-sm px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Guardar
        </button>
      </div>

      {/* History */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs font-display uppercase tracking-widest text-muted">Historial</p>
        </div>
        {progreso.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted text-center">Sin registros.</p>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {progreso.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted mb-0.5">
                    {new Date(p.fecha).toLocaleDateString("es-MX", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  {p.nota_coach && <p className="text-xs text-text/60 italic">{p.nota_coach}</p>}
                </div>
                {p.peso && (
                  <span className="font-data font-bold text-sm text-text flex-shrink-0">{p.peso} kg</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-text text-sm outline-none focus:border-accent transition-colors w-full";
