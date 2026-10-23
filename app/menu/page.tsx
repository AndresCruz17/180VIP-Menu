import { getCategories, getAllActiveDrinks } from "@/lib/supabase/queries";
import { INITIAL_CATEGORIES, INITIAL_DRINKS } from "@/lib/mock-data";
import { createPublicClient } from "@/lib/supabase/public";
import MenuClient from "./MenuClient";

// Incremental Static Regeneration: entrega instantánea desde Edge
export const revalidate = 60;

export default async function MenuPage() {
  const supabase = createPublicClient();

  // Consultas en paralelo para carga ultra rápida (<1s en lugar de 3 esperas secuenciales)
  const [categoriesRes, drinksRes, bannerRes] = await Promise.allSettled([
    getCategories(),
    getAllActiveDrinks(),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "menu_banner_url")
      .maybeSingle()
  ]);

  let categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : [];
  let drinks = drinksRes.status === "fulfilled" ? drinksRes.value : [];

  if (!categories || categories.length === 0) categories = INITIAL_CATEGORIES;
  if (!drinks || drinks.length === 0) drinks = INITIAL_DRINKS;

  let bannerUrl: string | null = null;
  if (bannerRes.status === "fulfilled" && bannerRes.value?.data) {
    bannerUrl = (bannerRes.value.data as { value?: string })?.value || null;
  }

  return (
    <MenuClient
      initialCategories={categories}
      initialDrinks={drinks}
      bannerUrl={bannerUrl}
    />
  );
}
