import { createClient } from "@/lib/supabase/server";
import HorariosAdmin from "@/components/admin/HorariosAdmin";

export const dynamic = "force-dynamic";

function getNext14Weekdays(): string[] {
  const out: string[] = [];
  const d = new Date();
  while (out.length < 14) {
    const dow = d.getDay(); // 0=Sun..6=Sat
    if (dow >= 1 && dow <= 5) {
      out.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default async function HorariosPage(props: { searchParams: Promise<{ fecha?: string }> }) {
  const params = await props.searchParams;
  const supabase = await createClient();

  const fechas = getNext14Weekdays();
  const fecha = params.fecha && fechas.includes(params.fecha) ? params.fecha : fechas[0];

  const [slotsRes, reservasRes] = await Promise.all([
    supabase.from("slots").select("*").eq("activo", true).order("orden"),
    supabase
      .from("reservas")
      .select("id, slot_id, cliente:clientes(id, nombre)")
      .eq("fecha", fecha),
  ]);

  const reservas = (reservasRes.data ?? []).map((r) => ({
    id: r.id,
    slot_id: r.slot_id,
    cliente: Array.isArray(r.cliente) ? (r.cliente[0] ?? null) : r.cliente,
  }));

  return (
    <HorariosAdmin
      slots={slotsRes.data ?? []}
      reservas={reservas}
      fechaSeleccionada={fecha}
      fechasDisponibles={fechas}
    />
  );
}
