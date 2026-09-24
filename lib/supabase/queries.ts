import { createPublicClient } from "./public";

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
    const supabase = createPublicClient();
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
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("drinks")
      .select("id, name, slug, category_id, price, brand, volume, description, image_url, is_available, is_featured, created_at, categories(id, name, slug)")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data as unknown as Drink[]) || [];
  } catch {
    return [];
  }
}

export async function getDrinkBySlug(slug: string): Promise<Drink | null> {
  try {
    const supabase = createPublicClient();
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

export interface CommunityPhoto {
  id: string;
  caption: string;
  image_url: string;
  likes: number;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export const DEFAULT_COMMUNITY_PHOTOS: CommunityPhoto[] = [
  {
    id: "p1",
    image_url: "/comunidad/Ambiente_cantante.webp",
    caption: "Show en vivo y energía total en tarima 🎤🔥",
    likes: 248,
    is_active: true,
    display_order: 1,
  },
  {
    id: "p2",
    image_url: "/comunidad/Cantante_Grijalba.webp",
    caption: "Presentación estelar de los mejores talentos en vivo 🌟",
    likes: 195,
    is_active: true,
    display_order: 2,
  },
  {
    id: "p3",
    image_url: "/comunidad/Clientes_1.webp",
    caption: "Celebrando las mejores noches en zona VIP 🥂✨",
    likes: 312,
    is_active: true,
    display_order: 3,
  },
  {
    id: "p4",
    image_url: "/comunidad/Clientes_2.webp",
    caption: "Momentos inolvidables con la mejor compañía 🎉",
    likes: 184,
    is_active: true,
    display_order: 4,
  },
  {
    id: "p5",
    image_url: "/comunidad/Cocteles.webp",
    caption: "Coctelería de autor y mezclas exclusivas 🍸🍹",
    likes: 267,
    is_active: true,
    display_order: 5,
  },
  {
    id: "p6",
    image_url: "/comunidad/Cumpleanos.webp",
    caption: "Festejando cumpleaños por todo lo alto en 180° VIP 🎂🍾",
    likes: 389,
    is_active: true,
    display_order: 6,
  },
  {
    id: "p7",
    image_url: "/comunidad/Licor_mesa.webp",
    caption: "Servicio de botellas premium y atención personalizada 🍾👑",
    likes: 215,
    is_active: true,
    display_order: 7,
  },
  {
    id: "p8",
    image_url: "/comunidad/Personal.webp",
    caption: "Nuestro equipo VIP listo para darte la mejor noche 💎✨",
    likes: 290,
    is_active: true,
    display_order: 8,
  },
];

export async function getCommunityPhotos(): Promise<CommunityPhoto[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("community_photos")
      .select("id, caption, image_url, likes, is_active, display_order, created_at")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_COMMUNITY_PHOTOS;
    }
    return (data as CommunityPhoto[]) || DEFAULT_COMMUNITY_PHOTOS;
  } catch {
    return DEFAULT_COMMUNITY_PHOTOS;
  }
}
