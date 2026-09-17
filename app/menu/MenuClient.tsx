"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Search, X } from "lucide-react";
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
    <div className="flex-1 flex flex-col pb-8">

      {/* ===== STICKY NAVBAR CON IMAGEN DE FONDO ===== */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-3 pt-2 overflow-hidden">

        {/* Imagen de fondo del navbar */}
        {bannerUrl ? (
          <>
            <div className="absolute inset-0 -z-10">
              <Image
                src={bannerUrl}
                alt="Menu 180° VIP"
                fill
                priority
                sizes="500px"
                className="object-cover object-center"
              />
              {/* Overlay oscuro para que los elementos se lean bien */}
              <div className="absolute inset-0 bg-[#06050a]/75 backdrop-blur-[2px]" />
              {/* Borde luminoso abajo */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff1b7a]/50 to-transparent" />
            </div>
            {/* Tag "Carta Exclusiva" solo cuando hay imagen */}
            <p className="text-[10px] font-extrabold tracking-[0.25em] text-[#ff1b7a] uppercase mb-2">
              Carta Exclusiva · 180° VIP
            </p>
          </>
        ) : (
          /* Sin imagen: fondo sólido normal */
          <div className="absolute inset-0 -z-10 bg-[#06050a]/90 backdrop-blur-md" />
        )}

        {/* Barra de busqueda + boton volver */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white shrink-0 hover:border-[#ff1b7a]/40 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>

          <div className="flex-1 relative flex items-center liquid-card rounded-2xl px-4 py-2.5 border border-white/10 focus-within:border-[#ff1b7a]/60 transition-colors">
            <Search className="w-5 h-5 text-[#ff1b7a] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar licores, cocteles..."
              className="bg-transparent border-none text-white text-sm placeholder:text-zinc-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar busqueda"
                className="text-zinc-400 hover:text-white ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros por categoria */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
          <button
            onClick={() => setSelectedCategory("todos")}
            className={`category-pill ${
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
                className={`category-pill ${
                  isActive ? "category-pill-active" : "category-pill-inactive"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de bebidas */}
      <div className="mt-4">
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
      </div>

      <DrinkDetailModal
        drink={activeDrink}
        onClose={() => setActiveDrink(null)}
      />
    </div>
  );
}