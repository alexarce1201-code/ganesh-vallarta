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

  const { data: pagos } = await supabase
    .from("pagos")
    .select("mes, monto, estado")
    .eq("cliente_id", id)
    .order("mes", { ascending: false })
    .limit(6);

  const initials = cliente.nombre
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const planLabel = `${cliente.meses_plan ?? 1} ${cliente.meses_plan === 1 ? "mes" : "meses"}`;
  const totalPlan = (cliente.meses_plan ?? 1) * (cliente.monto_mensual ?? 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center font-black text-accent text-xl">
            {initials}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-0.5">
              <Link href="/admin/clientes" className="hover:text-text transition-colors">Miembros</Link> /
            </p>
            <h1 className="font-black text-2xl tracking-tight">{cliente.nombre}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-accent/12 text-accent">
                Plan {planLabel}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-surface2 text-text">
                ${(cliente.monto_mensual ?? 0).toLocaleString("es-MX")}/mes
              </span>
              {cliente.coaching_extra && (
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-blue/15 text-blue">
                  ★ Coaching extra
                </span>
              )}
              {!cliente.activo && (
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-surface2 text-muted">
                  inactivo
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/admin/clientes/${id}/editar`}
          className="bg-surface border border-[rgba(255,255,255,0.08)] hover:border-accent/40 text-sm font-semibold px-4 py-2 rounded-xl text-muted hover:text-accent transition-all"
        >
          Editar
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Datos del miembro */}
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted mb-4">Datos del miembro</p>
          <div className="space-y-3">
            {[
              { label: "Fecha de inicio", value: cliente.fecha_inicio ? new Date(cliente.fecha_inicio).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : "—" },
              { label: "Teléfono / WhatsApp", value: cliente.contacto ?? "—" },
              { label: "Plan contratado", value: planLabel },
              { label: "Monto mensual", value: `$${(cliente.monto_mensual ?? 0).toLocaleString("es-MX")} MXN` },
              { label: "Total del plan", value: `$${totalPlan.toLocaleString("es-MX")} MXN` },
              { label: "Estado", value: cliente.activo ? "Activo" : "Inactivo" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                <span className="text-xs text-muted">{row.label}</span>
                <span className="text-sm font-medium text-text">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Coaching personalizado (solo si activo) */}
          {cliente.coaching_extra && (
            <div className="bg-blue/5 border border-blue/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest text-blue font-bold">★ Coaching personalizado</p>
              </div>
              <div className="space-y-3 mb-4">
                {[
                  { label: "Altura", value: cliente.altura ? `${cliente.altura} cm` : "—" },
                  { label: "Peso inicial", value: cliente.peso_inicial ? `${cliente.peso_inicial} kg` : "—" },
                  { label: "Peso actual", value: cliente.peso_actual ? `${cliente.peso_actual} kg` : "—" },
                  { label: "Peso meta", value: cliente.peso_meta ? `${cliente.peso_meta} kg` : "—" },
                  { label: "Objetivo", value: cliente.objetivo ?? "—" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-blue/10 last:border-0">
                    <span className="text-xs text-muted">{row.label}</span>
                    <span className="text-sm font-medium text-text">{row.value}</span>
                  </div>
                ))}
              </div>
              {cliente.condiciones && (
                <div className="bg-bg/40 border border-white/5 rounded-xl p-3 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Condiciones de salud</p>
                  <p className="text-sm text-text/80 leading-relaxed">{cliente.condiciones}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/admin/dietas/${id}`} className="text-xs font-bold text-center bg-blue/15 text-blue border border-blue/30 hover:bg-blue/25 rounded-xl py-2 transition-all">
                  Ver dieta
                </Link>
                <Link href={`/admin/progreso/${id}`} className="text-xs font-bold text-center bg-blue/15 text-blue border border-blue/30 hover:bg-blue/25 rounded-xl py-2 transition-all">
                  Ver progreso
                </Link>
              </div>
            </div>
          )}

          {/* Historial de pagos */}
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-muted">Pagos recientes</p>
              <Link href="/admin/pagos" className="text-xs text-accent font-semibold hover:underline">
                Ver todo →
              </Link>
            </div>
            {!pagos?.length ? (
              <p className="text-sm text-muted">Sin pagos registrados aún.</p>
            ) : (
              <div className="space-y-2">
                {pagos.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <span className="text-xs text-muted">
                      {new Date(p.mes).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text">${p.monto}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        p.estado === "pagado"
                          ? "bg-green/15 text-green"
                          : p.estado === "pendiente"
                          ? "bg-amber/15 text-amber"
                          : "bg-surface2 text-muted"
                      }`}>
                        {p.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
