import { createClient } from "@/lib/supabase/server";
import DietEditor from "@/components/admin/DietEditor";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DietaClientePage(props: PageProps<"/admin/dietas/[clienteId]">) {
  const { clienteId } = await props.params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre")
    .eq("id", clienteId)
    .single();

  if (!cliente) notFound();

  // Get or create diet
  let { data: dieta } = await supabase
    .from("dietas")
    .select("id, notas, updated_at")
    .eq("cliente_id", clienteId)
    .eq("activa", true)
    .single();

  let dietaId = dieta?.id;

  if (!dietaId) {
    const { data: nueva } = await supabase
      .from("dietas")
      .insert({ cliente_id: clienteId, activa: true })
      .select("id, notas, updated_at")
      .single();
    dieta = nueva;
    dietaId = nueva?.id;
  }

  const { data: comidas } = await supabase
    .from("comidas")
    .select("*")
    .eq("dieta_id", dietaId)
    .order("tipo")
    .order("orden");

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">
          <Link href="/admin/dietas" className="hover:text-text">Dietas</Link> /
        </p>
        <h1 className="font-display font-black text-3xl tracking-tight">{cliente.nombre}</h1>
        {dieta?.updated_at && (
          <p className="text-xs text-muted mt-1">
            Actualizada: {new Date(dieta.updated_at).toLocaleDateString("es-MX")}
          </p>
        )}
      </div>
      <DietEditor dietaId={dietaId!} comidas={comidas ?? []} notas={dieta?.notas ?? ""} />
    </div>
  );
}
