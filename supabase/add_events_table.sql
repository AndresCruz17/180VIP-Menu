-- ==============================================================================
-- 180 VIP - TABLA DE EVENTOS Y POLÍTICAS RLS
-- Copia y ejecuta este script completo en:
-- Supabase Dashboard -> SQL Editor (Proyecto 180 VIP) -> Run
-- ==============================================================================

-- 1. Crear tabla de eventos
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  tag         text not null default 'EVENTO ESPECIAL',
  event_date  date not null,
  time        text not null default '10:00 PM',
  artist      text,
  description text,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2. Habilitar Seguridad por Filas (RLS)
alter table public.events enable row level security;

-- 3. Índices de alto rendimiento (Supabase Postgres Best Practices)
create index if not exists events_event_date_idx on public.events (event_date);
create index if not exists events_is_active_idx on public.events (is_active);

-- 4. Políticas RLS
-- Lectura pública: Visitantes ven eventos activos, administradores ven todos
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
  on public.events for select to public
  using (
    is_active = true
    or exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

-- Escritura admin: Solo administradores autenticados pueden crear, editar o borrar
drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all"
  on public.events for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- 5. Evento de prueba inicial (se muestra en las próximas fechas)
insert into public.events (title, tag, event_date, time, artist, description, is_active)
values (
  'Noche VIP & Live DJ Set',
  'EVENTO ESPECIAL',
  (current_date + interval '2 days')::date,
  '10:00 PM',
  'DJ Invitado Especial',
  'Vive la mejor fiesta con show de luces, pirotecnia fría, servicio de botellas y coctelería premium.',
  true
);
