"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin",          label: "Dashboard",  icon: "▣" },
  { href: "/admin/clientes", label: "Clientes",   icon: "◎" },
  { href: "/admin/horarios", label: "Horarios",   icon: "◫" },
  { href: "/admin/dietas",   label: "Dietas",     icon: "◈" },
  { href: "/admin/progreso", label: "Progreso",   icon: "◆" },
  { href: "/admin/mensajes", label: "Mensajes",   icon: "◉" },
  { href: "/admin/pagos",    label: "Pagos",      icon: "◐" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-surface border-r border-[rgba(255,255,255,0.08)] fixed left-0 top-0 bottom-0 z-40">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="font-display font-black text-xl tracking-tight">
            Oscar <span className="text-accent">Salcedo</span>
          </div>
          <div className="text-xs text-muted mt-0.5 font-display uppercase tracking-widest">
            Admin
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
                isActive(item.href)
                  ? "bg-accent text-white"
                  : "text-muted hover:text-text hover:bg-surface2"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-semibold text-muted hover:text-accent hover:bg-accent/10 transition-all"
          >
            <span className="text-base">⊗</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-[rgba(255,255,255,0.08)] flex items-center justify-around px-2 py-2">
        {NAV.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              isActive(item.href) ? "text-accent" : "text-muted"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-display font-bold uppercase tracking-wide">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
