import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let publicClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Cliente público de Supabase optimizado para Next.js con fail-fast timeout (3.5s).
 * Si la base de datos está pausada o en mantenimiento, nunca bloquea la página
 * durante 60-120 segundos, permitiendo responder de inmediato con la memoria en caché.
 */
export function createPublicClient() {
  if (publicClient) return publicClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  publicClient = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (url, options) => {
        // Timeout de 3.5 segundos para no dejar congelada la navegación móvil
        return fetch(url, {
          ...options,
          signal: options?.signal || AbortSignal.timeout(3500),
        });
      },
    },
  });

  return publicClient;
}
