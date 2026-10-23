"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Drink } from "@/lib/supabase/queries";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";

interface DrinkCardProps {
  drink: Drink;
  onClick: () => void;
  viewMode?: "grid" | "featured";
}

export default function DrinkCard({ drink, onClick, viewMode = "grid" }: DrinkCardProps) {
  const isFeaturedView = viewMode === "featured";

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
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
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
    
    const randomDelay = Math.random() * 10000 + 5000;
    
    const interval = setInterval(() => {
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
      className={`liquid-card rounded-[1.75rem] flex flex-col h-full cursor-pointer group relative overflow-hidden transition-all duration-300 select-none 
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

      {/* ===== ZONA DE IMAGEN - Producto 100% visible, sin cortes y con fondo ambiental ===== */}
      <div className={`relative w-full ${isFeaturedView ? "h-72 sm:h-84" : "h-60 sm:h-64"} bg-[#0b0814] overflow-hidden rounded-t-[1.75rem] shrink-0 flex items-center justify-center`}>
        {drink.image_url ? (
          <div className={`relative w-full h-full transition-transform duration-500 group-hover:scale-105 flex items-center justify-center ${
            !drink.is_available ? "grayscale-[35%] contrast-[0.95]" : ""
          }`}>
            {/* Fondo ambiental difuminado que adopta los tonos exactos del producto */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125 pointer-events-none"
              style={{ backgroundImage: `url(${drink.image_url})` }}
            />
            {/* Tinte oscuro sutil para conservar el estilo nocturno VIP */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Producto 100% completo, sin recortes, con bordes nítidos y sombra premium */}
            <div className="relative w-full h-full p-2.5 sm:p-3 flex items-center justify-center z-10">
              <Image
                src={drink.image_url}
                alt={drink.name}
                fill
                sizes={isFeaturedView ? "(max-width: 768px) 95vw, 550px" : "(max-width: 768px) 50vw, 260px"}
                className="object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.75)]"
              />
            </div>

            {/* Sutil viñeta inferior que conecta con la base de la tarjeta sin tapar la etiqueta */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0f0c1a] to-transparent pointer-events-none z-10" />
          </div>
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
      </div>

      {/* ===== ZONA DE INFO - alineación perfecta y simétrica ===== */}
      <div className={`${isFeaturedView ? "p-4" : "p-3.5"} flex-1 flex flex-col justify-between relative z-10`}>
        <div>
          <h3 className={`font-[var(--font-outfit)] ${isFeaturedView ? "text-base sm:text-lg" : "text-sm"} font-extrabold leading-snug line-clamp-2 min-h-[2.5rem] transition-colors ${
            drink.is_available ? "text-white group-hover:text-[#ff1b7a]" : "text-zinc-300"
          }`}>
            {drink.name}
          </h3>

          <p className="text-[11px] text-zinc-400 line-clamp-1 min-h-[1.1rem] mt-0.5">
            {subtitle || "\u00A0"}
          </p>

          {isFeaturedView && drink.description && (
            <p className="text-xs text-zinc-300/80 line-clamp-2 mt-2 leading-relaxed">
              {drink.description}
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span className={`font-[var(--font-outfit)] ${isFeaturedView ? "text-lg sm:text-xl" : "text-base"} font-black tracking-tight ${
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
            {drink.is_available ? "Ver detalle →" : "Agotado"}
          </span>
        </div>
      </div>
    </div>
  );
}
