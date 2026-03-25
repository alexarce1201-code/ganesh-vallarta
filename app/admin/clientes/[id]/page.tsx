import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ClienteDetailPage(props: PageProps<"/admin/clientes/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  const { data: progreso } = await supabase
    .from("progreso")
    .select("fecha, peso, nota_coach")
    .eq("cliente_id", id)
    .order("fecha", { ascending: false })
    .limit(5);

  const { data: mensajes } = await supabase
    .from("mensajes")
    .select("titulo, created_at, leido")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  const initials = cliente.nombre
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center font-display font-black text-accent text-xl">
            {initials}
          </div>
          <div>
            <p className="text-xs font-display uppercase tracking-widest text-muted mb-0.5">
              <Link href="/admin/clientes" className="hover:text-text transition-colors">Clientes</Link> /
            </p>
            <h1 className="font-display font-black text-2xl tracking-tight">{cliente.nombre}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-md font-display font-bold ${
                cliente.tipo === "individual" ? "bg-blue/15 text-blue" : "bg-accent/12 text-accent"
              }`}>
                {cliente.tipo}
              </span>
              {!cliente.activo && (
                <span className="text-xs px-2 py-0.5 rounded-md font-display font-bold bg-surface2 text-muted">
                  inactivo
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/admin/clientes/${id}/editar`}
          className="bg-surface border border-[rgba(255,255,255,0.08)] hover:border-accent/40 text-sm font-display font-semibold px-4 py-2 rounded-xl text-muted hover:text-accent transition-all"
        >
          Editar
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Datos personales */}
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
          <p className="text-xs font-display uppercase tracking-widest text-muted mb-4">Datos personales</p>
          <div className="space-y-3">
            {[
              { label: "Edad", value: cliente.edad ? `${cliente.edad} años` : "—" },
              { label: "Altura", value: cliente.altura ? `${cliente.altura} cm` : "—" },
              { label: "Peso inicial", value: cliente.peso_inicial ? `${cliente.peso_inicial} kg` : "—" },
              { label: "Peso actual", value: cliente.peso_actual ? `${cliente.peso_actual} kg` : "—" },
              { label: "Peso meta", value: cliente.peso_meta ? `${cliente.peso_meta} kg` : "—" },
              { label: "Objetivo", value: cliente.objetivo ?? "—" },
              { label: "Inicio", value: cliente.fecha_inicio ? new Date(cliente.fecha_inicio).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : "—" },
              { label: "Contacto", value: cliente.contacto ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                <span className="text-xs text-muted">{row.label}</span>
                <span className="text-sm font-medium text-text">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Condiciones de salud */}
          {cliente.condiciones && (
            <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
              <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Salud</p>
              <p className="text-sm text-text/70 leading-relaxed">{cliente.condiciones}</p>
            </div>
          )}

          {/* Progreso reciente */}
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-display uppercase tracking-widest text-muted">Progreso</p>
              <Link href={`/admin/progreso/${id}`} className="text-xs text-accent font-display font-semibold hover:underline">
                Ver todo →
              </Link>
            </div>
            {!progreso?.length ? (
              <p className="text-sm text-muted">Sin registros aún.</p>
            ) : (
              <div className="space-y-2">
                {progreso.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <span className="text-xs text-muted">{new Date(p.fecha).toLocaleDateString("es-MX")}</span>
                    <span className="font-data font-bold text-sm text-text">{p.peso ? `${p.peso} kg` : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/admin/dietas/${id}`} className="bg-surface border border-[rgba(255,255,255,0.08)] hover:border-accent/30 rounded-xl p-3 text-center text-xs font-display font-semibold text-muted hover:text-accent transition-all">
              Ver dieta
            </Link>
            <Link href={`/admin/mensajes?cliente=${id}`} className="bg-surface border border-[rgba(255,255,255,0.08)] hover:border-accent/30 rounded-xl p-3 text-center text-xs font-display font-semibold text-muted hover:text-accent transition-all">
              Enviar mensaje
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
