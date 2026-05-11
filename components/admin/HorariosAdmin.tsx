"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Slot = {
  id: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
  orden: number;
};

type Reserva = {
  id: string;
  slot_id: string;
  cliente: { id: string; nombre: string } | null;
};

const DOW_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function fmtFechaCompact(iso: string) {
  const d = new Date(iso + "T00:00");
  return `${DOW_LABEL[d.getDay()]} ${d.getDate()}`;
}

function fmtFechaLarga(iso: string) {
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function HorariosAdmin({
  slots,
  reservas,
  fechaSeleccionada,
  fechasDisponibles,
}: {
  slots: Slot[];
  reservas: Reserva[];
  fechaSeleccionada: string;
  fechasDisponibles: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [removing, setRemoving] = useState<string | null>(null);

  function setFecha(f: string) {
    router.push(`/admin/horarios?fecha=${f}`);
  }

  function getReservas(slotId: string) {
    return reservas.filter((r) => r.slot_id === slotId);
  }

  async function eliminarReserva(id: string) {
    if (!confirm("¿Eliminar esta reserva?")) return;
    setRemoving(id);
    const { error } = await supabase.from("reservas").delete().eq("id", id);
    if (!error) router.refresh();
    setRemoving(null);
  }

  const totalReservas = reservas.length;
  const capacidadTotal = slots.reduce((s, sl) => s + sl.capacidad, 0);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">Administración</p>
        <h1 className="font-black text-3xl tracking-tight">
          Horarios y <span className="text-accent">reservas</span>
        </h1>
        <p className="text-sm text-muted mt-1">
          Selecciona una fecha para ver quiénes reservaron clase ese día.
        </p>
      </div>

      {/* Date picker — scroll horizontal */}
      <div className="mb-6 -mx-1 overflow-x-auto pb-2">
        <div className="flex gap-2 px-1 min-w-max">
          {fechasDisponibles.map((f) => {
            const active = f === fechaSeleccionada;
            return (
              <button
                key={f}
                onClick={() => setFecha(f)}
                className={`flex flex-col items-center justify-center min-w-[64px] px-3 py-2 rounded-xl border transition-all ${
                  active
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-[rgba(255,255,255,0.08)] hover:border-accent/40 text-muted hover:text-text"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {fmtFechaCompact(f).split(" ")[0]}
                </span>
                <span className="text-lg font-bold">
                  {fmtFechaCompact(f).split(" ")[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen del día */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-0.5">Resumen</p>
          <p className="font-bold text-lg capitalize">{fmtFechaLarga(fechaSeleccionada)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-2xl text-accent">
            {totalReservas}<span className="text-muted text-sm">/{capacidadTotal}</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted">reservas hoy</p>
        </div>
      </div>

      {/* Lista de slots */}
      <div className="space-y-3">
        {slots.map((slot) => {
          const slotReservas = getReservas(slot.id);
          const ocupacion = slotReservas.length;
          const lleno = ocupacion >= slot.capacidad;
          return (
            <div
              key={slot.id}
              className={`rounded-2xl border p-5 ${
                lleno
                  ? "bg-amber/5 border-amber/30"
                  : "bg-surface border-[rgba(255,255,255,0.08)]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-lg">
                    {slot.hora_inicio.slice(0, 5)} – {slot.hora_fin.slice(0, 5)}
                  </p>
                  <p className="text-xs text-muted">
                    {ocupacion} de {slot.capacidad} cupos ocupados
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    lleno
                      ? "bg-amber/15 text-amber border border-amber/30"
                      : ocupacion > 0
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "bg-surface2 text-muted border border-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  {lleno ? "Lleno" : ocupacion === 0 ? "Sin reservas" : `${slot.capacidad - ocupacion} libres`}
                </span>
              </div>

              {/* Barra de capacidad */}
              <div className="bg-bg/40 rounded-full h-1.5 overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all ${lleno ? "bg-amber" : "bg-accent"}`}
                  style={{ width: `${Math.min((ocupacion / slot.capacidad) * 100, 100)}%` }}
                />
              </div>

              {/* Lista de reservas */}
              {slotReservas.length === 0 ? (
                <p className="text-xs text-muted italic">Sin reservas para esta clase.</p>
              ) : (
                <div className="space-y-1.5">
                  {slotReservas.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-bg/30 rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">
                          {r.cliente?.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "—"}
                        </div>
                        <span className="text-sm text-text truncate">{r.cliente?.nombre ?? "Sin nombre"}</span>
                      </div>
                      <button
                        onClick={() => eliminarReserva(r.id)}
                        disabled={removing === r.id}
                        className="text-xs text-muted hover:text-accent transition-colors px-2 py-1 disabled:opacity-50"
                        title="Quitar reserva"
                      >
                        {removing === r.id ? "..." : "✕"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
