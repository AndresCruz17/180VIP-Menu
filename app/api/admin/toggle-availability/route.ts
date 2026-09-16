import { NextResponse, type NextRequest } from 'next/server';
import { getAuthAdminUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { user, isAdmin } = await getAuthAdminUser();

  if (!user || !isAdmin) {
    return NextResponse.json(
      { error: 'No autorizado. Permisos de administrador requeridos.' },
      { status: 403 }
    );
  }

  try {
    const { id, is_available } = await request.json();

    if (!id || typeof is_available !== 'boolean') {
      return NextResponse.json(
        { error: 'Parámetros inválidos (id y is_available requeridos).' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('drinks')
      .update({ is_available })
      .eq('id', id)
      .select('id, name, is_available')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, drink: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido al actualizar disponibilidad.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
