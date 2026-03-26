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

  return (
    <div className="min-h-screen bg-bg">
      {/* Scrollable content — padded bottom so it clears the fixed nav */}
      <main className="pb-24 max-w-[480px] mx-auto px-4 pt-6">
        {children}
      </main>

      {/* Fixed bottom navigation */}
      <BottomNav />
    </div>
  );
}
