import { createClient } from "@/lib/supabase/server";
import MensajesView from "@/components/admin/MensajesView";

export default async function MensajesPage() {
  const supabase = await createClient();

  const [clientesRes, mensajesRes] = await Promise.all([
    supabase.from("clientes").select("id, nombre").eq("activo", true).order("nombre"),
    supabase
      .from("mensajes")
      .select("id, titulo, cuerpo, leido, created_at, cliente_id, cliente:clientes(nombre)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const mensajes = (mensajesRes.data ?? []).map((m) => ({
    ...m,
    cliente: Array.isArray(m.cliente) ? (m.cliente[0] ?? null) : m.cliente,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">Administración</p>
        <h1 className="font-display font-black text-3xl tracking-tight">Mensajes</h1>
      </div>
      <MensajesView
        clientes={clientesRes.data ?? []}
        mensajes={mensajes}
      />
    </div>
  );
}
