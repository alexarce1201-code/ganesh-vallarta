"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    const role = data.user.app_metadata?.role;

    router.refresh();

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/cliente");
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <Image src="/logo-ganesh.png" alt="Ganesh Vallarta" width={120} height={120} className="rounded-full" priority />
          </div>
          <h1 className="font-display font-black text-3xl tracking-tight text-text mb-1">
            Ganesh <span className="text-accent">Vallarta</span>
          </h1>
          <p className="text-muted text-sm">Centro de Entrenamiento Funcional</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-display font-semibold uppercase tracking-widest text-muted mb-2">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-semibold uppercase tracking-widest text-muted mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-accent text-sm text-center bg-accent/10 border border-accent/20 rounded-xl py-2 px-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-display font-bold text-sm py-3 rounded-xl disabled:opacity-60 transition-opacity mt-2"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
