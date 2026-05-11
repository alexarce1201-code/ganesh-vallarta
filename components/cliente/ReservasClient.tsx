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

type MiReserva = {
  id: string;
  slot_id: string;
  fecha: string;
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

export default function ReservasClient({
  clienteId,
  slots,
  conteoPorSlot,
  misReservas,
  fechaSeleccionada,
  fechasDisponibles,
}: {
  clienteId: string;
  slots: Slot[];
  conteoPorSlot: Record<string, number>;
  misReservas: MiReserva[];
  fechaSeleccionada: string;
  fechasDisponibles: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError]     = useState("");

  function setFecha(f: string) {
    setError("");
    router.push(`/cliente/clases?fecha=${f}`);
  }

  function miReserva(slotId: string, fecha: string) {
    return misReservas.find((r) => r.slot_id === slotId && r.fecha === fecha);
  }

  async function reservar(slotId: string) {
    setLoading(slotId);
    setError("");
    const { error: dbError } = await supabase
      .from("reservas")
      .insert({ cliente_id: clienteId, slot_id: slotId, fecha: fechaSeleccionada });
    if (dbError) {
      setError(
        dbError.message.includes("Cupo lleno") || dbError.code === "23514"
          ? "Esta clase ya está llena. Prueba con otro horario."
          : "No se pudo crear la reserva. Intenta de nuevo."
      );
    } else {
      router.refresh();
    }
    setLoading(null);
  }

  async function cancelar(reservaId: string) {
    setLoading(reservaId);
    setError("");
    const { error: dbError } = await supabase.from("reservas").delete().eq("id", reservaId);
    if (dbError) {
      setError("No se pudo cancelar la reserva.");
    } else {
      router.refresh();
    }
    setLoading(null);
  }

  // Reservas próximas (todas las fechas)
  const proximas = [...misReservas]
    .filter((r) => r.fecha >= fechasDisponibles[0])
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Reservar clase</p>
        <h1 className="font-black text-2xl text-text tracking-tight">
          Elige tu <span className="text-accent">horario</span>
        </h1>
      </div>

      {/* Mis próximas reservas */}
      {proximas.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            Mis próximas reservas ({proximas.length})
          </h2>
          <div className="space-y-2">
            {proximas.slice(0, 3).map((r) => {
              const slot = slots.find((s) => s.id === r.slot_id);
              return (
                <div
                  key={r.id}
                  className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-text capitalize">{fmtFechaLarga(r.fecha)}</p>
                    <p className="text-accent font-bold text-sm">
                      {slot ? `${slot.hora_inicio.slice(0, 5)} – ${slot.hora_fin.slice(0, 5)}` : "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => cancelar(r.id)}
                    disabled={loading === r.id}
                    className="text-xs text-muted hover:text-accent transition-colors disabled:opacity-50"
                  >
                    {loading === r.id ? "..." : "Cancelar"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Date picker */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
          Elige fecha
        </h2>
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex gap-2 px-1 min-w-max">
            {fechasDisponibles.map((f) => {
              const active = f === fechaSeleccionada;
              return (
                <button
                  key={f}
                  onClick={() => setFecha(f)}
                  className={`flex flex-col items-center justify-center min-w-[58px] px-3 py-2 rounded-xl border transition-all ${
                    active
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-[rgba(255,255,255,0.08)] hover:border-accent/40 text-muted"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-70">
                    {fmtFechaCompact(f).split(" ")[0]}
                  </span>
                  <span className="text-base font-bold">{fmtFechaCompact(f).split(" ")[1]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Slots */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3 capitalize">
          {fmtFechaLarga(fechaSeleccionada)}
        </h2>

        {error && (
          <div className="mb-3 bg-amber/10 border border-amber/30 text-amber text-sm rounded-xl px-4 py-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {slots.map((slot) => {
            const ocupados = conteoPorSlot[slot.id] ?? 0;
            const libres = slot.capacidad - ocupados;
            const lleno = libres <= 0;
            const reserva = miReserva(slot.id, fechaSeleccionada);
            const yaReservado = !!reserva;

            return (
              <div
                key={slot.id}
                className={`rounded-2xl border p-4 ${
                  yaReservado
                    ? "bg-accent/10 border-accent/30"
                    : lleno
                    ? "bg-surface border-[rgba(255,255,255,0.08)] opacity-60"
                    : "bg-surface border-[rgba(255,255,255,0.08)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text">
                      {slot.hora_inicio.slice(0, 5)} – {slot.hora_fin.slice(0, 5)}
                    </p>
                    <p className={`text-xs ${lleno ? "text-amber" : "text-muted"}`}>
                      {lleno ? "Cupo lleno" : `${libres} de ${slot.capacidad} cupos disponibles`}
                    </p>
                  </div>

                  {yaReservado ? (
                    <button
                      onClick={() => cancelar(reserva.id)}
                      disabled={loading === reserva.id}
                      className="text-xs font-bold px-4 py-2 rounded-xl border border-accent/40 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
                    >
                      {loading === reserva.id ? "..." : "Cancelar"}
                    </button>
                  ) : lleno ? (
                    <span className="text-xs font-bold px-4 py-2 rounded-xl border border-amber/30 text-amber">
                      Lleno
                    </span>
                  ) : (
                    <button
                      onClick={() => reservar(slot.id)}
                      disabled={loading === slot.id}
                      className="text-xs font-bold px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
                    >
                      {loading === slot.id ? "..." : "Reservar"}
                    </button>
                  )}
                </div>

                {/* Barra de capacidad */}
                <div className="mt-3 bg-bg/40 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      lleno ? "bg-amber" : yaReservado ? "bg-accent" : "bg-accent/60"
                    }`}
                    style={{ width: `${Math.min((ocupados / slot.capacidad) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
