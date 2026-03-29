import Link from "next/link";

const WHATSAPP = "https://wa.me/523221040208?text=Hola%20Óscar%2C%20me%20interesa%20tomar%20clases%20contigo";

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/5">
        <span className="text-sm font-black tracking-widest uppercase">
          ÓSCAR <span className="text-red-600">SALCEDO</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-semibold tracking-widest uppercase text-white/70 hover:text-white transition px-4 py-2 border border-white/20 hover:border-white/40">
            INICIAR SESIÓN
          </Link>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
            className="text-xs font-black tracking-widest uppercase bg-red-600 hover:bg-red-700 transition px-4 py-2">
            TOMA CLASE CON ÓSCAR
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpeg')] bg-cover bg-[center_top_20%] opacity-40" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full pt-24 pb-16">
          <div className="max-w-lg ml-auto">
            <p className="text-[10px] tracking-[0.3em] text-red-500 uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Coach Personal · Puerto Vallarta
            </p>
            <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tight mb-2">
              ÓSCAR
            </h1>
            <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tight text-red-600 mb-8">
              SALCEDO
            </h1>
            <p className="text-sm text-white/60 mb-1">Coach Personal & Nutriólogo</p>
            <p className="text-sm text-white/60 mb-8">Centro de Alto Rendimiento, Vallarta</p>
            <p className="text-sm text-white/80 leading-relaxed mb-10 max-w-sm">
              No es solo entrenamiento. Es el <strong className="text-white">sistema completo</strong>: cuerpo, nutrición y disciplina. Diseñado para el hombre ocupado que quiere resultados reales <strong className="text-white">sin perder el tiempo.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                className="text-xs font-black tracking-widest uppercase bg-red-600 hover:bg-red-700 transition px-8 py-4 text-center">
                TOMA CLASE CON ÓSCAR
              </a>
              <Link href="/login"
                className="text-xs font-semibold tracking-widest uppercase border border-white/30 hover:border-white/60 transition px-8 py-4 text-center text-white/70 hover:text-white">
                INICIAR SESIÓN — PORTAL
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-black text-red-500">45 min</p>
                <p className="text-[10px] tracking-widest text-white/40 uppercase mt-1">Por sesión</p>
              </div>
              <div>
                <p className="text-3xl font-black text-red-500">3X</p>
                <p className="text-[10px] tracking-widest text-white/40 uppercase mt-1">Por semana</p>
              </div>
              <div>
                <p className="text-3xl font-black text-red-500">2 EN 1</p>
                <p className="text-[10px] tracking-widest text-white/40 uppercase mt-1">Entrena + Dieta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿POR QUÉ ÓSCAR? */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-red-500 uppercase mb-4">El Coach</p>
          <h2 className="text-5xl md:text-6xl font-black leading-none mb-16">
            ¿POR QUÉ<br /><span className="text-red-600">ÓSCAR?</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-0 border border-white/10">
            <div className="bg-[url('/oscar-workout.jpeg')] bg-cover bg-center aspect-[4/5] md:aspect-auto" />
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h3 className="text-4xl font-black leading-tight mb-2">EL ÚNICO COMBO</h3>
              <h3 className="text-4xl font-black text-red-600 mb-6">COMPLETO.</h3>
              <p className="text-xs text-white/40 tracking-widest uppercase mb-8">Coach personal + Nutriólogo en Puerto Vallarta</p>
              <ul className="space-y-4">
                {[
                  "Formación en alto rendimiento físico",
                  "Nutriólogo certificado — dieta incluida en cada plan",
                  "Entrenas en un box profesional con equipo completo",
                  "45 minutos efectivos — sin tiempo perdido",
                  "Máximo 4 personas por clase — atención real",
                  "Horarios entre semana, perfectos para el hombre ocupado",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-red-500 uppercase mb-4">Planes disponibles</p>
          <h2 className="text-5xl md:text-6xl font-black leading-none mb-16">
            ELIGE TU<br /><span className="text-red-600">PLAN</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Individual */}
            <div className="border-2 border-red-600 p-10 relative">
              <span className="text-[10px] tracking-widest uppercase text-red-500 border border-red-600 px-2 py-0.5 mb-6 inline-block">Individual</span>
              <p className="text-5xl font-black mb-1">$2,500</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-8">MXN / mes · 1 persona</p>
              <ul className="space-y-3">
                {[
                  "3 sesiones por semana de 45 minutos",
                  "Atención 100% exclusiva en cada clase",
                  "Plan de entrenamiento personalizado",
                  "Plan de nutrición según tus objetivos",
                  "Seguimiento semanal de progreso",
                  "Cambio de horario con 24h de aviso",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Grupal */}
            <div className="border border-white/10 p-10">
              <span className="text-[10px] tracking-widest uppercase text-white/40 border border-white/20 px-2 py-0.5 mb-6 inline-block">Grupal</span>
              <p className="text-5xl font-black mb-1">$1,200</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-8">MXN / mes · por persona (máx 4)</p>
              <ul className="space-y-3">
                {[
                  "3 sesiones por semana de 45 minutos",
                  "Máximo 4 personas por horario",
                  "Entrenamiento adaptado al grupo",
                  "Plan de nutrición individual incluido",
                  "Mismo horario fijo durante el mes",
                  "Cambio de horario con 24h de aviso",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-red-500 uppercase mb-4">Disponibilidad</p>
          <h2 className="text-5xl md:text-6xl font-black leading-none mb-16">
            HORARIOS<br /><span className="text-red-600">DISPONIBLES</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
            {[
              { dia: "LUNES", horario: "11:30 — 17:00" },
              { dia: "MARTES", horario: "09:30 — 17:00" },
              { dia: "MIÉRCOLES", horario: "13:00 — 17:00" },
              { dia: "JUEVES", horario: "13:00 — 17:00" },
              { dia: "VIERNES", horario: "13:00 — 17:00" },
              { dia: "SÁBADO", horario: "09:00 — 15:00" },
            ].map(({ dia, horario }) => (
              <div key={dia} className="border border-white/10 p-4 text-center">
                <p className="text-xs font-black tracking-widest mb-2">{dia}</p>
                <p className="text-xs text-red-500">{horario}</p>
              </div>
            ))}
          </div>
          <div className="border border-white/10 p-6 text-sm text-white/50 leading-relaxed">
            <strong className="text-white/70">Cómo funciona:</strong> Al inscribirte eliges tus 3 horarios fijos para el mes. Los cambios se hacen con al menos{" "}
            <strong className="text-white/70">24 horas de anticipación</strong> y están sujetos a disponibilidad. Las clases no tomadas no son reembolsables.{" "}
            <strong className="text-white/70">Cupos limitados — máximo 4 personas por horario.</strong>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black leading-none mb-4">
            ¿LISTO PARA<br /><span className="text-red-600">EMPEZAR?</span>
          </h2>
          <p className="text-sm text-white/40 mb-12">Cupos limitados · Puerto Vallarta · Escríbele directamente a Óscar</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="text-xs font-black tracking-widest uppercase bg-red-600 hover:bg-red-700 transition px-10 py-4 flex items-center justify-center gap-2">
              TOMA CLASE CON ÓSCAR →
            </a>
            <Link href="/login"
              className="text-xs font-semibold tracking-widest uppercase border border-white/30 hover:border-white/60 transition px-10 py-4 text-white/70 hover:text-white">
              INICIAR SESIÓN — PORTAL
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-sm font-black tracking-widest">
          ÓSCAR <span className="text-red-600">SALCEDO</span>
        </p>
        <p className="text-xs text-white/30 mt-1">Coach Personal · Nutriólogo · Puerto Vallarta</p>
      </footer>

    </div>
  );
}
