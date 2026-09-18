import { createBrowserClient } from '@supabase/ssr';

// 30 días de persistencia para dispositivos autorizados (Barra / Administración)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    },
  });
}
