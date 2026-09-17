import Image from "next/image";
import MenuBannerUpload from "@/components/admin/MenuBannerUpload";
import Link from "next/link";
import { CalendarDays, ExternalLink, FolderKanban, LogOut, Plus, Wine } from "lucide-react";
import AvailabilityToggle from "@/components/admin/AvailabilityToggle";
import DeleteDrinkButton from "@/components/admin/DeleteDrinkButton";
import { requireAdminUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

interface AdminDrinkItem {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price: number | null;
  brand: string | null;
  volume: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
}

function formatPrice(price: number | null) {
  if (price === null) return "Sin precio";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const supabase = await createClient();

  const { data: rawDrinks } = await supabase
    .from("drinks")
    .select("id, name, slug, category_id, price, brand, volume, image_url, is_available, is_featured, created_at, categories(name)")
    .order("created_at", { ascending: false });

  const { count: categoriesCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  const { count: eventsCount } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const drinks = (rawDrinks as unknown as AdminDrinkItem[]) || [];

  const { data: bannerSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "menu_banner_url")
    .single();
  const bannerUrl = bannerSetting?.value || null;
  const availableCount = drinks.filter((d) => d.is_available).length;
  const outOfStockCount = drinks.length - availableCount;

  return (
    <div className="flex flex-1 flex-col py-4 w-full max-w-lg mx-auto">

      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff1b7a] mb-0.5">
            Panel de Control
          </span>
          <h1 className="font-[var(--font-outfit)] text-2xl font-black uppercase tracking-wide text-white">
            180<span className="text-[#ff1b7a]">°</span> VIP
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            target="_blank"
            className="liquid-card inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Menu
          </Link>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="liquid-card inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 transition-colors hover:border-rose-500/50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="liquid-card rounded-2xl p-3 text-center">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Bebidas</span>
          <span className="font-[var(--font-outfit)] text-xl font-black text-white">{drinks.length}</span>
        </div>
        <div className="liquid-card rounded-2xl p-3 text-center">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Activas</span>
          <span className="font-[var(--font-outfit)] text-xl font-black text-emerald-400">{availableCount}</span>
        </div>
        <div className="liquid-card rounded-2xl p-3 text-center">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-rose-400 mb-1">Agotadas</span>
          <span className="font-[var(--font-outfit)] text-xl font-black text-rose-400">{outOfStockCount}</span>
        </div>
        <div className="liquid-card rounded-2xl p-3 text-center">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-[#00e5ff] mb-1">Categ.</span>
          <span className="font-[var(--font-outfit)] text-xl font-black text-[#00e5ff]">{categoriesCount || 0}</span>
        </div>
      </div>

      {/* Nav rapida — grid 2x2 */}
      <div className="mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Gestion rapida</h2>
        <div className="grid grid-cols-2 gap-3">

          {/* Nueva Bebida */}
          <Link
            href="/admin/productos/nuevo"
            className="liquid-card rounded-2xl p-4 flex flex-col gap-3 border border-[#ff1b7a]/25 hover:border-[#ff1b7a]/60 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff1b7a]/15 border border-[#ff1b7a]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-[#ff1b7a]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-tight">Nueva Bebida</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Agregar producto al menu</p>
            </div>
          </Link>

          {/* Categorias */}
          <Link
            href="/admin/categorias"
            className="liquid-card rounded-2xl p-4 flex flex-col gap-3 border border-[#00e5ff]/25 hover:border-[#00e5ff]/60 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="w-5 h-5 text-[#00e5ff]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-tight">Categorias</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Organizar secciones del menu</p>
            </div>
          </Link>

          {/* Eventos */}
          <Link
            href="/admin/eventos"
            className="liquid-card rounded-2xl p-4 flex flex-col gap-3 border border-cyan-500/25 hover:border-cyan-400/60 transition-all group col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-white leading-tight">Fechas Especiales</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {eventsCount ? `${eventsCount} evento${eventsCount !== 1 ? "s" : ""} activo${eventsCount !== 1 ? "s" : ""}` : "Agregar eventos y noches tematicas"}
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">Gestionar →</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Banner del Menu */}
      <div className="mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Imagen del Menu</h2>
        <MenuBannerUpload currentBannerUrl={bannerUrl} />
      </div>

      {/* Lista de bebidas */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[var(--font-outfit)] text-base font-bold text-white">Listado de Bebidas</h2>
      </div>

      <section className="liquid-card overflow-hidden rounded-3xl border border-white/10">
        {drinks.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <Wine className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
            <p className="mb-1 text-sm font-semibold text-white">No hay bebidas registradas</p>
            <p className="mb-4 text-xs text-zinc-500">Usa el boton "Nueva Bebida" para empezar.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {drinks.map((item) => {
              const categoryName =
                (Array.isArray(item.categories)
                  ? item.categories[0]?.name
                  : item.categories?.name) || "Sin categoria";

              return (
                <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors">
                  {/* Foto */}
                  {item.image_url ? (
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <Image src={item.image_url} alt={item.name} fill sizes="40px" className="object-contain p-0.5" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base">
                      🍹
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {categoryName}
                      {item.brand || item.volume ? ` · ${[item.brand, item.volume].filter(Boolean).join(" ")}` : ""}
                    </p>
                    <p className="text-[11px] font-black text-[#39ff14] mt-0.5">{formatPrice(item.price)}</p>
                  </div>

                  {/* Toggle + acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <AvailabilityToggle id={item.id} initialAvailable={item.is_available} />
                    <Link
                      href={`/admin/productos/editar/${item.id}`}
                      className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-200 transition-colors hover:border-[#ff1b7a]/50 hover:text-white"
                    >
                      Editar
                    </Link>
                    <DeleteDrinkButton id={item.id} name={item.name} imageUrl={item.image_url} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}