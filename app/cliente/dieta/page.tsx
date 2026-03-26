import { getClienteOrRedirect } from "@/lib/get-cliente";
import DietaClient from "@/components/cliente/DietaClient";

export const dynamic = "force-dynamic";

export default async function DietaPage() {
  const { cliente, supabase } = await getClienteOrRedirect();

  // Active diet
  const { data: dieta } = await supabase
    .from("dietas")
    .select("*")
    .eq("cliente_id", cliente.id)
    .eq("activa", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let comidas: unknown[] = [];
  if (dieta) {
    const { data } = await supabase
      .from("comidas")
      .select("*")
      .eq("dieta_id", dieta.id)
      .order("orden", { ascending: true });
    comidas = data ?? [];
  }

  return <DietaClient dieta={dieta} comidas={comidas} />;
}
