"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Cliente = { id: string; nombre: string };
type Mensaje = {
  id: string;
  titulo: string;
  cuerpo: string;
  leido: boolean;
  created_at: string;
  cliente_id: string;
  cliente: { nombre: string } | null;
};

export default function MensajesView({
  clientes,
  mensajes: initial,
}: {
  clientes: Cliente[];
  mensajes: Mensaje[];
}) {
  const [mensajes, setMensajes] = useState(initial);
  const [clienteId, setClienteId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSend() {
    if (!clienteId || !titulo.trim() || !cuerpo.trim()) return;
    setSending(true);
    const { data, error } = await supabase
      .from("mensajes")
      .insert({ cliente_id: clienteId, titulo: titulo.trim(), cuerpo: cuerpo.trim() })
      .select("id, titulo, cuerpo, leido, created_at, cliente_id, cliente:clientes(nombre)")
      .single();

    if (!error && data) {
      const msg = { ...data, cliente: Array.isArray(data.cliente) ? data.cliente[0] : data.cliente };
      setMensajes((prev) => [msg, ...prev]);
      setTitulo("");
      setCuerpo("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }
    setSending(false);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Composer */}
      <div>
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Nuevo mensaje</p>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-display font-semibold uppercase tracking-widest text-muted mb-2">
              Cliente
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className={selectCls}
            >
              <option value="">Selecciona un cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-display font-semibold uppercase tracking-widest text-muted mb-2">
              Título
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Avance semana 4"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-display font-semibold uppercase tracking-widest text-muted mb-2">
              Mensaje
            </label>
            <textarea
              rows={5}
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              placeholder="Escribe aquí tu mensaje personalizado para el cliente..."
              className={`${inputCls} resize-none w-full`}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !clienteId || !titulo.trim() || !cuerpo.trim()}
            className={`w-full py-3 rounded-xl font-display font-bold text-sm transition-all ${
              sent
                ? "bg-green/20 text-green border border-green/30"
                : "bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
            }`}
          >
            {sent ? "✓ Enviado" : sending ? "Enviando..." : "Enviar mensaje"}
          </button>
        </div>
      </div>

      {/* History */}
      <div>
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Enviados recientes</p>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          {mensajes.length === 0 ? (
            <p className="px-5 py-8 text-center text-muted text-sm">Sin mensajes enviados.</p>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.05)] max-h-[500px] overflow-y-auto">
              {mensajes.map((m) => (
                <div key={m.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-display font-bold text-accent">
                      {m.cliente?.nombre ?? "—"}
                    </span>
                    <span className="text-[10px] text-muted">
                      {new Date(m.created_at).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text mb-0.5">{m.titulo}</p>
                  <p className="text-xs text-muted line-clamp-2">{m.cuerpo}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-accent transition-colors";
const selectCls =
  "w-full bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-accent transition-colors";
