"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MAX_CLIENTES, PRECIO_MEMBRESIA } from "@/lib/constants";

type ClienteData = {
  id?: string;
  nombre?: string;
  fecha_inicio?: string;
  contacto?: string;
  meses_plan?: number;
  monto_mensual?: number;
  coaching_extra?: boolean;
  altura?: number | null;
  peso_inicial?: number | null;
  peso_meta?: number | null;
  objetivo?: string | null;
  condiciones?: string | null;
  activo?: boolean;
};

export default function ClienteForm({ cliente }: { cliente?: ClienteData }) {
  const isEdit = !!cliente?.id;
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    nombre:         cliente?.nombre        ?? "",
    fecha_inicio:   cliente?.fecha_inicio  ?? new Date().toISOString().split("T")[0],
    contacto:       cliente?.contacto      ?? "",
    meses_plan:     cliente?.meses_plan    ?? 1,
    monto_mensual:  cliente?.monto_mensual ?? PRECIO_MEMBRESIA,
    coaching_extra: cliente?.coaching_extra ?? false,
    // Campos solo visibles si coaching_extra
    altura:         cliente?.altura        ?? "",
    peso_inicial:   cliente?.peso_inicial  ?? "",
    peso_meta:      cliente?.peso_meta     ?? "",
    objetivo:       cliente?.objetivo      ?? "",
    condiciones:    cliente?.condiciones   ?? "",
  });

  // Auth credentials — only shown on create
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      nombre:         form.nombre.trim(),
      fecha_inicio:   form.fecha_inicio || null,
      contacto:       form.contacto.trim() || null,
      meses_plan:     Math.max(1, Number(form.meses_plan) || 1),
      monto_mensual:  Math.max(0, Number(form.monto_mensual) || 0),
      coaching_extra: form.coaching_extra,
      altura:         form.coaching_extra && form.altura       ? Number(form.altura)       : null,
      peso_inicial:   form.coaching_extra && form.peso_inicial ? Number(form.peso_inicial) : null,
      peso_actual:    form.coaching_extra && form.peso_inicial ? Number(form.peso_inicial) : null,
      peso_meta:      form.coaching_extra && form.peso_meta    ? Number(form.peso_meta)    : null,
      objetivo:       form.coaching_extra ? (form.objetivo    || null) : null,
      condiciones:    form.coaching_extra ? (form.condiciones || null) : null,
      tipo:           "grupal" as const, // legacy
      activo:         true,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("clientes")
        .update(payload)
        .eq("id", cliente!.id!);
      if (error) { setError(error.message); setLoading(false); return; }
      router.push(`/admin/clientes/${cliente!.id}`);
    } else {
      const { count } = await supabase
        .from("clientes")
        .select("id", { count: "exact" })
        .eq("activo", true);
      if ((count ?? 0) >= MAX_CLIENTES) {
        setError(`Capacidad máxima alcanzada (${MAX_CLIENTES} miembros).`);
        setLoading(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from("clientes")
        .insert(payload)
        .select("id")
        .single();
      if (insertError) { setError(insertError.message); setLoading(false); return; }

      if (email.trim() && password.trim()) {
        const res = await fetch("/api/admin/crear-usuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, cliente_id: data.id }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          setError(`Miembro creado, pero error al crear acceso: ${json.error ?? "Error desconocido"}`);
          setLoading(false);
          router.push(`/admin/clientes/${data.id}`);
          return;
        }
      }

      router.push(`/admin/clientes/${data.id}`);
    }

    router.refresh();
  }

  function field<K extends keyof typeof form>(name: K, value: typeof form[K]) {
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

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha de inicio">
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => field("fecha_inicio", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Teléfono / WhatsApp">
          <input
            value={form.contacto}
            onChange={(e) => field("contacto", e.target.value)}
            placeholder="322 104 0208"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Plan + Monto */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Plan (meses) *">
          <input
            type="number"
            min={1}
            value={form.meses_plan}
            onChange={(e) => field("meses_plan", Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Monto mensual (MXN) *">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">$</span>
            <input
              type="number"
              min={0}
              step={50}
              value={form.monto_mensual}
              onChange={(e) => field("monto_mensual", Number(e.target.value))}
              className={`${inputCls} pl-7`}
            />
          </div>
        </Field>
      </div>
      <p className="text-xs text-muted -mt-2">
        Total a cobrar: <span className="text-text font-bold">${(form.meses_plan * form.monto_mensual).toLocaleString("es-MX")} MXN</span> ({form.meses_plan} {form.meses_plan === 1 ? "mes" : "meses"} × ${form.monto_mensual})
      </p>

      {/* Coaching personalizado toggle */}
      <div className="border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <label className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-surface2/50 transition-colors">
          <div className="flex-1">
            <p className="text-sm font-bold text-text">Coaching personalizado</p>
            <p className="text-xs text-muted">Solo si paga por seguimiento individual y dieta</p>
          </div>
          <input
            type="checkbox"
            checked={form.coaching_extra}
            onChange={(e) => field("coaching_extra", e.target.checked)}
            className="w-5 h-5 accent-accent cursor-pointer"
          />
        </label>

        {/* Campos extra de coaching */}
        {form.coaching_extra && (
          <div className="border-t border-[rgba(255,255,255,0.08)] p-4 space-y-4 bg-surface2/30">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Altura (cm)">
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={form.altura}
                  onChange={(e) => field("altura", e.target.value as never)}
                  placeholder="175"
                  className={inputCls}
                />
              </Field>
              <Field label="Peso inicial (kg)">
                <input
                  type="number"
                  step={0.1}
                  value={form.peso_inicial}
                  onChange={(e) => field("peso_inicial", e.target.value as never)}
                  placeholder="80.0"
                  className={inputCls}
                />
              </Field>
              <Field label="Peso meta (kg)">
                <input
                  type="number"
                  step={0.1}
                  value={form.peso_meta}
                  onChange={(e) => field("peso_meta", e.target.value as never)}
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
          </div>
        )}
      </div>

      {/* Auth credentials */}
      {!isEdit && (
        <div className="border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Acceso al portal del miembro <span className="text-green ml-1">(opcional)</span>
          </p>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Correo electrónico">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="miembro@correo.com"
                className={inputCls}
              />
            </Field>
            <Field label="Contraseña temporal">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={inputCls}
              />
            </Field>
          </div>
          <p className="text-xs text-muted">
            Si dejas estos campos en blanco, el miembro no tendrá acceso al portal por ahora.
          </p>
        </div>
      )}

      {error && (
        <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-white font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-60 hover:bg-accent-hover transition-all"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear miembro"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted font-semibold hover:text-text transition-colors"
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
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
