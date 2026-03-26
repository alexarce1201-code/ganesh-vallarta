"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Registro = {
  id: string;
  cliente_id: string;
  fecha: string;
  peso: number | null;
  nota_coach: string | null;
  cintura: number | null;
  cadera: number | null;
  pecho: number | null;
  brazo: number | null;
};

interface Props {
  clienteId: string;
  pesoMeta: number | null;
  registros: Registro[];
}

export default function ProgresoClient({ clienteId, pesoMeta, registros }: Props) {
  const router  = useRouter();
  const latest  = registros[registros.length - 1] ?? null;
  const last8   = registros.slice(-8);

  const [peso,   setPeso]   = useState("");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const [ok,     setOk]     = useState(false);

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!peso || isNaN(Number(peso))) { setErr("Ingresa un peso válido."); return; }
    setSaving(true);
    setErr("");
    setOk(false);

    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("progreso").insert({
      cliente_id: clienteId,
      fecha: today,
      peso: Number(peso),
    });

    if (error) {
      setErr(error.message);
    } else {
      setOk(true);
      setPeso("");
      router.refresh();
    }
    setSaving(false);
  }

  // Calculate weight change
  const firstPeso = registros.find((r) => r.peso != null)?.peso ?? null;
  const pesoActual = latest?.peso ?? null;
  const cambio = (firstPeso != null && pesoActual != null)
    ? (pesoActual - firstPeso)
    : null;

  // Bar chart max
  const maxPeso = last8.length > 0
    ? Math.max(...last8.map((r) => r.peso ?? 0)) + 2
    : 100;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <p className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-1">
          Seguimiento
        </p>
        <h1 className="font-display font-black text-2xl text-text tracking-tight">
          Progreso
        </h1>
      </div>

      {/* ── Weight chart ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Evolución de peso
        </h2>
        {last8.length > 0 ? (
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
            {/* Bar chart */}
            <div className="flex items-end gap-2 h-32">
              {last8.map((r, i) => {
                const height = r.peso ? Math.max(4, (r.peso / maxPeso) * 100) : 4;
                const isLatest = i === last8.length - 1;
                return (
                  <div key={r.id} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[9px] font-data text-muted">
                      {r.peso ?? "—"}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isLatest ? "bg-accent" : "bg-accent/30"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] font-data text-muted/60 truncate w-full text-center">
                      {formatFecha(r.fecha)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Goal line indicator */}
            {pesoMeta && (
              <p className="text-xs text-muted mt-3 text-center font-data">
                Meta: <span className="text-green font-semibold">{pesoMeta} kg</span>
                {pesoActual && (
                  <span className="ml-2">
                    · Faltan{" "}
                    <span className={pesoActual > pesoMeta ? "text-accent" : "text-green"}>
                      {Math.abs(pesoActual - pesoMeta).toFixed(1)} kg
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 text-center">
            <p className="text-muted text-sm">Aún no hay registros de peso.</p>
          </div>
        )}
      </section>

      {/* ── Body measurements ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Medidas corporales
        </h2>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <MeasureRow
            label="Peso"
            value={latest?.peso != null ? `${latest.peso} kg` : null}
            color="accent"
          />
          <MeasureRow
            label="Cintura"
            value={latest?.cintura != null ? `${latest.cintura} cm` : null}
            color="blue"
          />
          <MeasureRow
            label="Cadera"
            value={latest?.cadera != null ? `${latest.cadera} cm` : null}
            color="green"
          />
          <MeasureRow
            label="Pecho"
            value={latest?.pecho != null ? `${latest.pecho} cm` : null}
            color="amber"
          />
          <MeasureRow
            label="Brazo"
            value={latest?.brazo != null ? `${latest.brazo} cm` : null}
            color="blue"
            last
          />
        </div>
        {cambio != null && (
          <p className="text-xs text-muted text-center mt-2 font-data">
            Cambio total:{" "}
            <span className={cambio <= 0 ? "text-green font-semibold" : "text-accent font-semibold"}>
              {cambio > 0 ? "+" : ""}{cambio.toFixed(1)} kg
            </span>
          </p>
        )}
      </section>

      {/* ── Register weight form ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Registrar peso hoy
        </h2>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
          <form onSubmit={handleGuardar} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-display font-semibold uppercase tracking-widest text-muted mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={peso}
                onChange={(e) => { setPeso(e.target.value); setErr(""); setOk(false); }}
                placeholder="ej. 78.5"
                className="w-full bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-accent transition-colors font-data"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white font-display font-bold text-sm px-5 py-3 rounded-xl disabled:opacity-60 hover:bg-accent/90 transition-all shrink-0"
            >
              {saving ? "..." : "Guardar"}
            </button>
          </form>

          {err && (
            <p className="text-accent text-xs mt-2 bg-accent/10 border border-accent/20 rounded-xl px-3 py-2">
              {err}
            </p>
          )}
          {ok && (
            <p className="text-green text-xs mt-2 bg-green/10 border border-green/20 rounded-xl px-3 py-2">
              Peso registrado correctamente.
            </p>
          )}
        </div>
      </section>

      {/* ── Coach note ── */}
      {latest?.nota_coach && (
        <section>
          <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
            Nota de tu coach
          </h2>
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-2xl" />
            <p className="pl-3 text-text text-sm leading-relaxed">{latest.nota_coach}</p>
            <p className="pl-3 text-muted/60 text-xs mt-2 font-data">
              {formatFechaLong(latest.fecha)}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function MeasureRow({
  label, value, color, last = false,
}: { label: string; value: string | null; color: string; last?: boolean }) {
  const colorText: Record<string, string> = {
    accent: "text-accent",
    green:  "text-green",
    blue:   "text-blue",
    amber:  "text-amber",
  };
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${!last ? "border-b border-[rgba(255,255,255,0.06)]" : ""}`}>
      <span className="text-sm font-display font-semibold text-muted">{label}</span>
      <span className={`font-data font-bold text-base ${value ? (colorText[color] ?? "text-text") : "text-muted/50"}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function formatFechaLong(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}
