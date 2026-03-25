import { createClient } from "@/lib/supabase/server";
import PagosView from "@/components/admin/PagosView";

export default async function PagosPage() {
  const supabase = await createClient();
  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [clientesRes, pagosRes] = await Promise.all([
    supabase.from("clientes").select("id, nombre, tipo").eq("activo", true).order("nombre"),
    supabase
      .from("pagos")
      .select("id, cliente_id, monto, estado, tipo, mes")
      .eq("mes", mesActual),
  ]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-display uppercase tracking-widest text-muted mb-1">Administración</p>
        <h1 className="font-display font-black text-3xl tracking-tight">Pagos</h1>
        <p className="text-sm text-muted mt-1">
          {now.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
        </p>
      </div>
      <PagosView
        clientes={clientesRes.data ?? []}
        pagos={pagosRes.data ?? []}
        mesActual={mesActual}
      />
    </div>
  );
}
