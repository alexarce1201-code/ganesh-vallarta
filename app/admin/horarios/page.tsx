import { createClient } from "@/lib/supabase/server";
import WeeklyCalendar from "@/components/admin/WeeklyCalendar";

function getMondayOfWeek(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

export default async function HorariosPage() {
  const supabase = await createClient();
  const semanaInicio = getMondayOfWeek(new Date());

  const [slotsRes, asignRes, clientesRes] = await Promise.all([
    supabase.from("slots").select("*").order("dia").order("hora_inicio"),
    supabase
      .from("asignaciones")
      .select("id, slot_id, cliente_id, cliente:clientes(nombre)")
      .eq("semana_inicio", semanaInicio),
    supabase.from("clientes").select("id, nombre").eq("activo", true).order("nombre"),
  ]);

  // Normalize cliente relation (Supabase may return array or object)
  const asignaciones = (asignRes.data ?? []).map((a) => ({
    ...a,
    cliente: Array.isArray(a.cliente) ? (a.cliente[0] ?? null) : a.cliente,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">Administración</p>
        <h1 className="font-display font-black text-3xl tracking-tight">Horarios</h1>
      </div>
      <WeeklyCalendar
        slots={slotsRes.data ?? []}
        asignaciones={asignaciones}
        clientes={clientesRes.data ?? []}
        semanaInicio={semanaInicio}
      />
    </div>
  );
}
