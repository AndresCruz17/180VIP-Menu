import { createPublicClient } from "@/lib/supabase/public";
import EventosClient from "./EventosClient";
import type { EventItem } from "@/components/events/EventDetailModal";

// Incremental Static Regeneration: entrega instantanea desde cache Edge
export const revalidate = 60;

export default async function EventosPage() {
  const supabase = createPublicClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("events")
    .select("id, title, tag, event_date, time, artist, description, image_url")
    .eq("is_active", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  const events = (data as EventItem[]) || [];

  return <EventosClient initialEvents={events} />;
}
