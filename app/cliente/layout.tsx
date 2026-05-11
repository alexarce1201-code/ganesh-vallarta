import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/cliente/BottomNav";

export const dynamic = "force-dynamic";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = user.app_metadata?.role;
  if (role !== "cliente") redirect("/login");

  // Lookup cliente para saber si tiene coaching personalizado
  const { data: cliente } = await supabase
    .from("clientes")
    .select("coaching_extra")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-24 max-w-[480px] mx-auto px-4 pt-6">
        {children}
      </main>
      <BottomNav coachingExtra={cliente?.coaching_extra ?? false} />
    </div>
  );
}
