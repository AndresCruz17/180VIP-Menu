import { getCategories, getAllActiveDrinks } from "@/lib/supabase/queries";
import { INITIAL_CATEGORIES, INITIAL_DRINKS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import MenuClient from "./MenuClient";

export const revalidate = 60;

export default async function MenuPage() {
  const supabase = await createClient();

  let categories = await getCategories();
  let drinks = await getAllActiveDrinks();

  if (!categories || categories.length === 0) categories = INITIAL_CATEGORIES;
  if (!drinks || drinks.length === 0) drinks = INITIAL_DRINKS;

  // Leer banner del menu desde site_settings
  const { data: bannerSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "menu_banner_url")
    .single();

  const bannerUrl = bannerSetting?.value || null;

  return (
    <MenuClient
      initialCategories={categories}
      initialDrinks={drinks}
      bannerUrl={bannerUrl}
    />
  );
}