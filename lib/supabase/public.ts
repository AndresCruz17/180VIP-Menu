import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let publicClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Cliente publico de Supabase libre de cookies y sesiones de navegacion.
 * Permite a Next.js aplicar generacion estatica (SSG) e Incremental Static
 * Regeneration (ISR) para servir paginas del menu y eventos en 10-30ms.
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
  });

  return publicClient;
}
