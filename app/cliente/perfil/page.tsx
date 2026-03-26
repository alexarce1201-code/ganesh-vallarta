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

  const rows: Array<{ label: string; value: string | number | null; unit?: string }> = [
    { label: "Edad",         value: cliente.edad,          unit: "años" },
    { label: "Altura",       value: cliente.altura,        unit: "cm" },
    { label: "Peso inicial", value: cliente.peso_inicial,  unit: "kg" },
    { label: "Peso actual",  value: cliente.peso_actual,   unit: "kg" },
    { label: "Peso meta",    value: cliente.peso_meta,     unit: "kg" },
    { label: "Objetivo",     value: cliente.objetivo       ?? null },
    { label: "Tipo de plan", value: cliente.tipo === "individual" ? "Individual" : "Grupal" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <p className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-1">
          Mi cuenta
        </p>
        <h1 className="font-display font-black text-2xl text-text tracking-tight">
          Perfil
        </h1>
      </div>

      {/* ── Avatar + name ── */}
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center mb-4">
          <span className="font-display font-black text-2xl text-accent">
            {getInitials(cliente.nombre)}
          </span>
        </div>
        <h2 className="font-display font-black text-xl text-text">
          {cliente.nombre}
        </h2>
        <p className="text-muted text-sm mt-0.5">
          Desde {formatDate(cliente.fecha_inicio)}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-display font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
            {cliente.tipo === "individual" ? "Individual" : "Grupal"}
          </span>
          {cliente.activo && (
            <span className="text-xs font-display font-semibold uppercase tracking-wider text-green bg-green/10 border border-green/20 rounded-full px-3 py-1">
              Activo
            </span>
          )}
        </div>
        <p className="text-muted/60 text-xs mt-2 font-data">
          {diasDesde(cliente.fecha_inicio)} días en el programa
        </p>
      </div>

      {/* ── Profile rows ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Mis datos
        </h2>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-4 ${
                i < rows.length - 1 ? "border-b border-[rgba(255,255,255,0.06)]" : ""
              }`}
            >
              <span className="text-sm font-display font-semibold text-muted">
                {row.label}
              </span>
              <span className={`text-sm font-data font-semibold ${row.value != null ? "text-text" : "text-muted/50"}`}>
                {row.value != null
                  ? `${row.value}${row.unit ? ` ${row.unit}` : ""}`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Condiciones ── */}
      {cliente.condiciones && (
        <section>
          <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
            Condiciones de salud
          </h2>
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
            <p className="text-sm text-muted leading-relaxed">{cliente.condiciones}</p>
          </div>
        </section>
      )}

      {/* ── Contacto ── */}
      {cliente.contacto && (
        <section>
          <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
            Contacto
          </h2>
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
            <p className="text-sm text-text font-data">{cliente.contacto}</p>
          </div>
        </section>
      )}

      {/* ── Sign out ── */}
      <div className="pt-2 pb-4">
        <SignOutButton />
      </div>
    </div>
  );
}
