import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DietasPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre")
    .eq("activo", true)
    .eq("coaching_extra", true)
    .order("nombre");

  const { data: dietas } = await supabase
    .from("dietas")
    .select("cliente_id, updated_at")
    .eq("activa", true);

  const dietaMap = new Map(dietas?.map((d) => [d.cliente_id, d.updated_at]) ?? []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">Coaching personalizado</p>
        <h1 className="font-black text-3xl tracking-tight">Dietas</h1>
        <p className="text-sm text-muted mt-1">
          Solo aparecen miembros con coaching personalizado contratado.
        </p>
      </div>

      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-xs uppercase tracking-widest text-muted">
            Miembros con coaching ({clientes?.length ?? 0})
          </p>
        </div>
        {!clientes?.length ? (
          <div className="px-5 py-8 text-center text-muted text-sm">
            Ningún miembro tiene coaching personalizado activo.{" "}
            <Link href="/admin/clientes" className="text-accent hover:underline">Activa uno desde el perfil del miembro</Link>.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {clientes.map((c) => {
              const updated = dietaMap.get(c.id);
              return (
                <Link
                  key={c.id}
                  href={`/admin/dietas/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface2 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-xs flex-shrink-0">
                    {c.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{c.nombre}</p>
                    <p className="text-xs text-muted">
                      {updated
                        ? `Actualizada: ${new Date(updated).toLocaleDateString("es-MX")}`
                        : "Sin dieta asignada"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      updated ? "bg-green/15 text-green" : "bg-surface2 text-muted"
                    }`}>
                      {updated ? "Con dieta" : "Sin dieta"}
                    </span>
                    <span className="text-muted text-xs">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
