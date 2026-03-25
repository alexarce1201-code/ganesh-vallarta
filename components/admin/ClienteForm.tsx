"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MAX_CLIENTES, PRECIO_GRUPAL, PRECIO_INDIVIDUAL } from "@/lib/constants";

type ClienteData = {
  id?: string;
  nombre?: string;
  edad?: number;
  altura?: number;
  peso_inicial?: number;
  peso_meta?: number;
  peso_actual?: number;
  objetivo?: string;
  condiciones?: string;
  fecha_inicio?: string;
  contacto?: string;
  tipo?: "grupal" | "individual";
  activo?: boolean;
};

export default function ClienteForm({ cliente }: { cliente?: ClienteData }) {
  const isEdit = !!cliente?.id;
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    nombre: cliente?.nombre ?? "",
    edad: cliente?.edad ?? "",
    altura: cliente?.altura ?? "",
    peso_inicial: cliente?.peso_inicial ?? "",
    peso_meta: cliente?.peso_meta ?? "",
    objetivo: cliente?.objetivo ?? "",
    condiciones: cliente?.condiciones ?? "",
    fecha_inicio: cliente?.fecha_inicio ?? new Date().toISOString().split("T")[0],
    contacto: cliente?.contacto ?? "",
    tipo: cliente?.tipo ?? "grupal",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const precio = form.tipo === "individual" ? PRECIO_INDIVIDUAL : PRECIO_GRUPAL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      nombre: form.nombre.trim(),
      edad: form.edad ? Number(form.edad) : null,
      altura: form.altura ? Number(form.altura) : null,
      peso_inicial: form.peso_inicial ? Number(form.peso_inicial) : null,
      peso_actual: form.peso_inicial ? Number(form.peso_inicial) : null,
      peso_meta: form.peso_meta ? Number(form.peso_meta) : null,
      objetivo: form.objetivo || null,
      condiciones: form.condiciones || null,
      fecha_inicio: form.fecha_inicio || null,
      contacto: form.contacto || null,
      tipo: form.tipo,
      activo: true,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("clientes")
        .update(payload)
        .eq("id", cliente!.id!);
      if (error) { setError(error.message); setLoading(false); return; }
      router.push(`/admin/clientes/${cliente!.id}`);
    } else {
      // Check capacity
      const { count } = await supabase
        .from("clientes")
        .select("id", { count: "exact" })
        .eq("activo", true);
      if ((count ?? 0) >= MAX_CLIENTES) {
        setError(`Capacidad máxima alcanzada (${MAX_CLIENTES} clientes).`);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("clientes")
        .insert(payload)
        .select("id")
        .single();
      if (error) { setError(error.message); setLoading(false); return; }
      router.push(`/admin/clientes/${data.id}`);
    }

    router.refresh();
  }

  function field(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {/* Nombre */}
      <Field label="Nombre completo *">
        <input
          required
          value={form.nombre}
          onChange={(e) => field("nombre", e.target.value)}
          placeholder="Ej. Carlos Ramírez"
          className={inputCls}
        />
      </Field>

      {/* Tipo */}
      <Field label="Tipo de plan">
        <div className="flex gap-2">
          {(["grupal", "individual"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => field("tipo", t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-display font-bold border transition-all ${
                form.tipo === t
                  ? "bg-accent text-white border-accent"
                  : "bg-surface2 text-muted border-[rgba(255,255,255,0.08)] hover:border-accent/40"
              }`}
            >
              {t === "grupal" ? `Grupal — $${PRECIO_GRUPAL}/mes` : `Individual — $${PRECIO_INDIVIDUAL}/mes`}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Edad">
          <input
            type="number" min={10} max={80}
            value={form.edad}
            onChange={(e) => field("edad", e.target.value)}
            placeholder="32"
            className={inputCls}
          />
        </Field>
        <Field label="Altura (cm)">
          <input
            type="number" min={100} max={250}
            value={form.altura}
            onChange={(e) => field("altura", e.target.value)}
            placeholder="175"
            className={inputCls}
          />
        </Field>
        <Field label="Peso inicial (kg)">
          <input
            type="number" step="0.1"
            value={form.peso_inicial}
            onChange={(e) => field("peso_inicial", e.target.value)}
            placeholder="80.0"
            className={inputCls}
          />
        </Field>
        <Field label="Peso meta (kg)">
          <input
            type="number" step="0.1"
            value={form.peso_meta}
            onChange={(e) => field("peso_meta", e.target.value)}
            placeholder="70.0"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Objetivo">
        <input
          value={form.objetivo}
          onChange={(e) => field("objetivo", e.target.value)}
          placeholder="Ej. Pérdida de peso y definición muscular"
          className={inputCls}
        />
      </Field>

      <Field label="Condiciones de salud">
        <textarea
          rows={2}
          value={form.condiciones}
          onChange={(e) => field("condiciones", e.target.value)}
          placeholder="Lesiones, alergias, restricciones..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha de inicio">
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => field("fecha_inicio", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Contacto / WhatsApp">
          <input
            value={form.contacto}
            onChange={(e) => field("contacto", e.target.value)}
            placeholder="55 1234 5678"
            className={inputCls}
          />
        </Field>
      </div>

      {error && (
        <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-white font-display font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-60 hover:bg-accent/90 transition-all"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted font-display font-semibold hover:text-text transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-accent transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-display font-semibold uppercase tracking-widest text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
