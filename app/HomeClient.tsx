"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Martini, 
  CalendarCheck, 
  Camera, 
  Mic, 
  ArrowRight, 
  Shield 
} from "lucide-react";

export default function HomeClient() {
  return (
    <div className="flex-1 flex flex-col justify-between py-2 relative">
      {/* ===== FONDO DE PANTALLA ===== */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src="/Fondo_home.jpg"
          alt="180° VIP Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Capa oscura para que el contenido se lea bien */}
        <div className="absolute inset-0 bg-[#06050a]/70" />
        {/* Viñeta inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#06050a] via-[#06050a]/60 to-transparent" />
        {/* Viñeta superior */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#06050a]/80 to-transparent" />
      </div>

      {/* Header con logo */}
      <header className="flex flex-col items-center justify-center pt-2 pb-6 text-center">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 drop-shadow-[0_0_30px_rgba(255,27,122,0.55)] transition-transform duration-500 hover:scale-105">
          <Image
            src="/logo.png"
            alt="180° VIP Logo"
            fill
            sizes="160px"
            priority
            className="object-contain"
          />
        </div>
        <p className="mt-2 text-[11px] tracking-[0.28em] font-extrabold text-zinc-300 uppercase drop-shadow-md">
          NIGHTCLUB EXPERIENCE
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3.5 my-auto">
        {/* Menu Digital — tarjeta tall izquierda */}
        <Link
          href="/menu"
          className="row-span-2 liquid-card rounded-[2rem] p-5 flex flex-col justify-between group transition-all duration-300 hover:border-[#ff1b7a]/60 bg-black/40 backdrop-blur-md"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#ff1b7a]/15 border border-[#ff1b7a]/40 text-[#ff1b7a] shadow-[0_0_20px_rgba(255,27,122,0.35)] mb-5 group-hover:scale-110 transition-transform">
              <Martini className="w-6 h-6" />
            </div>

            <h2 className="font-[var(--font-outfit)] text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-tight">
              Menu<br />Digital
            </h2>
            <p className="text-xs text-zinc-300 mt-2 mb-4 leading-relaxed">
              Licores, botellas y cocteleria.
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.08] border border-white/15 text-zinc-200 font-medium">
                Aguardientes
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.08] border border-white/15 text-zinc-200 font-medium">
                Cervezas
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.08] border border-white/15 text-zinc-200 font-medium">
                Cocteles
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.08] border border-white/15 text-zinc-200 font-medium">
                Botellas
              </span>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <div className="w-11 h-11 rounded-full glow-magenta-btn flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Reservas */}
        <Link
          href="/reservas"
          className="liquid-card rounded-[2rem] p-5 flex flex-col justify-between group transition-all duration-300 hover:border-indigo-500/60 bg-black/40 backdrop-blur-md"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>

          <div className="mt-4">
            <h2 className="font-[var(--font-outfit)] text-base font-extrabold tracking-wide text-white uppercase">
              Reservas
            </h2>
            <p className="text-xs text-zinc-300 mt-1">
              Mesas y palcos VIP.
            </p>
          </div>
        </Link>

        {/* Comunidad */}
        <Link
          href="/comunidad"
          className="liquid-card rounded-[2rem] p-5 flex flex-col justify-between group transition-all duration-300 hover:border-pink-500/60 bg-black/40 backdrop-blur-md"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-yellow-500/20 via-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>

          <div className="mt-4">
            <h2 className="font-[var(--font-outfit)] text-base font-extrabold tracking-wide text-white uppercase">
              Comunidad
            </h2>
            <p className="text-xs text-zinc-300 mt-1">
              Galeria y fotos de fiesta.
            </p>
          </div>
        </Link>

        {/* Fechas Especiales — full width bottom */}
        <Link
          href="/eventos"
          className="col-span-2 liquid-card rounded-[2rem] p-5 flex items-center justify-between group transition-all duration-300 hover:border-cyan-400/60 border-cyan-500/30 bg-black/40 backdrop-blur-md"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border border-cyan-400/40 text-cyan-300 bg-cyan-950/50 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Cartelera
            </div>

            <h2 className="font-[var(--font-outfit)] text-lg sm:text-xl font-black tracking-wide text-cyan-400 drop-shadow-[0_0_12px_rgba(0,229,255,0.4)] uppercase">
              Fechas Especiales
            </h2>
            <p className="text-xs text-zinc-300 mt-0.5">
              Artistas invitados y DJs en vivo.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl glow-cyan-btn flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform ml-3 shrink-0">
            <Mic className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Admin access */}
      <footer className="pt-6 pb-2 flex justify-center items-center">
        <Link
          href="/admin/login"
          aria-label="Panel Administrador"
          className="text-zinc-600 hover:text-zinc-400 p-2.5 rounded-full transition-colors hover:bg-white/5"
        >
          <Shield className="w-4 h-4 opacity-50 hover:opacity-100" />
        </Link>
      </footer>
    </div>
  );
}