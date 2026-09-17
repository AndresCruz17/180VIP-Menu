-- Tabla de configuracion del sitio
create table if not exists public.site_settings (
  key   text primary key,
  value text
);

alter table public.site_settings enable row level security;

create policy "site_settings_public_read"
  on public.site_settings for select to public
  using (true);

create policy "site_settings_admin_write"
  on public.site_settings for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Valor inicial del banner (vacio = sin imagen)
insert into public.site_settings (key, value) 
values ('menu_banner_url', null)
on conflict (key) do nothing;