import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, edad, tipo, objetivo, activo, created_at")
    .order("nombre");

  const activos = clientes?.filter((c) => c.activo) ?? [];
  const inactivos = clientes?.filter((c) => !c.activo) ?? [];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">Administración</p>
          <h1 className="font-display font-black text-3xl tracking-tight">Clientes</h1>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="bg-accent text-white font-display font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
        >
          + Nuevo
        </Link>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-center">
          <p className="font-data font-bold text-2xl text-text">{activos.length}</p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Activos</p>
        </div>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-center">
          <p className="font-data font-bold text-2xl text-accent">{activos.filter(c => c.tipo === "grupal").length}</p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Grupales</p>
        </div>
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-center">
          <p className="font-data font-bold text-2xl text-blue">{activos.filter(c => c.tipo === "individual").length}</p>
          <p className="text-[10px] font-display uppercase tracking-widest text-muted">Individuales</p>
        </div>
      </div>

      {/* Lista activos */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs font-display uppercase tracking-widest text-muted">Activos ({activos.length})</p>
        </div>
        {activos.length === 0 ? (
          <div className="px-5 py-8 text-center text-muted text-sm">
            Sin clientes.{" "}
            <Link href="/admin/clientes/nuevo" className="text-accent hover:underline">
              Agrega el primero
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {activos.map((c) => (
              <Link
                key={c.id}
                href={`/admin/clientes/${c.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface2 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-display font-bold text-accent text-xs flex-shrink-0">
                  {c.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{c.nombre}</p>
                  {c.objetivo && <p className="text-xs text-muted truncate">{c.objetivo}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {c.edad && <span className="text-xs text-muted">{c.edad} años</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-md font-display font-bold ${
                    c.tipo === "individual"
                      ? "bg-blue/15 text-blue"
                      : "bg-accent/12 text-accent"
                  }`}>
                    {c.tipo}
                  </span>
                  <span className="text-muted text-xs">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Inactivos (colapsable visualmente) */}
      {inactivos.length > 0 && (
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden opacity-60">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
            <p className="text-xs font-display uppercase tracking-widest text-muted">Inactivos ({inactivos.length})</p>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {inactivos.map((c) => (
              <Link
                key={c.id}
                href={`/admin/clientes/${c.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-surface2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-surface2 border border-[rgba(255,255,255,0.08)] flex items-center justify-center font-display font-bold text-muted text-xs flex-shrink-0">
                  {c.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm text-muted flex-1">{c.nombre}</p>
                <span className="text-xs text-muted">inactivo</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
