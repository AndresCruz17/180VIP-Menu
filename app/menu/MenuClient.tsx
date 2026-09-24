"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AmbientParticles from "@/components/ui/AmbientParticles";
import { ChevronLeft, Search, X, Sparkles, WifiOff, ShieldAlert } from "lucide-react";
import DrinkCard from "@/components/menu/DrinkCard";
import DrinkDetailModal from "@/components/menu/DrinkDetailModal";
import { getAllActiveDrinks, type Category, type Drink } from "@/lib/supabase/queries";
import { createPublicClient } from "@/lib/supabase/public";

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
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDrink, setActiveDrink] = useState<Drink | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Sincronización en tiempo real (Supabase Realtime) y actualización silenciosa
  useEffect(() => {
    const supabase = createPublicClient();

    // 1. Canal Realtime vía WebSocket para cambios instantáneos (0 segundos de espera)
    const channel = supabase
      .channel("menu-realtime-drinks")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drinks" },
        (payload) => {
          const updated = payload.new as Partial<Drink>;
          setDrinks((prev) =>
            prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "drinks" },
        async () => {
          const latest = await getAllActiveDrinks();
          if (latest && latest.length > 0) setDrinks(latest);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "drinks" },
        (payload) => {
          setDrinks((prev) => prev.filter((d) => d.id !== payload.old.id));
        }
      )
      .subscribe();

    // 2. Refresco inmediato al volver a la pantalla / desbloquear el móvil
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        getAllActiveDrinks().then((latest) => {
          if (latest && latest.length > 0) setDrinks(latest);
        });
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    // 3. Polling de respaldo cada 12 segundos
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        getAllActiveDrinks().then((latest) => {
          if (latest && latest.length > 0) setDrinks(latest);
        });
      }
    }, 12000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      clearInterval(pollInterval);
    };
  }, []);


  // Stale-While-Revalidate: guarda copia local en el dispositivo del cliente
  useEffect(() => {
    try {
      if (initialDrinks && initialDrinks.length > 0) {
        localStorage.setItem(
          "180vip_menu_cache",
          JSON.stringify({
            drinks: initialDrinks,
            categories: initialCategories,
            bannerUrl,
            savedAt: Date.now(),
          })
        );
      }
    } catch {
      // Ignorar modo privado estricto
    }

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const onOnline = () => setIsOffline(false);
      const onOffline = () => setIsOffline(true);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      return () => {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }
  }, [initialDrinks, initialCategories, bannerUrl]);

  // Si por caida total de red en SSR no hay datos, recuperar de memoria local
  useEffect(() => {
    if ((!initialDrinks || initialDrinks.length === 0) && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("180vip_menu_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.drinks?.length > 0) setDrinks(parsed.drinks);
          if (parsed.categories?.length > 0) setCategories(parsed.categories);
        }
      } catch {}
    }
  }, [initialDrinks]);

  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) => {
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
  }, [drinks, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden w-full">
      <AmbientParticles />

      {/* ===== HEADER COMPLETO DE BORDE A BORDE ===== */}
      <header className={`sticky top-0 z-30 w-full border-b border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.35)] ${
        bannerUrl ? "bg-[#06050a]/35 backdrop-blur-md" : "bg-[#06050a]/90 backdrop-blur-xl"
      }`}>
        {bannerUrl && (
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Image
              src={bannerUrl}
              alt="Menú 180° VIP"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-center opacity-85 scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06050a]/25 via-[#06050a]/45 to-[#06050a]/75" />
          </div>
        )}

        <div className="max-w-md sm:max-w-xl mx-auto w-full px-4 pt-3 pb-2.5">
          {/* Fila 1: Botón Volver + Título de la Carta + Badge VIP */}
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
                180° VIP • NIGHTCLUB
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

          {/* Fila 2: Buscador fluido */}
          <div className="relative flex items-center liquid-card rounded-2xl px-3.5 py-2.5 border border-white/20 bg-black/45 backdrop-blur-md focus-within:border-[#ff1b7a]/80 focus-within:bg-black/60 focus-within:shadow-[0_0_20px_rgba(255,27,122,0.3)] transition-all">
            <Search className="w-4 h-4 text-[#ff1b7a] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar licores, cócteles, botellas..."
              className="bg-transparent border-none text-white text-sm placeholder:text-zinc-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
                className="text-zinc-400 hover:text-white ml-2 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Fila 3: Filtros por Categoría */}
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

            {categories.map((cat) => {
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

        {/* Resplandor neón inferior */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ff1b7a]/40 to-transparent" />

        {/* Notificación de Modo Offline */}
        {isOffline && (
          <div className="bg-amber-500/15 border-t border-amber-500/30 px-4 py-1.5 text-center text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1.5 backdrop-blur-md">
            <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Sin señal de internet — Mostrando carta guardada en este dispositivo</span>
          </div>
        )}
      </header>

      {/* ===== GRID DE BEBIDAS ===== */}
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
            <p className="text-3xl mb-2">🍸</p>
            <h3 className="font-[var(--font-outfit)] text-lg font-bold text-white mb-1">
              No encontramos resultados
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
              Intenta buscar con otro término o selecciona otra categoría.
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

      {/* Footer Legal & Consumo Responsable */}
      <footer className="mt-14 pb-12 text-center border-t border-white/5 pt-8 px-4 relative z-10 max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-300">
            Consumo Responsable
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-400 font-medium">
          El exceso de alcohol es perjudicial para la salud. Ley 30 de 1986.
          <br />
          Prohíbase el expendio de bebidas embriagantes a menores de edad. Ley 124 de 1994.
        </p>
        <p className="text-[10px] text-zinc-600 mt-4 tracking-widest uppercase font-bold">
          180° VIP · Nightclub Experience
        </p>
      </footer>

      <DrinkDetailModal
        drink={activeDrink}
        onClose={() => setActiveDrink(null)}
      />
    </div>
  );
}
