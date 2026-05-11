import Link from "next/link";
import { getClienteOrRedirect } from "@/lib/get-cliente";

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

function fmtFechaCorta(iso: string) {
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

export default async function InicioPage() {
  const { cliente, supabase } = await getClienteOrRedirect();
  const hoy = new Date().toISOString().split("T")[0];

  // WOD del día
  const { data: wodHoy } = await supabase
    .from("wods")
    .select("titulo, descripcion, notas")
    .eq("fecha", hoy)
    .maybeSingle();

  // Próxima reserva del cliente
  const { data: proximaReserva } = await supabase
    .from("reservas")
    .select("fecha, slot:slots(hora_inicio, hora_fin)")
    .eq("cliente_id", cliente.id)
    .gte("fecha", hoy)
    .order("fecha", { ascending: true })
    .limit(1)
    .maybeSingle();

  const proxSlot = proximaReserva?.slot as
    | { hora_inicio: string; hora_fin: string }
    | { hora_inicio: string; hora_fin: string }[]
    | null
    | undefined;
  const slotInfo = Array.isArray(proxSlot) ? proxSlot[0] : proxSlot;

  const dias = diasActivo(cliente.fecha_inicio);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Tu box</p>
          <h1 className="font-black text-2xl text-text tracking-tight">
            Ganesh <span className="text-accent">Vallarta</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-surface2 border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <span className="text-[10px] font-black text-accent">{getInitials(cliente.nombre)}</span>
          </div>
          <span className="text-xs font-semibold text-text truncate max-w-[100px]">
            {cliente.nombre.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* ── WOD del día ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">WOD de hoy</h2>
        {wodHoy ? (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">★ Workout of the Day</p>
              <h3 className="font-black text-xl text-text">{wodHoy.titulo}</h3>
            </div>
            <pre className="text-sm text-text/85 leading-relaxed whitespace-pre-wrap font-mono bg-bg/40 border border-white/5 rounded-xl p-4">
              {wodHoy.descripcion}
            </pre>
            {wodHoy.notas && (
              <div className="border-t border-accent/20 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Notas del coach</p>
                <p className="text-sm text-text/70 leading-relaxed">{wodHoy.notas}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-center">
            <p className="text-muted text-sm">El coach aún no ha publicado el WOD de hoy.</p>
          </div>
        )}
      </section>

      {/* ── Próxima reserva ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Próxima reserva</h2>
        {proximaReserva && slotInfo ? (
          <Link
            href="/cliente/clases"
            className="block bg-accent/10 border border-accent/30 rounded-2xl p-4 flex items-center gap-4 hover:bg-accent/15 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text capitalize">{fmtFechaCorta(proximaReserva.fecha)}</p>
              <p className="text-accent font-bold text-lg">
                {slotInfo.hora_inicio.slice(0, 5)} – {slotInfo.hora_fin.slice(0, 5)}
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent/80 bg-accent/10 border border-accent/20 rounded-full px-2 py-0.5">
              Confirmada
            </span>
          </Link>
        ) : (
          <Link
            href="/cliente/clases"
            className="block bg-surface border border-[rgba(255,255,255,0.08)] hover:border-accent/40 rounded-2xl p-5 text-center transition-colors"
          >
            <p className="text-text text-sm mb-2">No tienes clases reservadas.</p>
            <p className="text-accent text-sm font-bold">Reservar ahora →</p>
          </Link>
        )}
      </section>

      {/* ── Resumen ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Resumen</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Días como miembro" value={dias.toString()} color="amber" />
          <MetricCard label="Mi membresía" value="Activa" color="accent" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "accent" | "amber";
}) {
  const colorMap = {
    accent: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent" },
    amber:  { bg: "bg-amber/10",  border: "border-amber/20",  text: "text-amber" },
  };
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className={`font-bold text-xl ${c.text}`}>{value}</p>
    </div>
  );
}
