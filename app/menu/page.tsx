import { getCategories, getAllActiveDrinks } from "@/lib/supabase/queries";
import { INITIAL_CATEGORIES, INITIAL_DRINKS } from "@/lib/mock-data";
import MenuClient from "./MenuClient";

export const revalidate = 60;

export default async function MenuPage() {
  let categories = await getCategories();
  let drinks = await getAllActiveDrinks();

  if (!categories || categories.length === 0) {
    categories = INITIAL_CATEGORIES;
  }
  if (!drinks || drinks.length === 0) {
    drinks = INITIAL_DRINKS;
  }

  return (
    <MenuClient
      initialCategories={categories}
      initialDrinks={drinks}
    />
  );
}
