import { getClienteOrRedirect } from "@/lib/get-cliente";
import SignOutButton from "@/components/cliente/SignOutButton";

export const dynamic = "force-dynamic";

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(d: string | null) {
  if (!d) return "—";
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function diasDesde(fechaInicio: string | null): number {
  if (!fechaInicio) return 0;
  const start = new Date(fechaInicio);
  const now   = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

export default async function PerfilPage() {
  const { cliente } = await getClienteOrRedirect();

  const planLabel = `${cliente.meses_plan ?? 1} ${cliente.meses_plan === 1 ? "mes" : "meses"}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Mi cuenta</p>
        <h1 className="font-black text-2xl text-text tracking-tight">Perfil</h1>
      </div>

      {/* Avatar + nombre */}
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center mb-4">
          <span className="font-black text-2xl text-accent">
            {getInitials(cliente.nombre)}
          </span>
        </div>
        <h2 className="font-black text-xl text-text">{cliente.nombre}</h2>
        <p className="text-muted text-sm mt-0.5">
          Miembro desde {formatDate(cliente.fecha_inicio)}
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
            Plan {planLabel}
          </span>
          {cliente.coaching_extra && (
            <span className="text-xs font-semibold uppercase tracking-wider text-blue bg-blue/10 border border-blue/30 rounded-full px-3 py-1">
              ★ Coaching extra
            </span>
          )}
          {cliente.activo && (
            <span className="text-xs font-semibold uppercase tracking-wider text-green bg-green/10 border border-green/20 rounded-full px-3 py-1">
              Activo
            </span>
          )}
        </div>
        <p className="text-muted/60 text-xs mt-2">
          {diasDesde(cliente.fecha_inicio)} días en el box
        </p>
      </div>

      {/* Mi membresía */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Mi membresía</h2>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <Row label="Plan contratado" value={planLabel} />
          <Row label="Monto mensual" value={`$${(cliente.monto_mensual ?? 0).toLocaleString("es-MX")} MXN`} />
          <Row label="Total del plan" value={`$${((cliente.meses_plan ?? 1) * (cliente.monto_mensual ?? 0)).toLocaleString("es-MX")} MXN`} last />
        </div>
      </section>

      {/* Coaching personalizado (solo si activo) */}
      {cliente.coaching_extra && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            ★ Coaching personalizado
          </h2>
          <div className="bg-blue/5 border border-blue/20 rounded-2xl overflow-hidden">
            <Row label="Altura"       value={cliente.altura       ? `${cliente.altura} cm` : "—"} />
            <Row label="Peso inicial" value={cliente.peso_inicial ? `${cliente.peso_inicial} kg` : "—"} />
            <Row label="Peso actual"  value={cliente.peso_actual  ? `${cliente.peso_actual} kg`  : "—"} />
            <Row label="Peso meta"    value={cliente.peso_meta    ? `${cliente.peso_meta} kg`    : "—"} />
            <Row label="Objetivo"     value={cliente.objetivo ?? "—"} last />
          </div>
          {cliente.condiciones && (
            <div className="mt-3 bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Condiciones de salud</p>
              <p className="text-sm text-text/80 leading-relaxed">{cliente.condiciones}</p>
            </div>
          )}
        </section>
      )}

      {/* Contacto */}
      {cliente.contacto && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Contacto</h2>
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
            <p className="text-sm text-text">{cliente.contacto}</p>
          </div>
        </section>
      )}

      {/* Cerrar sesión */}
      <div className="pt-2 pb-4">
        <SignOutButton />
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string | number; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${last ? "" : "border-b border-[rgba(255,255,255,0.06)]"}`}>
      <span className="text-sm font-semibold text-muted">{label}</span>
      <span className="text-sm font-semibold text-text">{value}</span>
    </div>
  );
}
