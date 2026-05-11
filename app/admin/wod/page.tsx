import { createClient } from "@/lib/supabase/server";
import WodEditor from "@/components/admin/WodEditor";

export const dynamic = "force-dynamic";

type Wod = {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  notas: string | null;
  updated_at: string;
};

export default async function WodPage() {
  const supabase = await createClient();
  const hoy = new Date().toISOString().split("T")[0];

  // WOD de hoy (si existe)
  const { data: wodHoy } = await supabase
    .from("wods")
    .select("*")
    .eq("fecha", hoy)
    .maybeSingle<Wod>();

  // Últimos 14 WODs (para historial)
  const { data: historial } = await supabase
    .from("wods")
    .select("id, fecha, titulo")
    .order("fecha", { ascending: false })
    .limit(14);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">Administración</p>
        <h1 className="font-black text-3xl tracking-tight">
          WOD <span className="text-accent">del día</span>
        </h1>
        <p className="text-sm text-muted mt-1">
          Publica el workout que verán los miembros desde su portal.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor (col principal) */}
        <div className="lg:col-span-2">
          <WodEditor wodHoy={wodHoy ?? null} fecha={hoy} />
        </div>

        {/* Historial */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Historial reciente</p>
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
            {!historial?.length ? (
              <p className="px-5 py-8 text-center text-muted text-sm">Sin WODs aún.</p>
            ) : (
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {historial.map((w) => {
                  const esHoy = w.fecha === hoy;
                  return (
                    <div
                      key={w.id}
                      className={`flex items-center justify-between px-4 py-3 ${esHoy ? "bg-accent/5" : ""}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{w.titulo}</p>
                        <p className="text-xs text-muted">
                          {new Date(w.fecha + "T00:00").toLocaleDateString("es-MX", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      {esHoy && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5">
                          Hoy
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
