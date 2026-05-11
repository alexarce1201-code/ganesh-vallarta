import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MAX_CLIENTES } from "@/lib/constants";

async function getDashboardData() {
  const supabase = await createClient();
  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const hoy = now.toISOString().split("T")[0];

  const [clientesRes, pagosRes, wodRes] = await Promise.all([
    supabase.from("clientes").select("id, nombre, activo, fecha_inicio, monto_mensual, coaching_extra").eq("activo", true).order("fecha_inicio", { ascending: false }),
    supabase.from("pagos").select("monto, estado").eq("mes", mesActual),
    supabase.from("wods").select("id, fecha, titulo").eq("fecha", hoy).maybeSingle(),
  ]);

  const clientes = clientesRes.data ?? [];
  const pagos = pagosRes.data ?? [];

  const ingresosMes = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + (p.monto ?? 0), 0);

  const pendientes = pagos.filter((p) => p.estado === "pendiente").length;
  const ingresosPotencial = clientes.reduce((sum, c) => sum + (c.monto_mensual ?? 0), 0);

  return {
    totalMiembros: clientes.length,
    ingresosMes,
    ingresosPotencial,
    pagosPendientes: pendientes,
    clientes,
    wodHoy: wodRes.data,
  };
}

function formatMXN(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">Panel general</p>
        <h1 className="font-black text-3xl tracking-tight">
          Bienvenido, <span className="text-accent">Ganesh</span>
        </h1>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <MetricCard label="Miembros activos" value={String(data.totalMiembros)} sub={`de ${MAX_CLIENTES} máx`} />
        <MetricCard label="Ingresos del mes" value={formatMXN(data.ingresosMes)} sub={`de ${formatMXN(data.ingresosPotencial)}`} accent />
        <MetricCard label="Pagos pendientes" value={String(data.pagosPendientes)} sub="por cobrar" warn={data.pagosPendientes > 0} />
      </div>

      {/* Capacidad */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 mb-6">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">Capacidad del box</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-surface2 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${Math.min((data.totalMiembros / MAX_CLIENTES) * 100, 100)}%` }}
            />
          </div>
          <span className="font-bold text-sm text-text">{data.totalMiembros}/{MAX_CLIENTES}</span>
        </div>
        <p className="text-xs text-muted">{MAX_CLIENTES - data.totalMiembros} cupos disponibles</p>
      </div>

      {/* WOD del día */}
      <div className={`rounded-2xl p-5 mb-6 border ${data.wodHoy ? "bg-accent/10 border-accent/30" : "bg-surface border-[rgba(255,255,255,0.08)]"}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest text-muted">WOD de hoy</p>
          <Link href="/admin/wod" className="text-xs text-accent font-semibold hover:underline">
            {data.wodHoy ? "Editar →" : "Crear →"}
          </Link>
        </div>
        {data.wodHoy ? (
          <p className="font-bold text-lg text-text">{data.wodHoy.titulo}</p>
        ) : (
          <p className="text-sm text-muted">Aún no has publicado el WOD de hoy.</p>
        )}
      </div>

      {/* Accesos rápidos */}
      <p className="text-xs uppercase tracking-widest text-muted mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <QuickLink href="/admin/clientes/nuevo" label="+ Nuevo miembro" />
        <QuickLink href="/admin/wod" label="Publicar WOD" />
        <QuickLink href="/admin/pagos" label="Control de pagos" />
        <QuickLink href="/admin/horarios" label="Ver horarios" />
      </div>

      {/* Lista de miembros recientes */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs uppercase tracking-widest text-muted">Miembros recientes</p>
          <Link href="/admin/clientes" className="text-xs text-accent font-semibold hover:underline">
            Ver todos →
          </Link>
        </div>
        {data.clientes.length === 0 ? (
          <div className="px-5 py-8 text-center text-muted text-sm">
            Sin miembros aún.{" "}
            <Link href="/admin/clientes/nuevo" className="text-accent hover:underline">
              Agrega el primero
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {data.clientes.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                href={`/admin/clientes/${c.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-surface2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-xs flex-shrink-0">
                    {c.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text">{c.nombre}</span>
                </div>
                {c.fecha_inicio && (
                  <span className="text-xs text-muted">
                    Desde {new Date(c.fecha_inicio).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label, value, sub, accent, warn,
}: {
  label: string; value: string; sub?: string; accent?: boolean; warn?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 border ${accent ? "bg-accent/10 border-accent/30" : "bg-surface border-[rgba(255,255,255,0.08)]"}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted mb-1.5">{label}</p>
      <p className={`font-bold text-2xl tracking-tight leading-none mb-1 ${accent ? "text-accent" : warn ? "text-amber" : "text-text"}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="bg-surface border border-[rgba(255,255,255,0.08)] hover:border-accent/40 hover:bg-accent/5 rounded-2xl p-4 text-sm font-semibold text-muted hover:text-accent transition-all text-center"
    >
      {label}
    </Link>
  );
}
