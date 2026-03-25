"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIAS_LABELS, MAX_POR_SLOT, MAX_CLASES_SEMANA } from "@/lib/constants";

type Slot = {
  id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
};

type Asignacion = {
  id: string;
  slot_id: string;
  cliente_id: string;
  cliente: { nombre: string } | null;
};

type Cliente = { id: string; nombre: string };

type Props = {
  slots: Slot[];
  asignaciones: Asignacion[];
  clientes: Cliente[];
  semanaInicio: string;
};

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

export default function WeeklyCalendar({ slots, asignaciones, clientes, semanaInicio }: Props) {
  const [asigs, setAsigs] = useState<Asignacion[]>(asignaciones);
  const [modal, setModal] = useState<{ slot: Slot; asigs: Asignacion[] } | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const supabase = createClient();

  // Group slots by day
  const slotsByDay: Record<string, Slot[]> = {};
  for (const s of slots) {
    if (!slotsByDay[s.dia]) slotsByDay[s.dia] = [];
    slotsByDay[s.dia].push(s);
  }

  function getSlotAsigs(slotId: string) {
    return asigs.filter((a) => a.slot_id === slotId);
  }

  function clienteClasesEnSemana(clienteId: string) {
    return asigs.filter((a) => a.cliente_id === clienteId).length;
  }

  async function addCliente(slot: Slot, clienteId: string) {
    setError("");
    const slotAsigs = getSlotAsigs(slot.id);

    if (slotAsigs.length >= MAX_POR_SLOT) {
      setError("Este slot ya está lleno (máx 4 personas).");
      return;
    }
    if (clienteClasesEnSemana(clienteId) >= MAX_CLASES_SEMANA) {
      setError(`Este cliente ya tiene ${MAX_CLASES_SEMANA} clases esta semana.`);
      return;
    }
    if (slotAsigs.some((a) => a.cliente_id === clienteId)) {
      setError("Este cliente ya está en este slot.");
      return;
    }

    setAddingId(clienteId);
    const { data, error: err } = await supabase
      .from("asignaciones")
      .insert({ cliente_id: clienteId, slot_id: slot.id, semana_inicio: semanaInicio })
      .select("id, slot_id, cliente_id, cliente:clientes(nombre)")
      .single();

    if (err) {
      setError(err.message);
    } else if (data) {
      const newAsig = { ...data, cliente: Array.isArray(data.cliente) ? data.cliente[0] : data.cliente };
      setAsigs((prev) => [...prev, newAsig]);
      setModal((prev) =>
        prev ? { ...prev, asigs: [...prev.asigs, newAsig] } : null
      );
    }
    setAddingId(null);
  }

  async function removeCliente(asigId: string) {
    await supabase.from("asignaciones").delete().eq("id", asigId);
    setAsigs((prev) => prev.filter((a) => a.id !== asigId));
    setModal((prev) =>
      prev ? { ...prev, asigs: prev.asigs.filter((a) => a.id !== asigId) } : null
    );
  }

  function openModal(slot: Slot) {
    setError("");
    setModal({ slot, asigs: getSlotAsigs(slot.id) });
  }

  const daysWithSlots = DIAS.filter((d) => slotsByDay[d]?.length > 0);

  return (
    <div>
      {slots.length === 0 ? (
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 text-center">
          <p className="text-muted text-sm mb-2">Sin slots configurados.</p>
          <p className="text-xs text-muted">Ejecuta la migración de slots en Supabase para poblar el calendario.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {daysWithSlots.map((dia) => (
            <div key={dia} className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                <p className="font-display font-bold text-sm text-text capitalize">
                  {dia.charAt(0).toUpperCase() + dia.slice(1)}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-3">
                {slotsByDay[dia].map((slot) => {
                  const sa = getSlotAsigs(slot.id);
                  const full = sa.length >= MAX_POR_SLOT;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => openModal(slot)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        full
                          ? "bg-surface2 border-[rgba(255,255,255,0.06)] opacity-70"
                          : "bg-accent/8 border-accent/20 hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-data font-bold text-sm text-accent">
                          {slot.hora_inicio.slice(0, 5)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-display font-bold ${
                          full ? "bg-surface text-muted" : "bg-accent/15 text-accent"
                        }`}>
                          {sa.length}/{MAX_POR_SLOT}
                        </span>
                      </div>
                      {sa.length === 0 ? (
                        <p className="text-xs text-muted">Vacío — tap para asignar</p>
                      ) : (
                        <div className="space-y-0.5">
                          {sa.map((a) => (
                            <p key={a.id} className="text-xs text-text/80 truncate">
                              · {a.cliente?.nombre ?? "—"}
                            </p>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-surface border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
              <div>
                <p className="font-display font-bold text-text capitalize">{modal.slot.dia}</p>
                <p className="text-xs text-muted">{modal.slot.hora_inicio.slice(0,5)} – {modal.slot.hora_fin.slice(0,5)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md font-display font-bold ${
                modal.asigs.length >= MAX_POR_SLOT ? "bg-surface2 text-muted" : "bg-accent/15 text-accent"
              }`}>
                {modal.asigs.length}/{MAX_POR_SLOT}
              </span>
            </div>

            {/* Current assignees */}
            {modal.asigs.length > 0 && (
              <div className="px-4 py-3 space-y-1 border-b border-[rgba(255,255,255,0.06)]">
                {modal.asigs.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-1">
                    <span className="text-sm text-text">{a.cliente?.nombre}</span>
                    <button
                      onClick={() => removeCliente(a.id)}
                      className="text-xs text-muted hover:text-accent transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add client */}
            {modal.asigs.length < MAX_POR_SLOT && (
              <div className="px-4 py-3">
                <p className="text-xs font-display uppercase tracking-widest text-muted mb-2">Agregar cliente</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {clientes
                    .filter((c) => !modal.asigs.some((a) => a.cliente_id === c.id))
                    .map((c) => {
                      const clases = clienteClasesEnSemana(c.id);
                      const maxed = clases >= MAX_CLASES_SEMANA;
                      return (
                        <button
                          key={c.id}
                          onClick={() => !maxed && addCliente(modal.slot, c.id)}
                          disabled={maxed || addingId === c.id}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                            maxed
                              ? "opacity-40 cursor-not-allowed text-muted"
                              : "hover:bg-accent/10 hover:text-accent text-text"
                          }`}
                        >
                          <span>{c.nombre}</span>
                          <span className="text-xs text-muted">{clases}/{MAX_CLASES_SEMANA}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {error && (
              <p className="mx-4 mb-3 text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
              <button
                onClick={() => setModal(null)}
                className="w-full text-sm font-display font-semibold text-muted hover:text-text transition-colors py-1"
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
