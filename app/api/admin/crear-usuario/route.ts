import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password, cliente_id } = await request.json();

    if (!email || !password || !cliente_id) {
      return NextResponse.json(
        { error: "Se requieren email, password y cliente_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Create auth user
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const newUserId = data.user?.id;
    if (!newUserId) {
      return NextResponse.json(
        { error: "No se pudo obtener el ID del usuario creado" },
        { status: 500 }
      );
    }

    // Link auth user to cliente record
    const { error: updateError } = await supabase
      .from("clientes")
      .update({ auth_user_id: newUserId })
      .eq("id", cliente_id);

    if (updateError) {
      // Rollback: delete auth user since we couldn't link it
      await supabase.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Ensure profile has role='cliente' (trigger should handle this but be explicit)
    await supabase
      .from("profiles")
      .update({ role: "cliente" })
      .eq("id", newUserId);

    return NextResponse.json({ success: true, user_id: newUserId });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
