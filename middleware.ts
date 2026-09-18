import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 30 días en segundos
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            maxAge: options?.maxAge === 0 ? 0 : (options?.maxAge ?? COOKIE_MAX_AGE),
          })
        );
      },
    },
  });

  // Refresca automáticamente el token de autenticación en segundo plano
  // sin interrumpir la operación del personal
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isAuthRoute;
  const hasAuthError = request.nextUrl.searchParams.has('error');

  // Si el usuario ya está autenticado en este dispositivo y va a /admin/login sin error previo,
  // redirigirlo directamente al dashboard sin volver a pedir credenciales
  if (user && isAuthRoute && !hasAuthError) {
    const redirectUrl = new URL('/admin/dashboard', request.url);
    const redirectRes = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((c) => {
      redirectRes.cookies.set(c.name, c.value, c);
    });
    return redirectRes;
  }

  // Si no está autenticado e intenta acceder a rutas protegidas de administración
  if (!user && isAdminRoute) {
    const redirectUrl = new URL('/admin/login', request.url);
    const redirectRes = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((c) => {
      redirectRes.cookies.set(c.name, c.value, c);
    });
    return redirectRes;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Intercepta todas las rutas /admin para mantener la sesión viva
     * e ignorar assets estáticos
     */
    '/admin/:path*',
  ],
};
