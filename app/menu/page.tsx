import { getCategories, getAllActiveDrinks } from "@/lib/supabase/queries";
import { INITIAL_CATEGORIES, INITIAL_DRINKS } from "@/lib/mock-data";
import { createPublicClient } from "@/lib/supabase/public";
import MenuClient from "./MenuClient";

// Incremental Static Regeneration: pre-renderiza y revalida en segundo plano cada 60s
export const revalidate = 60;

export default async function MenuPage() {
  const supabase = createPublicClient();

  let categories = await getCategories();
  let drinks = await getAllActiveDrinks();

  if (!categories || categories.length === 0) categories = INITIAL_CATEGORIES;
  if (!drinks || drinks.length === 0) drinks = INITIAL_DRINKS;

  // Leer banner del menu desde site_settings de forma publica y estatica
  const { data: bannerSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "menu_banner_url")
    .maybeSingle();

  const bannerUrl = (bannerSetting as { value?: string } | null)?.value || null;

  return (
    <MenuClient
      initialCategories={categories}
      initialDrinks={drinks}
      bannerUrl={bannerUrl}
    />
  );
}
