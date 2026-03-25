import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PRECIO_GRUPAL, PRECIO_INDIVIDUAL } from "@/lib/constants";

async function getDashboardData() {
  const supabase = await createClient();

  const [clientesRes, clasesHoyRes, pagosRes] = await Promise.all([
    supabase.from("clientes").select("id, nombre, tipo, activo").eq("activo", true),
    supabase
      .from("asignaciones")
      .select("id, slot:slots(dia, hora_inicio)")
      .gte("semana_inicio", getMondayOfWeek(new Date()).toISOString().split("T")[0]),
    supabase
      .from("pagos")
      .select("monto, estado, tipo")
      .gte("mes", getFirstOfMonth(new Date()).toISOString().split("T")[0]),
  ]);

  const clientes = clientesRes.data ?? [];
  const pagos = pagosRes.data ?? [];

  const ingresosMes = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + (p.monto ?? 0), 0);

  const pendientes = pagos.filter((p) => p.estado === "pendiente").length;

  const ingresosPotencial =
    clientes.filter((c) => c.tipo === "grupal").length * PRECIO_GRUPAL +
    clientes.filter((c) => c.tipo === "individual").length * PRECIO_INDIVIDUAL;

  return {
    totalClientes: clientes.length,
    clientesGrupales: clientes.filter((c) => c.tipo === "grupal").length,
    clientesIndividuales: clientes.filter((c) => c.tipo === "individual").length,
    ingresosMes,
    ingresosPotencial,
    pagosPendientes: pendientes,
    clientes,
  };
}

function getMondayOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getFirstOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
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
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">Panel general</p>
        <h1 className="font-display font-black text-3xl tracking-tight">
          Bienvenido, <span className="text-accent">Oscar</span>
        </h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <MetricCard label="Clientes activos" value={String(data.totalClientes)} sub={`de 40 máx`} />
        <MetricCard label="Ingresos mes" value={formatMXN(data.ingresosMes)} sub={`de ${formatMXN(data.ingresosPotencial)}`} accent />
        <MetricCard label="Pagos pendientes" value={String(data.pagosPendientes)} sub="clientes" warn={data.pagosPendientes > 0} />
        <MetricCard label="Grupales / Indiv." value={`${data.clientesGrupales} / ${data.clientesIndividuales}`} sub="distribución" />
      </div>

      {/* Capacidad */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 mb-6">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Capacidad</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-surface2 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${Math.min((data.totalClientes / 40) * 100, 100)}%` }}
            />
          </div>
          <span className="font-data font-bold text-sm text-text">{data.totalClientes}/40</span>
        </div>
        <p className="text-xs text-muted">{40 - data.totalClientes} cupos disponibles</p>
      </div>

      {/* Accesos rápidos */}
      <p className="text-xs font-display uppercase tracking-widest text-muted mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <QuickLink href="/admin/clientes/nuevo" label="+ Nuevo cliente" />
        <QuickLink href="/admin/horarios" label="Ver horarios" />
        <QuickLink href="/admin/pagos" label="Control de pagos" />
      </div>

      {/* Lista de clientes recientes */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs font-display uppercase tracking-widest text-muted">Clientes activos</p>
          <Link href="/admin/clientes" className="text-xs text-accent font-display font-semibold hover:underline">
            Ver todos →
          </Link>
        </div>
        {data.clientes.length === 0 ? (
          <div className="px-5 py-8 text-center text-muted text-sm">
            Sin clientes aún.{" "}
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
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-display font-bold text-accent text-xs flex-shrink-0">
                    {c.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text">{c.nombre}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-display font-bold ${
                  c.tipo === "individual"
                    ? "bg-blue/15 text-blue"
                    : "bg-accent/12 text-accent"
                }`}>
                  {c.tipo}
                </span>
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
      <p className="text-[10px] font-display uppercase tracking-widest text-muted mb-1.5">{label}</p>
      <p className={`font-data font-bold text-2xl tracking-tight leading-none mb-1 ${accent ? "text-accent" : warn ? "text-amber" : "text-text"}`}>
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
      className="bg-surface border border-[rgba(255,255,255,0.08)] hover:border-accent/40 hover:bg-accent/5 rounded-2xl p-4 text-sm font-display font-semibold text-muted hover:text-accent transition-all text-center"
    >
      {label}
    </Link>
  );
}
