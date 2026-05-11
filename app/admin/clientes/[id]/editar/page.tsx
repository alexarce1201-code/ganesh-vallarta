import { createClient } from "@/lib/supabase/server";
import ClienteForm from "@/components/admin/ClienteForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditarClientePage(props: PageProps<"/admin/clientes/[id]/editar">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">
          <Link href="/admin/clientes" className="hover:text-text">Miembros</Link>
          {" / "}
          <Link href={`/admin/clientes/${id}`} className="hover:text-text">{cliente.nombre}</Link>
          {" /"}
        </p>
        <h1 className="font-black text-3xl tracking-tight">Editar miembro</h1>
      </div>
      <ClienteForm cliente={cliente} />
    </div>
  );
}
