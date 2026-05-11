import Link from "next/link";
import Image from "next/image";

const WHATSAPP = "https://wa.me/523221040208?text=Hola%2C%20quiero%20agendar%20mi%20clase%20muestra%20gratis%20en%20Ganesh%20Vallarta";
const DIRECCION = "Calle Vicente Guerrero 232, Col. Independencia · Puerto Vallarta";
const TELEFONO = "322-104-0208";

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image src="/logo-ganesh.png" alt="Ganesh Vallarta" width={36} height={36} className="rounded-full" />
          <span className="text-sm font-black tracking-widest uppercase">
            GANESH <span className="text-accent">VALLARTA</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-semibold tracking-widest uppercase text-white/70 hover:text-white transition px-4 py-2 border border-white/20 hover:border-white/40">
            INICIAR SESIÓN
          </Link>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
            className="text-xs font-black tracking-widest uppercase bg-accent hover:bg-accent-hover transition px-4 py-2">
            CLASE GRATIS
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpeg')] bg-cover bg-[center_top_20%] opacity-40" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full pt-24 pb-16">
          <div className="max-w-lg ml-auto">
            <p className="text-[10px] tracking-[0.3em] text-accent uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Centro de Entrenamiento Funcional · Puerto Vallarta
            </p>
            <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tight mb-2">
              GANESH
            </h1>
            <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tight text-accent mb-8">
              VALLARTA
            </h1>
            <p className="text-sm text-white/60 mb-1">Entrenamiento Funcional · Incluye Alberca</p>
            <p className="text-sm text-white/60 mb-8">Puerto Vallarta, Jalisco</p>
            <p className="text-sm text-white/80 leading-relaxed mb-10 max-w-sm">
              No es un gimnasio más. Es una <strong className="text-white">comunidad</strong> que entrena con propósito. <strong className="text-accent">Tu primera clase es gratis.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                className="text-xs font-black tracking-widest uppercase bg-accent hover:bg-accent-hover transition px-8 py-4 text-center">
                AGENDA TU CLASE GRATIS
              </a>
              <Link href="/login"
                className="text-xs font-semibold tracking-widest uppercase border border-white/30 hover:border-white/60 transition px-8 py-4 text-center text-white/70 hover:text-white">
                INICIAR SESIÓN — PORTAL
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-black text-accent">$700</p>
                <p className="text-[10px] tracking-widest text-white/40 uppercase mt-1">MXN / mes</p>
              </div>
              <div>
                <p className="text-3xl font-black text-accent">7</p>
                <p className="text-[10px] tracking-widest text-white/40 uppercase mt-1">Horarios al día</p>
              </div>
              <div>
                <p className="text-3xl font-black text-accent">+</p>
                <p className="text-[10px] tracking-widest text-white/40 uppercase mt-1">Alberca incluida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿POR QUÉ GANESH? */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-accent uppercase mb-4">El Box</p>
          <h2 className="text-5xl md:text-6xl font-black leading-none mb-16">
            ¿POR QUÉ<br /><span className="text-accent">GANESH?</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-0 border border-white/10">
            <div className="bg-[url('/oscar-workout.jpeg')] bg-cover bg-[center_top_30%] aspect-[4/5] md:aspect-auto" />
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h3 className="text-4xl font-black leading-tight mb-2">ENTRENAMIENTO</h3>
              <h3 className="text-4xl font-black text-accent mb-6">FUNCIONAL.</h3>
              <p className="text-xs text-white/40 tracking-widest uppercase mb-8">CrossFit en Puerto Vallarta</p>
              <ul className="space-y-4">
                {[
                  "Coaches certificados en entrenamiento funcional",
                  "Acceso a alberca incluido en tu membresía",
                  "Box profesional con equipo completo",
                  "Clases de 60 minutos para todos los niveles",
                  "Comunidad activa que te empuja a ser mejor",
                  "7 horarios al día — mañana y tarde",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBRESÍA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-accent uppercase mb-4">Membresía</p>
          <h2 className="text-5xl md:text-6xl font-black leading-none mb-16">
            ÚNETE<br /><span className="text-accent">AL BOX</span>
          </h2>
          <div className="grid md:grid-cols-1 gap-6 max-w-xl mx-auto">
            {/* Mensual */}
            <div className="border-2 border-accent p-10 relative">
              <span className="text-[10px] tracking-widest uppercase text-accent border border-accent px-2 py-0.5 mb-6 inline-block">Mensual</span>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-6xl font-black">$700</p>
                <p className="text-lg text-white/60">MXN / mes</p>
              </div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-8">Acceso ilimitado · Incluye alberca</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Clases ilimitadas — entras a las que quieras",
                  "7 horarios al día (mañana y tarde)",
                  "Acceso a alberca incluido",
                  "Coaches certificados en cada clase",
                  "Equipo profesional completo",
                  "Comunidad activa y motivante",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10 pt-6">
                <p className="text-xs text-accent font-black tracking-widest uppercase mb-3">★ Clase muestra GRATIS</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Antes de pagar la membresía, prueba una clase sin costo. Agéndala por WhatsApp y conoce el box.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-accent uppercase mb-4">Disponibilidad · Lunes a Viernes</p>
          <h2 className="text-5xl md:text-6xl font-black leading-none mb-16">
            HORARIOS<br /><span className="text-accent">DEL BOX</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Mañana */}
            <div className="border border-white/10 p-8">
              <p className="text-xs font-black tracking-widest text-accent uppercase mb-6">☀ Mañana</p>
              <div className="space-y-3">
                {["6:00 — 7:00 AM", "7:00 — 8:00 AM", "8:00 — 9:00 AM"].map((h) => (
                  <div key={h} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
            {/* Tarde */}
            <div className="border border-white/10 p-8">
              <p className="text-xs font-black tracking-widest text-accent uppercase mb-6">☾ Tarde</p>
              <div className="space-y-3">
                {["5:00 — 6:00 PM", "6:00 — 7:00 PM", "7:00 — 8:00 PM", "8:00 — 9:00 PM"].map((h) => (
                  <div key={h} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border border-white/10 p-6 text-sm text-white/50 leading-relaxed">
            <strong className="text-white/70">Cómo funciona:</strong> Con tu membresía mensual entras a las clases que quieras. Reserva tu lugar desde la app con al menos{" "}
            <strong className="text-white/70">1 hora de anticipación</strong>.{" "}
            <strong className="text-white/70">Cupos limitados por clase — primero en reservar, primero en entrar.</strong>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-accent uppercase mb-4">★ Clase muestra GRATIS</p>
          <h2 className="text-5xl md:text-7xl font-black leading-none mb-4">
            ¿LISTO PARA<br /><span className="text-accent">EMPEZAR?</span>
          </h2>
          <p className="text-sm text-white/40 mb-12">Agenda tu primera clase sin costo. Te esperamos en el box.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="text-xs font-black tracking-widest uppercase bg-accent hover:bg-accent-hover transition px-10 py-4 flex items-center justify-center gap-2">
              AGENDA TU CLASE GRATIS →
            </a>
            <Link href="/login"
              className="text-xs font-semibold tracking-widest uppercase border border-white/30 hover:border-white/60 transition px-10 py-4 text-white/70 hover:text-white">
              INICIAR SESIÓN — PORTAL
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <Image src="/logo-ganesh.png" alt="Ganesh Vallarta" width={36} height={36} className="rounded-full" />
              <p className="text-sm font-black tracking-widest">
                GANESH <span className="text-accent">VALLARTA</span>
              </p>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">Centro de Entrenamiento Funcional</p>
          </div>
          {/* Dirección */}
          <div>
            <p className="text-[10px] tracking-widest text-accent uppercase font-black mb-3">Dirección</p>
            <p className="text-xs text-white/60 leading-relaxed">{DIRECCION}</p>
          </div>
          {/* Contacto */}
          <div>
            <p className="text-[10px] tracking-widest text-accent uppercase font-black mb-3">Contacto</p>
            <p className="text-xs text-white/60 mb-1">Tel: <a href={`tel:${TELEFONO}`} className="text-white hover:text-accent transition">{TELEFONO}</a></p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-xs text-white hover:text-accent transition">WhatsApp →</a>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-6 text-center">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Ganesh Vallarta · Puerto Vallarta, Jalisco</p>
        </div>
      </footer>

    </div>
  );
}
