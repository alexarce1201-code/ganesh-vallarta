"use client";

import { useState } from "react";

type Comida = {
  id: string;
  dieta_id: string;
  tipo: string;
  orden: number;
  nombre: string;
  descripcion: string | null;
  cantidad_g: number | null;
  calorias: number | null;
  proteina_g: number | null;
  carbos_g: number | null;
  grasa_g: number | null;
};

type Dieta = {
  id: string;
  notas: string | null;
  updated_at: string;
  created_at: string;
};

interface Props {
  dieta: Dieta | null;
  comidas: unknown[];
}

const MEAL_TYPES = [
  { key: "desayuno",  label: "Desayuno" },
  { key: "colacion_m", label: "Colación" },
  { key: "comida",    label: "Comida" },
  { key: "merienda",  label: "Merienda" },
  { key: "cena",      label: "Cena" },
] as const;

export default function DietaClient({ dieta, comidas: rawComidas }: Props) {
  const comidas = rawComidas as Comida[];
  const [activeMeal, setActiveMeal] = useState<string>("desayuno");

  if (!dieta) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-surface2 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-muted">
              <path d="M18 8h1a4 4 0 010 8h-1" />
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
            </svg>
          </div>
          <p className="text-muted text-sm">Tu plan nutricional no está disponible aún.</p>
          <p className="text-muted/60 text-xs mt-1">Tu coach lo asignará pronto.</p>
        </div>
      </div>
    );
  }

  // Aggregate totals
  const totalCalorias = comidas.reduce((s, c) => s + (c.calorias ?? 0), 0);
  const totalProteina = comidas.reduce((s, c) => s + (c.proteina_g ?? 0), 0);
  const totalCarbos   = comidas.reduce((s, c) => s + (c.carbos_g ?? 0), 0);
  const totalGrasa    = comidas.reduce((s, c) => s + (c.grasa_g ?? 0), 0);

  const totalMacros   = totalProteina + totalCarbos + totalGrasa || 1;
  const pctP = (totalProteina / totalMacros) * 100;
  const pctC = (totalCarbos   / totalMacros) * 100;
  const pctG = (totalGrasa    / totalMacros) * 100;

  const selectedComidas = comidas.filter((c) => c.tipo === activeMeal);

  const updatedDate = new Date(dieta.updated_at ?? dieta.created_at).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-6">
      <Header />

      {/* ── Daily Summary ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Resumen diario
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber/10 border border-amber/20 rounded-2xl p-4">
            <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-muted mb-1">
              Calorías
            </p>
            <p className="font-data font-bold text-2xl text-amber">
              {totalCalorias}
              <span className="text-sm font-normal text-muted ml-1">kcal</span>
            </p>
          </div>
          <div className="bg-blue/10 border border-blue/20 rounded-2xl p-4">
            <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-muted mb-1">
              Proteína
            </p>
            <p className="font-data font-bold text-2xl text-blue">
              {totalProteina.toFixed(0)}
              <span className="text-sm font-normal text-muted ml-1">g</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Macro Bars ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Distribución de macros
        </h2>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 space-y-3">
          <MacroBar label="Proteína" grams={totalProteina} pct={pctP} color="bg-blue" />
          <MacroBar label="Carbos"   grams={totalCarbos}   pct={pctC} color="bg-amber" />
          <MacroBar label="Grasa"    grams={totalGrasa}    pct={pctG} color="bg-accent" />
        </div>
      </section>

      {/* ── Meal Tabs ── */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-4">
          {MEAL_TYPES.map((m) => {
            const count = comidas.filter((c) => c.tipo === m.key).length;
            const isActive = activeMeal === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActiveMeal(m.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-display font-bold shrink-0 transition-all ${
                  isActive
                    ? "bg-accent border-accent text-white"
                    : "bg-surface2 border-[rgba(255,255,255,0.08)] text-muted hover:border-accent/30"
                }`}
              >
                {m.label}
                {count > 0 && (
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-data font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-surface border border-[rgba(255,255,255,0.08)] text-muted"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Food items */}
        <div className="space-y-3">
          {selectedComidas.length > 0 ? (
            selectedComidas.map((c) => (
              <FoodCard key={c.id} comida={c} />
            ))
          ) : (
            <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-center">
              <p className="text-muted text-sm">
                No hay alimentos en esta comida.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Coach Notes ── */}
      {dieta.notas && (
        <section>
          <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
            Notas del plan
          </h2>
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green rounded-l-2xl" />
            <p className="pl-3 text-text text-sm leading-relaxed">{dieta.notas}</p>
          </div>
        </section>
      )}

      {/* ── Last updated ── */}
      <p className="text-muted/60 text-xs text-center font-data">
        Actualizado el {updatedDate}
      </p>
    </div>
  );
}

/* ── Sub-components ── */

function Header() {
  return (
    <div>
      <p className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-1">
        Nutrición
      </p>
      <h1 className="font-display font-black text-2xl text-text tracking-tight">
        Plan Dietético
      </h1>
    </div>
  );
}

function MacroBar({
  label, grams, pct, color,
}: { label: string; grams: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-display font-semibold text-muted">{label}</span>
        <span className="text-xs font-data font-semibold text-text">
          {grams.toFixed(0)}g <span className="text-muted">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function FoodCard({ comida }: { comida: Comida }) {
  return (
    <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-text text-sm">{comida.nombre}</p>
          {comida.descripcion && (
            <p className="text-muted text-xs mt-0.5 leading-relaxed">
              {comida.descripcion}
            </p>
          )}
        </div>
        {comida.cantidad_g && (
          <span className="text-xs font-data font-semibold text-muted shrink-0">
            {comida.cantidad_g}g
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {comida.calorias && (
          <Pill label={`${comida.calorias} kcal`} color="amber" />
        )}
        {comida.proteina_g && (
          <Pill label={`P: ${comida.proteina_g}g`} color="blue" />
        )}
        {comida.carbos_g && (
          <Pill label={`C: ${comida.carbos_g}g`} color="green" />
        )}
        {comida.grasa_g && (
          <Pill label={`G: ${comida.grasa_g}g`} color="muted" />
        )}
      </div>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  const colorMap: Record<string, string> = {
    amber:  "text-amber  bg-amber/10  border-amber/20",
    blue:   "text-blue   bg-blue/10   border-blue/20",
    green:  "text-green  bg-green/10  border-green/20",
    accent: "text-accent bg-accent/10 border-accent/20",
    muted:  "text-muted  bg-surface2  border-[rgba(255,255,255,0.08)]",
  };
  return (
    <span className={`text-[10px] font-data font-semibold px-2 py-0.5 rounded-full border ${colorMap[color] ?? colorMap.muted}`}>
      {label}
    </span>
  );
}
