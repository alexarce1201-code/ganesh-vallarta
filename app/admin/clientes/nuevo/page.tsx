import ClienteForm from "@/components/admin/ClienteForm";

export default function NuevoClientePage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">Miembros</p>
        <h1 className="font-black text-3xl tracking-tight">Nuevo miembro</h1>
      </div>
      <ClienteForm />
    </div>
  );
}
