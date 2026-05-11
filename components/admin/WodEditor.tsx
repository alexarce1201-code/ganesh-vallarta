"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Wod = {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  notas: string | null;
};

export default function WodEditor({
  wodHoy,
  fecha,
}: {
  wodHoy: Wod | null;
  fecha: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    titulo:      wodHoy?.titulo      ?? "",
    descripcion: wodHoy?.descripcion ?? "",
    notas:       wodHoy?.notas       ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const isEdit = !!wodHoy;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const payload = {
      fecha,
      titulo:      form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      notas:       form.notas.trim() || null,
    };

    const query = isEdit
      ? supabase.from("wods").update(payload).eq("id", wodHoy!.id)
      : supabase.from("wods").insert(payload);

    const { error: dbError } = await query;
    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  const fechaFmt = new Date(fecha + "T00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <form onSubmit={handleSave} className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">WOD para</p>
          <p className="font-bold text-lg capitalize">{fechaFmt}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${
          isEdit
            ? "bg-green/15 text-green border border-green/30"
            : "bg-amber/15 text-amber border border-amber/30"
        }`}>
          {isEdit ? "Publicado" : "Sin publicar"}
        </span>
      </div>

      {/* Título */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
          Título *
        </label>
        <input
          required
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          placeholder='Ej. "Cindy" o "Hero WOD: Murph"'
          className={inputCls}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
          Workout *
        </label>
        <textarea
          required
          rows={10}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder={`AMRAP 20 min:\n5 Pull-ups\n10 Push-ups\n15 Air squats`}
          className={`${inputCls} font-mono text-sm leading-relaxed resize-y`}
        />
        <p className="text-xs text-muted mt-1.5">Los saltos de línea se respetan al mostrar.</p>
      </div>

      {/* Notas opcionales */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
          Notas para los miembros (opcional)
        </label>
        <textarea
          rows={3}
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          placeholder="Ej. Trae rodilleras para los squats."
          className={`${inputCls} resize-y`}
        />
      </div>

      {error && (
        <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-green text-sm bg-green/10 border border-green/20 rounded-xl px-4 py-2">
          ✓ WOD guardado. Los miembros ya lo pueden ver.
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-white font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-60 hover:bg-accent-hover transition-all"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Publicar WOD"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-accent transition-colors";
