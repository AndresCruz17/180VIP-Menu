import { createClient } from "@/lib/supabase/server";
import EventosClient from "./EventosClient";
import type { EventItem } from "@/components/events/EventDetailModal";

export const revalidate = 60;

export default async function EventosPage() {
  const supabase = await createClient();
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
