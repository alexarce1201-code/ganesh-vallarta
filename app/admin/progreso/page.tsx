import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProgresoPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, peso_inicial, peso_actual, peso_meta")
    .eq("activo", true)
    .eq("coaching_extra", true)
    .order("nombre");

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">Coaching personalizado</p>
        <h1 className="font-black text-3xl tracking-tight">Progreso</h1>
        <p className="text-sm text-muted mt-1">
          Solo aparecen miembros con coaching personalizado contratado.
        </p>
      </div>

      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs uppercase tracking-widest text-muted">Selecciona un miembro</p>
        </div>
        {!clientes?.length ? (
          <div className="px-5 py-8 text-center text-muted text-sm">
            Ningún miembro tiene coaching personalizado activo.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {clientes.map((c) => {
              const diff = c.peso_inicial && c.peso_actual
                ? (c.peso_actual - c.peso_inicial).toFixed(1)
                : null;
              const positive = diff && Number(diff) > 0;
              return (
                <Link
                  key={c.id}
                  href={`/admin/progreso/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface2 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-display font-bold text-accent text-xs flex-shrink-0">
                    {c.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{c.nombre}</p>
                    <p className="text-xs text-muted">
                      {c.peso_actual ? `${c.peso_actual} kg` : "Sin peso"}{" "}
                      {c.peso_meta ? `→ meta: ${c.peso_meta} kg` : ""}
                    </p>
                  </div>
                  {diff && (
                    <span className={`text-xs font-data font-bold ${positive ? "text-accent" : "text-green"}`}>
                      {positive ? "+" : ""}{diff} kg
                    </span>
                  )}
                  <span className="text-muted text-xs">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
