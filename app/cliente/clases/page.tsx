import { getClienteOrRedirect } from "@/lib/get-cliente";
import ReservasClient from "@/components/cliente/ReservasClient";

export const dynamic = "force-dynamic";

function getNext14Weekdays(): string[] {
  const out: string[] = [];
  const d = new Date();
  while (out.length < 14) {
    const dow = d.getDay();
    if (dow >= 1 && dow <= 5) {
      out.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default async function ClasesPage(props: { searchParams: Promise<{ fecha?: string }> }) {
  const params = await props.searchParams;
  const { cliente, supabase } = await getClienteOrRedirect();

  const fechas = getNext14Weekdays();
  const fecha = params.fecha && fechas.includes(params.fecha) ? params.fecha : fechas[0];

  const [slotsRes, dispRes, misReservasRes] = await Promise.all([
    supabase.from("slots").select("*").eq("activo", true).order("orden"),
    supabase.rpc("slot_disponibilidad", { p_fecha: fecha }),
    supabase
      .from("reservas")
      .select("id, slot_id, fecha")
      .eq("cliente_id", cliente.id)
      .gte("fecha", fechas[0])
      .lte("fecha", fechas[fechas.length - 1]),
  ]);

  const conteoPorSlot: Record<string, number> = {};
  (dispRes.data ?? []).forEach((r: { slot_id: string; ocupados: number }) => {
    conteoPorSlot[r.slot_id] = r.ocupados;
  });

  return (
    <ReservasClient
      clienteId={cliente.id}
      slots={slotsRes.data ?? []}
      conteoPorSlot={conteoPorSlot}
      misReservas={misReservasRes.data ?? []}
      fechaSeleccionada={fecha}
      fechasDisponibles={fechas}
    />
  );
}
