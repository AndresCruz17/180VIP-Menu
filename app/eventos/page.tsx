import { createPublicClient } from "@/lib/supabase/public";
import EventosClient from "./EventosClient";
import type { EventItem } from "@/components/events/EventDetailModal";

// Incremental Static Regeneration: entrega instantánea desde caché Edge
export const revalidate = 60;

export default async function EventosPage() {
  let events: EventItem[] = [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select("id, title, tag, event_date, time, artist, description, image_url")
      .eq("is_active", true)
      .order("event_date", { ascending: true });

    if (!error && data) {
      events = data as EventItem[];
    }
  } catch {
    // Si la base de datos está pausada o en mantenimiento, no bloquea al cliente
    events = [];
  }

  return <EventosClient initialEvents={events} />;
}
