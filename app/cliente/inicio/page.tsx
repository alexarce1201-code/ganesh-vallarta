import { getClienteOrRedirect } from "@/lib/get-cliente";
import { getSemanaInicio, getDiaNombre, DIAS_SEMANA } from "@/lib/semana";

export const dynamic = "force-dynamic";

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function diasActivo(fechaInicio: string | null): number {
  if (!fechaInicio) return 0;
  const start = new Date(fechaInicio);
  const now   = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

export default async function InicioPage() {
  const { cliente, supabase } = await getClienteOrRedirect();
  const semana = getSemanaInicio();

  // Fetch this week's asignaciones with slot details
  const { data: asignaciones } = await supabase
    .from("asignaciones")
    .select("*, slot:slots(*)")
    .eq("cliente_id", cliente.id)
    .eq("semana_inicio", semana);

  // Fetch latest unread mensaje, or the most recent
  const { data: mensajes } = await supabase
    .from("mensajes")
    .select("*")
    .eq("cliente_id", cliente.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const mensaje =
    mensajes?.find((m) => !m.leido) ?? mensajes?.[0] ?? null;

  // Fetch latest progreso
  const { data: progreso } = await supabase
    .from("progreso")
    .select("*")
    .eq("cliente_id", cliente.id)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();

  const clasesCount = asignaciones?.length ?? 0;
  const dias = diasActivo(cliente.fecha_inicio);

  // Which days of the week has the client a class?
  const diasConClase = new Set(
    (asignaciones ?? []).map((a: { slot: { dia: string } }) => a.slot?.dia)
  );

  // Next upcoming slot (sort by day order + time)
  const diaOrderMap: Record<string, number> = {
    lunes: 0, martes: 1, miercoles: 2, jueves: 3, viernes: 4, sabado: 5,
  };
  const today   = new Date().getDay(); // 0=Sun
  const todayMapped = today === 0 ? 6 : today - 1; // 0=Mon..5=Sat

  const sortedAsignaciones = [...(asignaciones ?? [])].sort((a, b) => {
    const da = diaOrderMap[a.slot?.dia] ?? 99;
    const db = diaOrderMap[b.slot?.dia] ?? 99;
    if (da !== db) return da - db;
    return (a.slot?.hora_inicio ?? "").localeCompare(b.slot?.hora_inicio ?? "");
  });

  const proximaClase =
    sortedAsignaciones.find(
      (a) => (diaOrderMap[a.slot?.dia] ?? 99) >= todayMapped
    ) ?? sortedAsignaciones[0] ?? null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-1">
            Plan personalizado
          </p>
          <h1 className="font-display font-black text-2xl text-text tracking-tight">
            Oscar <span className="text-accent">Salcedo</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <span className="text-[10px] font-display font-black text-accent">
              {getInitials(cliente.nombre)}
            </span>
          </div>
          <span className="text-xs font-display font-semibold text-text truncate max-w-[100px]">
            {cliente.nombre.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* ── Resumen ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Resumen
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Peso actual"
            value={
              progreso?.peso
                ? `${progreso.peso} kg`
                : cliente.peso_actual
                ? `${cliente.peso_actual} kg`
                : "—"
            }
            color="blue"
          />
          <MetricCard
            label="Peso meta"
            value={cliente.peso_meta ? `${cliente.peso_meta} kg` : "—"}
            color="green"
          />
          <MetricCard
            label="Días activo"
            value={dias.toString()}
            color="amber"
          />
          <MetricCard
            label="Clases esta semana"
            value={clasesCount.toString()}
            color="accent"
          />
        </div>
      </section>

      {/* ── Asistencia esta semana ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Asistencia esta semana
        </h2>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
          <div className="flex items-center justify-between gap-1">
            {DIAS_SEMANA.map((dia, i) => {
              const hasClass = diasConClase.has(dia);
              const isPast   = i < todayMapped;
              const isToday  = i === todayMapped;
              return (
                <div key={dia} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] font-display font-semibold text-muted">
                    {getDiaNombre(dia)}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-data font-bold transition-all ${
                      hasClass
                        ? isToday
                          ? "bg-accent text-white ring-2 ring-accent/40"
                          : isPast
                          ? "bg-accent/30 text-accent"
                          : "bg-accent/20 text-accent border border-accent/30"
                        : isToday
                        ? "bg-surface2 border border-accent/40 text-muted"
                        : "bg-surface2 border border-[rgba(255,255,255,0.06)] text-muted/50"
                    }`}
                  >
                    {hasClass ? "✓" : "·"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Próxima clase ── */}
      {proximaClase ? (
        <section>
          <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
            Próxima clase
          </h2>
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-text capitalize">
                {getDiaNombre(proximaClase.slot?.dia ?? "")}
              </p>
              <p className="text-accent font-data font-semibold text-lg">
                {proximaClase.slot?.hora_inicio?.slice(0, 5) ?? ""} – {proximaClase.slot?.hora_fin?.slice(0, 5) ?? ""}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-display font-semibold uppercase tracking-wider text-accent/80 bg-accent/10 border border-accent/20 rounded-full px-2 py-0.5">
                Esta semana
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
            Próxima clase
          </h2>
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-center">
            <p className="text-muted text-sm">No tienes clases asignadas esta semana.</p>
          </div>
        </section>
      )}

      {/* ── Mensaje del coach ── */}
      <section>
        <h2 className="text-xs font-display font-semibold uppercase tracking-widest text-muted mb-3">
          Mensaje de tu coach
        </h2>
        {mensaje ? (
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 space-y-2 relative overflow-hidden">
            {/* Accent left bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-2xl" />
            <div className="pl-3">
              {!mensaje.leido && (
                <span className="inline-block text-[10px] font-display font-bold uppercase tracking-wider text-amber bg-amber/10 border border-amber/20 rounded-full px-2 py-0.5 mb-2">
                  Nuevo
                </span>
              )}
              <p className="font-display font-bold text-text text-sm mb-1">
                {mensaje.titulo}
              </p>
              <p className="text-muted text-sm leading-relaxed line-clamp-3">
                {mensaje.cuerpo}
              </p>
              <p className="text-muted/60 text-xs mt-2 font-data">
                {new Date(mensaje.created_at).toLocaleDateString("es-MX", {
                  day: "numeric", month: "short",
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-center">
            <p className="text-muted text-sm">Sin mensajes por ahora.</p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Sub-components ── */

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "accent" | "green" | "blue" | "amber";
}) {
  const colorMap = {
    accent: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent" },
    green:  { bg: "bg-green/10",  border: "border-green/20",  text: "text-green" },
    blue:   { bg: "bg-blue/10",   border: "border-blue/20",   text: "text-blue" },
    amber:  { bg: "bg-amber/10",  border: "border-amber/20",  text: "text-amber" },
  };
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
      <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-muted mb-1">
        {label}
      </p>
      <p className={`font-data font-bold text-2xl ${c.text}`}>{value}</p>
    </div>
  );
}
