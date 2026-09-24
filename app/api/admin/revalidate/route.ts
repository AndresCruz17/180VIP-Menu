import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuthAdminUser } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  const { user, isAdmin } = await getAuthAdminUser();

  if (!user || !isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { path = '/menu' } = await request.json();
    revalidatePath(path);
    revalidatePath('/menu');
    revalidatePath('/');
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al revalidar.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
