"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AmbientParticles from "@/components/ui/AmbientParticles";
import { ChevronLeft, Search, X, Sparkles } from "lucide-react";
import DrinkCard from "@/components/menu/DrinkCard";
import DrinkDetailModal from "@/components/menu/DrinkDetailModal";
import type { Category, Drink } from "@/lib/supabase/queries";

interface MenuClientProps {
  initialCategories: Category[];
  initialDrinks: Drink[];
  bannerUrl?: string | null;
}

export default function MenuClient({
  initialCategories,
  initialDrinks,
  bannerUrl,
}: MenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDrink, setActiveDrink] = useState<Drink | null>(null);

  const filteredDrinks = useMemo(() => {
    return initialDrinks.filter((drink) => {
      const matchesCategory =
        selectedCategory === "todos" ||
        drink.categories?.slug === selectedCategory ||
        drink.category_id === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        drink.name.toLowerCase().includes(query) ||
        (drink.brand && drink.brand.toLowerCase().includes(query)) ||
        (drink.description && drink.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [initialDrinks, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden w-full">
      <AmbientParticles />

      {/* ===== HEADER COMPLETO DE BORDE A BORDE (FULL-SCREEN WIDTH & FLUSH TO TOP) ===== */}
      <header className={`sticky top-0 z-30 w-full border-b border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.35)] ${
        bannerUrl ? "bg-[#06050a]/35 backdrop-blur-md" : "bg-[#06050a]/90 backdrop-blur-xl"
      }`}>
        {/* Banner de imagen de fondo con sombra y degradado reducidos para máxima claridad */}
        {bannerUrl && (
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Image
              src={bannerUrl}
              alt="Menu 180° VIP"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-85 scale-100"
            />
            {/* Degradado suave para asegurar lectura sin oscurecer de mas la imagen */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#06050a]/25 via-[#06050a]/45 to-[#06050a]/75" />
          </div>
        )}

        {/* Contenido centrado dentro de la barra full-width */}
        <div className="max-w-md sm:max-w-xl mx-auto w-full px-4 pt-3 pb-2.5">
          {/* Fila 1: Boton Volver + Titulo de la Carta + Badge VIP */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <Link
              href="/"
              aria-label="Volver al inicio"
              className="w-10 h-10 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white shrink-0 hover:border-[#ff1b7a]/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="text-center flex-1">
              <span className="text-[10px] font-extrabold tracking-[0.24em] text-[#ff1b7a] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ff1b7a]" />
                180° VIP · NIGHTCLUB
              </span>
              <h1 className="font-[var(--font-title)] text-2xl sm:text-3xl font-black uppercase tracking-wider text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                Carta de Licores
              </h1>
            </div>

            <div className="w-10 flex justify-end">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#ff1b7a]/15 text-[#ff1b7a] border border-[#ff1b7a]/30 shadow-[0_0_10px_rgba(255,27,122,0.2)]">
                VIP
              </span>
            </div>
          </div>

          {/* Fila 2: Caja del Buscador (Full-width fluido) */}
          <div className="relative flex items-center liquid-card rounded-2xl px-3.5 py-2.5 border border-white/20 bg-black/45 backdrop-blur-md focus-within:border-[#ff1b7a]/80 focus-within:bg-black/60 focus-within:shadow-[0_0_20px_rgba(255,27,122,0.3)] transition-all">
            <Search className="w-4 h-4 text-[#ff1b7a] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar licores, cocteles, botellas..."
              className="bg-transparent border-none text-white text-sm placeholder:text-zinc-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar busqueda"
                className="text-zinc-400 hover:text-white ml-2 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Fila 3: Filtros por Categoria (Slider horizontal de borde a borde) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1 -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory("todos")}
              className={`category-pill shrink-0 ${
                selectedCategory === "todos"
                  ? "category-pill-active"
                  : "category-pill-inactive"
              }`}
            >
              Todos
            </button>

            {initialCategories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`category-pill shrink-0 ${
                    isActive ? "category-pill-active" : "category-pill-inactive"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resplandor neón inferior de la barra de navegación */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ff1b7a]/40 to-transparent" />
      </header>

      {/* ===== CONTENEDOR DEL GRID DE BEBIDAS ===== */}
      <main className="max-w-md sm:max-w-xl mx-auto w-full px-4 pt-4 pb-12 flex-1">
        {filteredDrinks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredDrinks.map((drink) => (
              <DrinkCard
                key={drink.id}
                drink={drink}
                onClick={() => setActiveDrink(drink)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center liquid-card rounded-3xl p-8 my-4">
            <p className="text-3xl mb-2">🍹</p>
            <h3 className="font-[var(--font-outfit)] text-lg font-bold text-white mb-1">
              No encontramos resultados
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
              Intenta buscar con otro termino o selecciona otra categoria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("todos");
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </main>

      <DrinkDetailModal
        drink={activeDrink}
        onClose={() => setActiveDrink(null)}
      />
    </div>
  );
}
