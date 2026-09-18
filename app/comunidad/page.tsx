import { getCommunityPhotos } from "@/lib/supabase/queries";
import ComunidadClient from "./ComunidadClient";

// Incremental Static Regeneration: entrega instantanea desde cache Edge y revalida cada 60s
export const revalidate = 60;

export default async function ComunidadPage() {
  const photos = await getCommunityPhotos();

  return <ComunidadClient initialPhotos={photos} />;
}
