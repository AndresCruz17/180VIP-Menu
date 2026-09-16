-- Agregar al SQL Editor de Supabase
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

alter table public.events enable row level security;

create policy "events_public_read"
  on public.events for select to public
  using (is_active = true
    or exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "events_admin_all"
  on public.events for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
