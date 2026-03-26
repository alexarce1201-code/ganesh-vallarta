"use client";

import { useState } from "react";
import { getDiaNombre, DIAS_SEMANA, getDiaOrder } from "@/lib/semana";

type Slot = {
  id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
};

type Asignacion = {
  id: string;
  cliente_id: string;
  slot_id: string;
  semana_inicio: string;
  slot: Slot;
};

interface Props {
  asignaciones: Asignacion[];
  semanaActual: string;
}

export default function ClasesClient({ asignaciones, semanaActual }: Props) {
  const today     = new Date().getDay(); // 0=Sun
  const todayIdx  = today === 0 ? 6 : today - 1; // 0=Mon..5=Sat
  const [selectedDia, setSelectedDia] = useState<string>(
    DIAS_SEMANA[Math.min(todayIdx, 5)]
  );

  // Separate current week vs upcoming
  const thisWeek = asignaciones.filter((a) => a.semana_inicio === semanaActual);
  const upcoming = asignaciones.filter((a) => a.semana_inicio !== semanaActual);

  // Which days have classes this week
  const clasesHoy = thisWeek.filter((a) => a.slot?.dia === selectedDia);

  // Group upcoming by semana_inicio
  const upcomingGrouped: Record<string, Asignacion[]> = {};
  upcoming.forEach((a) => {
    if (!upcomingGrouped[a.semana_inicio]) upcomingGrouped[a.semana_inicio] = [];
    upcomingGrouped[a.semana_inicio].push(a);
  });

  function formatSemana(date: string) {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <p className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-1">
          Mis clases
        </p>
        <h1 className="font-display font-black text-2xl text-text tracking-tight">
          Horario
        </h1>
      </div>

      {/* ── Day selector ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Esta semana
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DIAS_SEMANA.map((dia, i) => {
            const isActive  = selectedDia === dia;
            const hasClass  = thisWeek.some((a) => a.slot?.dia === dia);
            const isToday   = i === Math.min(todayIdx, 5);
            return (
              <button
                key={dia}
                onClick={() => setSelectedDia(dia)}
                className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border shrink-0 transition-all ${
                  isActive
                    ? "bg-accent border-accent text-white"
                    : "bg-surface2 border-[rgba(255,255,255,0.08)] text-muted hover:border-accent/30"
                }`}
              >
                <span className="text-xs font-display font-bold">
                  {getDiaNombre(dia)}
                </span>
                {/* Dot if has class */}
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasClass
                      ? isActive
                        ? "bg-white"
                        : "bg-accent"
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Classes for selected day */}
        <div className="mt-4 space-y-3">
          {clasesHoy.length > 0 ? (
            clasesHoy.map((a) => (
              <ClaseCard key={a.id} slot={a.slot} />
            ))
          ) : (
            <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-center">
              <p className="text-muted text-sm">
                No tienes clase el {getDiaNombre(selectedDia).toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Upcoming weeks ── */}
      {Object.keys(upcomingGrouped).length > 0 && (
        <section>
          <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
            Próximas semanas
          </h2>
          <div className="space-y-4">
            {Object.entries(upcomingGrouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([semana, items]) => (
                <div key={semana}>
                  <p className="text-xs font-data font-semibold text-muted mb-2">
                    Semana del {formatSemana(semana)}
                  </p>
                  <div className="space-y-2">
                    {[...items]
                      .sort((a, b) => {
                        const da = getDiaOrder(a.slot?.dia);
                        const db = getDiaOrder(b.slot?.dia);
                        if (da !== db) return da - db;
                        return (a.slot?.hora_inicio ?? "").localeCompare(b.slot?.hora_inicio ?? "");
                      })
                      .map((a) => (
                        <ClaseCard key={a.id} slot={a.slot} compact />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {asignaciones.length === 0 && (
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-muted">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </div>
          <p className="text-muted text-sm">No tienes clases asignadas por ahora.</p>
          <p className="text-muted/60 text-xs mt-1">Tu coach las asignará pronto.</p>
        </div>
      )}
    </div>
  );
}

function ClaseCard({ slot, compact = false }: { slot: Slot; compact?: boolean }) {
  return (
    <div
      className={`bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl flex items-center gap-4 ${
        compact ? "px-4 py-3" : "px-4 py-4"
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-accent">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted capitalize">
          {getDiaNombre(slot?.dia ?? "")}
        </p>
        <p className="font-data font-bold text-text text-base">
          {slot?.hora_inicio?.slice(0, 5) ?? ""} – {slot?.hora_fin?.slice(0, 5) ?? ""}
        </p>
      </div>
      <div className="shrink-0">
        <span className="text-xs font-display font-semibold text-green bg-green/10 border border-green/20 rounded-full px-2 py-0.5">
          Confirmada
        </span>
      </div>
    </div>
  );
}
