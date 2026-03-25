import ClienteForm from "@/components/admin/ClienteForm";

export default function NuevoClientePage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">Clientes</p>
        <h1 className="font-display font-black text-3xl tracking-tight">Nuevo cliente</h1>
      </div>
      <ClienteForm />
    </div>
  );
}
