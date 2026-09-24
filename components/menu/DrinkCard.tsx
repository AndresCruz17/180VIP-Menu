"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Drink } from "@/lib/supabase/queries";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";

interface DrinkCardProps {
  drink: Drink;
  onClick: () => void;
}

export default function DrinkCard({ drink, onClick }: DrinkCardProps) {
  const formattedPrice = drink.price
    ? `$${Number(drink.price).toLocaleString("es-CO")}`
    : "Consultar";

  const subtitle = [drink.brand, drink.volume].filter(Boolean).join(" · ");
  
  const isCocktail = 
    drink.categories?.slug === "cocteles" ||
    drink.categories?.name?.toLowerCase().includes("coctel") ||
    drink.categories?.name?.toLowerCase().includes("cóctel") ||
    drink.name.toLowerCase().includes("coctel") ||
    drink.name.toLowerCase().includes("cóctel") ||
    drink.name.toLowerCase().includes("mojito") ||
    drink.name.toLowerCase().includes("margarita") ||
    drink.name.toLowerCase().includes("piña colada") ||
    drink.name.toLowerCase().includes("gin tonic") ||
    drink.name.toLowerCase().includes("cocktail");
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Efecto de entrada con scroll (IntersectionObserver)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Solo animar una vez
        }
      },
      {
        threshold: 0.1, // Dispara cuando el 10% del card es visible
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Brillo aleatorio (efecto ambiente, solo para bebidas disponibles)
  useEffect(() => {
    if (!isVisible || !drink.is_available) return;
    
    // Aleatorio entre 5 y 15 segundos
    const randomDelay = Math.random() * 10000 + 5000;
    
    const interval = setInterval(() => {
      // 10% de probabilidad de brillar en cada ciclo
      if (Math.random() > 0.9) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
      }
    }, randomDelay);

    return () => clearInterval(interval);
  }, [isVisible, drink.is_available]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`liquid-card rounded-[1.75rem] flex flex-col cursor-pointer group relative overflow-hidden transition-all duration-300 select-none 
        ${!drink.is_available ? "opacity-65 hover:opacity-85 border-rose-500/25 shadow-none" : ""}
        ${isVisible ? "card-visible" : "card-hidden"}
        ${isPulsing && drink.is_available ? "neon-pulse" : ""}
      `}
    >
      {/* Marco de haz de neón animado (solo para botellas activas) */}
      {drink.is_available && (
        <NeonBorderBeam
          variant={drink.is_featured ? "gold" : "magenta"}
          borderWidth={1.4}
          duration={5.0 + ((typeof drink.id === 'number' ? drink.id : 1) % 4) * 0.8}
          delay={((typeof drink.id === 'number' ? drink.id : 1) % 5) * 1.2}
          direction={(typeof drink.id === 'number' ? drink.id : 1) % 2 === 0 ? "cw" : "ccw"}
          pulsing={true}
        />
      )}

      {/* Glow decorativo de fondo */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl transition-all duration-500 pointer-events-none z-0 ${
        drink.is_available
          ? "bg-[#ff1b7a]/10 group-hover:bg-[#ff1b7a]/20"
          : "bg-rose-500/5"
      }`} />

      {/* ===== ZONA DE IMAGEN - grande y protagonista ===== */}
      <div className="relative w-full h-52 flex items-center justify-center bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden rounded-t-[1.75rem]">
        {drink.image_url ? (
          isCocktail ? (
            <div className={`relative w-full h-full transition-transform duration-500 group-hover:scale-105 ${
              !drink.is_available ? "grayscale-[35%] contrast-[0.95]" : ""
            }`}>
              <Image
                src={drink.image_url}
                alt={drink.name}
                fill
                sizes="(max-width: 768px) 45vw, 220px"
                className="object-cover"
              />
              {/* Degradado y viñeta suave que conecta la foto con la tarjeta oscura */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1a] via-black/25 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className={`relative w-full h-full transition-transform duration-500 group-hover:scale-105 p-3 flex items-center justify-center ${
              !drink.is_available ? "grayscale-[35%] contrast-[0.95]" : ""
            }`}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src={drink.image_url}
                  alt={drink.name}
                  fill
                  sizes="(max-width: 768px) 45vw, 220px"
                  className="object-contain rounded-2xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-700 h-full">
            <span className="text-5xl">{isCocktail ? "🍸" : "🍾"}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Sin imagen</span>
          </div>
        )}

        {/* Badge AGOTADO con punto pulsante de atención */}
        {!drink.is_available && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/95 text-white font-black text-[10px] uppercase tracking-wider shadow-[0_0_14px_rgba(225,29,72,0.7)] border border-rose-400/40 z-20 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Agotado</span>
          </div>
        )}

        {/* Badge destacado (solo si disponible) */}
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
        <h3 className={`font-[var(--font-outfit)] text-sm font-extrabold leading-snug line-clamp-2 transition-colors ${
          drink.is_available ? "text-white group-hover:text-[#ff1b7a]" : "text-zinc-300"
        }`}>
          {drink.name}
        </h3>

        {subtitle && (
          <p className="text-[11px] text-zinc-400 line-clamp-1">{subtitle}</p>
        )}

        <div className="mt-1.5 flex items-center justify-between">
          <span className={`font-[var(--font-outfit)] text-base font-black ${
            drink.is_available
              ? "text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.35)]"
              : "text-zinc-400"
          }`}>
            {formattedPrice}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
            drink.is_available
              ? "text-zinc-500 group-hover:text-zinc-300"
              : "text-rose-400/90 font-black"
          }`}>
            {drink.is_available ? "Ver →" : "Agotado"}
          </span>
        </div>
      </div>
    </div>
  );
}
