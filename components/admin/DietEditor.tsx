"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TIPOS_COMIDA, TIPOS_COMIDA_LABELS, type TipoComida } from "@/lib/constants";

type Comida = {
  id?: string;
  dieta_id?: string;
  tipo: TipoComida;
  orden?: number;
  nombre: string;
  descripcion?: string;
  cantidad_g?: number | null;
  calorias?: number | null;
  proteina_g?: number | null;
  carbos_g?: number | null;
  grasa_g?: number | null;
};

type Props = {
  dietaId: string;
  comidas: Comida[];
  notas: string;
};

const EMPTY_COMIDA = (tipo: TipoComida): Comida => ({
  tipo,
  nombre: "",
  descripcion: "",
  cantidad_g: null,
  calorias: null,
  proteina_g: null,
  carbos_g: null,
  grasa_g: null,
});

export default function DietEditor({ dietaId, comidas: initialComidas, notas: initialNotas }: Props) {
  const [activeTab, setActiveTab] = useState<TipoComida>("desayuno");
  const [comidas, setComidas] = useState<Comida[]>(initialComidas);
  const [notas, setNotas] = useState(initialNotas);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newItem, setNewItem] = useState<Comida>(EMPTY_COMIDA(activeTab));
  const supabase = createClient();

  function tabComidas(tipo: TipoComida) {
    return comidas.filter((c) => c.tipo === tipo);
  }

  function totalKcal(tipo: TipoComida) {
    return tabComidas(tipo).reduce((s, c) => s + (c.calorias ?? 0), 0);
  }

  function totalMacro(tipo: TipoComida, macro: "proteina_g" | "carbos_g" | "grasa_g") {
    return tabComidas(tipo).reduce((s, c) => s + (c[macro] ?? 0), 0);
  }

  async function addComida() {
    if (!newItem.nombre.trim()) return;
    setSaving(true);
    const payload = {
      ...newItem,
      dieta_id: dietaId,
      tipo: activeTab,
      orden: tabComidas(activeTab).length,
    };
    const { data, error } = await supabase.from("comidas").insert(payload).select("*").single();
    if (!error && data) {
      setComidas((prev) => [...prev, data]);
      setNewItem(EMPTY_COMIDA(activeTab));
      flashSaved();
    }
    setSaving(false);
  }

  async function deleteComida(id: string) {
    await supabase.from("comidas").delete().eq("id", id);
    setComidas((prev) => prev.filter((c) => c.id !== id));
  }

  async function saveNotas() {
    setSaving(true);
    await supabase.from("dietas").update({ notas }).eq("id", dietaId);
    flashSaved();
    setSaving(false);
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {TIPOS_COMIDA.map((t) => {
          const count = tabComidas(t).length;
          const kcal = totalKcal(t);
          return (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setNewItem(EMPTY_COMIDA(t)); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-display font-bold border transition-all ${
                activeTab === t
                  ? "bg-accent text-white border-accent"
                  : "bg-surface text-muted border-[rgba(255,255,255,0.08)] hover:border-accent/40"
              }`}
            >
              {TIPOS_COMIDA_LABELS[t]}
              {count > 0 && (
                <span className={`ml-2 text-xs ${activeTab === t ? "text-white/70" : "text-muted"}`}>
                  {kcal} kcal
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Macros summary */}
      {tabComidas(activeTab).length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Kcal", value: totalKcal(activeTab), color: "text-accent" },
            { label: "Prot", value: `${totalMacro(activeTab, "proteina_g").toFixed(0)}g`, color: "text-[#ff7a84]" },
            { label: "Carbs", value: `${totalMacro(activeTab, "carbos_g").toFixed(0)}g`, color: "text-blue" },
            { label: "Grasa", value: `${totalMacro(activeTab, "grasa_g").toFixed(0)}g`, color: "text-amber" },
          ].map((m) => (
            <div key={m.label} className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-2.5 text-center">
              <p className={`font-data font-bold text-base ${m.color}`}>{m.value}</p>
              <p className="text-[10px] font-display uppercase tracking-widest text-muted">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Food list */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden mb-4">
        {tabComidas(activeTab).length === 0 ? (
          <p className="px-5 py-8 text-center text-muted text-sm">Sin alimentos en {TIPOS_COMIDA_LABELS[activeTab]}.</p>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {tabComidas(activeTab).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{c.nombre}</p>
                  {c.descripcion && <p className="text-xs text-muted truncate">{c.descripcion}</p>}
                  <div className="flex gap-2 mt-1">
                    {c.proteina_g ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(230,57,70,0.15)] text-[#ff7a84] font-bold">{c.proteina_g}g P</span> : null}
                    {c.carbos_g ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue/15 text-blue font-bold">{c.carbos_g}g C</span> : null}
                    {c.grasa_g ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber/15 text-amber font-bold">{c.grasa_g}g G</span> : null}
                    {c.calorias ? <span className="text-[10px] text-muted">{c.calorias} kcal</span> : null}
                  </div>
                </div>
                {c.cantidad_g && <span className="text-xs text-muted flex-shrink-0">{c.cantidad_g}g</span>}
                <button
                  onClick={() => c.id && deleteComida(c.id)}
                  className="text-xs text-muted hover:text-accent transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new item */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 mb-6">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">
          + Agregar a {TIPOS_COMIDA_LABELS[activeTab]}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            placeholder="Nombre *"
            value={newItem.nombre}
            onChange={(e) => setNewItem((p) => ({ ...p, nombre: e.target.value }))}
            className={inputCls + " col-span-2"}
          />
          <input
            placeholder="Descripción"
            value={newItem.descripcion ?? ""}
            onChange={(e) => setNewItem((p) => ({ ...p, descripcion: e.target.value }))}
            className={inputCls + " col-span-2"}
          />
          <input
            type="number" placeholder="Gramos"
            value={newItem.cantidad_g ?? ""}
            onChange={(e) => setNewItem((p) => ({ ...p, cantidad_g: e.target.value ? Number(e.target.value) : null }))}
            className={inputCls}
          />
          <input
            type="number" placeholder="Kcal"
            value={newItem.calorias ?? ""}
            onChange={(e) => setNewItem((p) => ({ ...p, calorias: e.target.value ? Number(e.target.value) : null }))}
            className={inputCls}
          />
          <input
            type="number" step="0.1" placeholder="Proteína (g)"
            value={newItem.proteina_g ?? ""}
            onChange={(e) => setNewItem((p) => ({ ...p, proteina_g: e.target.value ? Number(e.target.value) : null }))}
            className={inputCls}
          />
          <input
            type="number" step="0.1" placeholder="Carbos (g)"
            value={newItem.carbos_g ?? ""}
            onChange={(e) => setNewItem((p) => ({ ...p, carbos_g: e.target.value ? Number(e.target.value) : null }))}
            className={inputCls}
          />
          <input
            type="number" step="0.1" placeholder="Grasa (g)"
            value={newItem.grasa_g ?? ""}
            onChange={(e) => setNewItem((p) => ({ ...p, grasa_g: e.target.value ? Number(e.target.value) : null }))}
            className={inputCls}
          />
        </div>
        <button
          onClick={addComida}
          disabled={saving || !newItem.nombre.trim()}
          className="bg-accent text-white font-display font-bold text-sm px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-accent/90 transition-all"
        >
          Agregar alimento
        </button>
      </div>

      {/* Notas */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Notas del plan</p>
        <textarea
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Restricciones, indicaciones especiales..."
          className={inputCls + " resize-none w-full mb-3"}
        />
        <button
          onClick={saveNotas}
          disabled={saving}
          className="bg-surface2 border border-[rgba(255,255,255,0.08)] text-sm font-display font-semibold px-4 py-2 rounded-xl text-muted hover:text-accent hover:border-accent/40 transition-all disabled:opacity-50"
        >
          {saved ? "✓ Guardado" : "Guardar notas"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-text text-sm outline-none focus:border-accent transition-colors";
