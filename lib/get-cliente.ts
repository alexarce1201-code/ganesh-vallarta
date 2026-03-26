import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getClienteOrRedirect() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!cliente) redirect("/login");

  return { cliente, supabase, user };
}
