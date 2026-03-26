import { getClienteOrRedirect } from "@/lib/get-cliente";
import ProgresoClient from "@/components/cliente/ProgresoClient";

export const dynamic = "force-dynamic";

export default async function ProgresoPage() {
  const { cliente, supabase } = await getClienteOrRedirect();

  const { data: registros } = await supabase
    .from("progreso")
    .select("*")
    .eq("cliente_id", cliente.id)
    .order("fecha", { ascending: true });

  return (
    <ProgresoClient
      clienteId={cliente.id}
      pesoMeta={cliente.peso_meta ?? null}
      registros={registros ?? []}
    />
  );
}
