import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 30 días de persistencia en cookies de servidor
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              // Si options.maxAge === 0 significa que se está cerrando sesión / borrando la cookie
              maxAge: options?.maxAge === 0 ? 0 : (options?.maxAge ?? COOKIE_MAX_AGE),
            })
          );
        } catch {
          // El método setAll puede ser llamado desde un Server Component.
        }
      },
    },
  });
}
