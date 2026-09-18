import type { MetadataRoute } from "next";
import { getAllActiveDrinks } from "@/lib/supabase/queries";
import { INITIAL_DRINKS } from "@/lib/mock-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://180vip.com";

  let drinks = [];
  try {
    drinks = await getAllActiveDrinks();
  } catch {
    drinks = INITIAL_DRINKS;
  }

  const drinkList = drinks && drinks.length > 0 ? drinks : INITIAL_DRINKS;

  const drinkUrls = drinkList.map((drink) => ({
    url: `${baseUrl}/menu/${drink.slug}`,
    lastModified: new Date(drink.created_at || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/eventos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reservas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comunidad`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...drinkUrls];
}
