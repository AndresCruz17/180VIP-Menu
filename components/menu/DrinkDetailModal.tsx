"use client";

import Image from "next/image";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import type { Drink } from "@/lib/supabase/queries";

interface DrinkDetailModalProps {
  drink: Drink | null;
  onClose: () => void;
}

export default function DrinkDetailModal({
  drink,
  onClose,
}: DrinkDetailModalProps) {
  if (!drink) return null;

  const formattedPrice = drink.price
    ? `$${Number(drink.price).toLocaleString("es-CO")}`
    : "Consultar";

  const brandVolume = [drink.brand, drink.volume].filter(Boolean).join(" · ");

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-[2.5rem] bg-[#0f0d18] border border-white/10 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative w-full flex items-center justify-center mb-5">
          {drink.image_url ? (
            <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden border border-white/10 bg-[#161224] shadow-2xl flex items-center justify-center p-3">
              {/* Fondo ambiental difuminado con los colores de la imagen */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-35 blur-2xl scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${drink.image_url})` }}
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* Imagen 100% COMPLETA sin recortes, con bordes redondeados y sombra */}
              <div className={`relative w-full h-full flex items-center justify-center z-10 ${
                !drink.is_available ? "grayscale-[30%] contrast-[0.95]" : ""
              }`}>
                <Image
                  src={drink.image_url}
                  alt={drink.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-contain rounded-2xl drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Badge superior si está agotado */}
              {!drink.is_available && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/95 text-white font-black text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.8)] border border-rose-400/40 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Agotado</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-28 h-44 rounded-2xl bg-gradient-to-b from-amber-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center text-zinc-400">
              <span className="text-3xl">{isCocktail ? "🍸" : "🍾"}</span>
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <h3 className="font-[var(--font-outfit)] text-xl sm:text-2xl font-black text-white uppercase tracking-wider leading-tight">
            {drink.name}
          </h3>

          {brandVolume && (
            <p className="text-xs font-bold tracking-widest text-[#00e5ff] uppercase mt-1">
              {brandVolume}
            </p>
          )}

          <div className="mt-2.5 flex justify-center">
            {drink.is_available ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-rose-500/15 border border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Agotado por hoy
              </span>
            )}
          </div>

          {/* Mensaje informativo para clientes cuando se agota */}
          {!drink.is_available && (
            <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-300">Producto agotado por esta noche</p>
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed font-light">
                  Este licor o cóctel no se encuentra disponible temporalmente. Puedes consultar con el bartender o tu mesero por opciones de sabor y gama similar.
                </p>
              </div>
            </div>
          )}
        </div>

        {drink.description && (
          <div className="mb-5">
            <h4 className="text-[11px] font-black tracking-widest text-zinc-400 uppercase mb-1.5">
              Sobre este licor
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed font-light">
              {drink.description}
            </p>
          </div>
        )}

        {/* Zona inferior de precio y estado */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block">
              Precio
            </span>
            <span className={`font-[var(--font-outfit)] text-2xl font-black ${
              drink.is_available
                ? "text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                : "text-zinc-400"
            }`}>
              {formattedPrice}
            </span>
          </div>

          {drink.is_available ? (
            <span className="text-[11px] text-zinc-400 font-medium">
              IVA Incluido
            </span>
          ) : (
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
              No Disponible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
