"use client";

import Image from "next/image";
import type { Drink } from "@/lib/supabase/queries";

interface DrinkCardProps {
  drink: Drink;
  onClick: () => void;
}

export default function DrinkCard({ drink, onClick }: DrinkCardProps) {
  const formattedPrice = drink.price
    ? `$${Number(drink.price).toLocaleString("es-CO")}`
    : "Consultar";

  const subtitle = [drink.brand, drink.volume].filter(Boolean).join(" · ");

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`liquid-card rounded-[1.75rem] flex flex-col cursor-pointer group relative overflow-hidden transition-all duration-300 select-none ${
        !drink.is_available ? "opacity-60" : ""
      }`}
    >
      {/* Glow decorativo */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff1b7a]/10 rounded-full blur-2xl group-hover:bg-[#ff1b7a]/20 transition-all duration-500 pointer-events-none z-0" />

      {/* ===== ZONA DE IMAGEN — grande y protagonista ===== */}
      <div className="relative w-full h-52 flex items-center justify-center bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden rounded-t-[1.75rem]">
        {drink.image_url ? (
          <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
            <Image
              src={drink.image_url}
              alt={drink.name}
              fill
              sizes="(max-width: 768px) 45vw, 220px"
              className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] p-4"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-700 h-full">
            <span className="text-5xl">🍹</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Sin imagen</span>
          </div>
        )}

        {/* Badge agotado */}
        {!drink.is_available && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/90 text-white tracking-wider shadow-lg z-10">
            Agotado
          </span>
        )}

        {/* Badge destacado */}
        {drink.is_featured && drink.is_available && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#ff1b7a]/90 text-white tracking-wider shadow-lg z-10">
            ⭐ Top
          </span>
        )}

        {/* Degradado inferior que conecta con la info */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0f0c1a] to-transparent pointer-events-none" />
      </div>

      {/* ===== ZONA DE INFO ===== */}
      <div className="px-4 pb-4 pt-2 flex flex-col gap-1 relative z-10">
        <h3 className="font-[var(--font-outfit)] text-sm font-extrabold text-white leading-snug line-clamp-2 group-hover:text-[#ff1b7a] transition-colors">
          {drink.name}
        </h3>

        {subtitle && (
          <p className="text-[11px] text-zinc-400 line-clamp-1">{subtitle}</p>
        )}

        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-[var(--font-outfit)] text-base font-black text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.35)]">
            {formattedPrice}
          </span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
            Ver →
          </span>
        </div>
      </div>
    </div>
  );
}