import { createClient } from "./server";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
}

export interface Drink {
  id: string;
  name: string;
  slug: string;
  category_id?: string | null;
  price?: number | null;
  brand?: string | null;
  volume?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  categories?: {
    id?: string;
    name: string;
    slug: string;
  } | null;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, description, created_at")
      .order("name", { ascending: true });

    if (error) return [];
    return (data as Category[]) || [];
  } catch {
    return [];
  }
}

export async function getAllActiveDrinks(): Promise<Drink[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drinks")
      .select("id, name, slug, category_id, price, brand, volume, description, image_url, is_available, is_featured, created_at, categories(id, name, slug)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data as unknown as Drink[]) || [];
  } catch {
    return [];
  }
}

export async function getDrinkBySlug(slug: string): Promise<Drink | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drinks")
      .select("id, name, slug, category_id, price, brand, volume, description, image_url, is_available, is_featured, created_at, categories(id, name, slug)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return null;
    return (data as unknown as Drink) || null;
  } catch {
    return null;
  }
}
