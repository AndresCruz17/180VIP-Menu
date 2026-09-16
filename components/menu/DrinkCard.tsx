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

  const subtitle = [drink.brand, drink.volume].filter(Boolean).join(" ");

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
      className={`liquid-card rounded-[1.75rem] p-4 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-all duration-300 select-none ${
        !drink.is_available ? "opacity-60" : ""
      }`}
    >
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#ff1b7a]/10 rounded-full blur-2xl group-hover:bg-[#ff1b7a]/25 transition-all duration-500 pointer-events-none" />

      <div className="relative w-full h-36 flex items-center justify-center mb-3">
        {drink.image_url ? (
          <div className="relative w-24 h-32 transition-transform duration-300 group-hover:scale-110">
            <Image
              src={drink.image_url}
              alt={drink.name}
              fill
              sizes="120px"
              className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            />
          </div>
        ) : (
          <div className="w-20 h-28 rounded-xl bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center text-2xl">
            🍾
          </div>
        )}

        {!drink.is_available && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/90 text-white tracking-wider">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <h3 className="font-[var(--font-outfit)] text-sm sm:text-base font-extrabold text-white tracking-wide leading-snug line-clamp-2 group-hover:text-[#ff1b7a] transition-colors">
          {drink.name}
        </h3>

        {subtitle && (
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
            {subtitle}
          </p>
        )}

        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="font-[var(--font-outfit)] text-sm sm:text-base font-black text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
            {formattedPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
