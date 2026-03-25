import { createClient } from "@/lib/supabase/server";
import ProgresoView from "@/components/admin/ProgresoView";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProgresoClientePage(props: PageProps<"/admin/progreso/[clienteId]">) {
  const { clienteId } = await props.params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre, peso_inicial, peso_actual, peso_meta, altura")
    .eq("id", clienteId)
    .single();

  if (!cliente) notFound();

  const { data: progreso } = await supabase
    .from("progreso")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">
          <Link href="/admin/progreso" className="hover:text-text">Progreso</Link> /
        </p>
        <h1 className="font-display font-black text-3xl tracking-tight">{cliente.nombre}</h1>
      </div>
      <ProgresoView cliente={cliente} progreso={progreso ?? []} />
    </div>
  );
}
