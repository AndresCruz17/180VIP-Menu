export const revalidate = 60;

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { getDrinkBySlug, getAllActiveDrinks } from "@/lib/supabase/queries";
import { INITIAL_DRINKS } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const drinks = await getAllActiveDrinks();
    const list = drinks && drinks.length > 0 ? drinks : INITIAL_DRINKS;
    return list.map((drink) => ({
      slug: drink.slug,
    }));
  } catch {
    return INITIAL_DRINKS.map((drink) => ({
      slug: drink.slug,
    }));
  }
}

export default async function DrinkDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let drink = await getDrinkBySlug(slug);

  if (!drink) {
    drink = INITIAL_DRINKS.find((d) => d.slug === slug) || null;
  }

  if (!drink) {
    notFound();
  }

  const formattedPrice = drink.price
    ? `$${Number(drink.price).toLocaleString("es-CO")}`
    : "Consultar";

  const brandVolume = [drink.brand, drink.volume].filter(Boolean).join(" | ");

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
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-6 pt-3 pb-8">
      <div className="flex items-center justify-between pt-2 pb-6">
        <Link
          href="/menu"
          aria-label="Volver al menú"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#ff1b7a]/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
          Carta de Licores
        </span>
        <div className="w-11" />
      </div>

      <div className="relative liquid-card rounded-[2.5rem] p-6 sm:p-8 overflow-hidden my-auto border border-white/10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full flex items-center justify-center mb-6">
          {drink.image_url ? (
            <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden border border-white/10 bg-[#161224] shadow-2xl flex items-center justify-center p-4">
              {/* Fondo ambiental difuminado con la propia imagen del licor */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-35 blur-2xl scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${drink.image_url})` }}
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* Imagen 100% COMPLETA sin recortes */}
              <div className="relative w-full h-full flex items-center justify-center z-10">
                <Image
                  src={drink.image_url}
                  alt={drink.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-contain rounded-2xl drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="w-32 h-48 rounded-2xl bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center text-4xl">
              🍸
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h1 className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black text-white uppercase tracking-wider leading-tight">
            {drink.name}
          </h1>

          {brandVolume && (
            <p className="text-xs sm:text-sm font-bold tracking-widest text-[#00e5ff] uppercase mt-1.5">
              {brandVolume}
            </p>
          )}

          <div className="mt-3 flex justify-center">
            {drink.is_available ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-500/15 border border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Agotado por hoy
              </span>
            )}
          </div>

          {!drink.is_available && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-left max-w-sm mx-auto">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-300">Producto agotado por esta noche</p>
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed font-light">
                  Este licor o cóctel no se encuentra disponible temporalmente. Puedes consultar con el personal en barra por opciones similares.
                </p>
              </div>
            </div>
          )}
        </div>

        {drink.description && (
          <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <h2 className="text-[11px] font-black tracking-widest text-zinc-400 uppercase mb-1">
              Sobre este licor
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
              {drink.description}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block">
              Precio Oficial
            </span>
            <span className={`font-[var(--font-outfit)] text-2xl sm:text-3xl font-black ${
              drink.is_available
                ? "text-[#39ff14] drop-shadow-[0_0_12px_rgba(57,255,20,0.5)]"
                : "text-zinc-400"
            }`}>
              {formattedPrice}
            </span>
          </div>

          <Link
            href="/menu"
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
          >
            Ver más opciones
          </Link>
        </div>
      </div>
    </div>
  );
}
