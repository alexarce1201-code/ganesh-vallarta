import { getClienteOrRedirect } from "@/lib/get-cliente";
import { getSemanaInicio, getSemanaInicioOffset } from "@/lib/semana";
import ClasesClient from "@/components/cliente/ClasesClient";

export const dynamic = "force-dynamic";

export default async function ClasesPage() {
  const { cliente, supabase } = await getClienteOrRedirect();

  const semana0 = getSemanaInicio();
  const semana1 = getSemanaInicioOffset(1);
  const semana2 = getSemanaInicioOffset(2);

  // Current + next 2 weeks
  const { data: asignaciones } = await supabase
    .from("asignaciones")
    .select("*, slot:slots(*)")
    .eq("cliente_id", cliente.id)
    .in("semana_inicio", [semana0, semana1, semana2])
    .order("semana_inicio", { ascending: true });

  return (
    <ClasesClient
      asignaciones={asignaciones ?? []}
      semanaActual={semana0}
    />
  );
}
