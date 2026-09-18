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

        <div className="relative w-full h-64 flex items-center justify-center mb-6">
          {drink.image_url ? (
            <div className="relative w-40 h-60 transition-transform duration-500 hover:scale-105">
              <Image
                src={drink.image_url}
                alt={drink.name}
                fill
                sizes="(max-width: 768px) 180px, 240px"
                className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
                priority
              />
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Agotado
              </span>
            )}
          </div>
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
            <span className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black text-[#39ff14] drop-shadow-[0_0_12px_rgba(57,255,20,0.5)]">
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
