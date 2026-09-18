-- ==============================================================================
-- TABLA DE FOTOS DE COMUNIDAD / GALERÍA VIP (180 VIP)
-- Copia y pega este contenido en Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Crear tabla community_photos
create table if not exists public.community_photos (
  id            uuid primary key default gen_random_uuid(),
  caption       text not null default '',
  image_url     text not null,
  likes         integer not null default 0,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- 2. Habilitar Seguridad por Filas (RLS)
alter table public.community_photos enable row level security;

-- 3. Índices para consultas rápidas y ordenadas
create index if not exists community_photos_active_order_idx 
  on public.community_photos (is_active, display_order, created_at desc);

-- 4. Políticas RLS
-- Lectura pública: visitantes ven fotos activas; administradores ven todas
drop policy if exists "community_photos_public_read" on public.community_photos;
create policy "community_photos_public_read"
  on public.community_photos for select
  to public
  using (
    is_active = true
    or auth.role() = 'authenticated'
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- Escritura: administradores autenticados tienen permisos completos (insert, update, delete)
drop policy if exists "community_photos_admin_all" on public.community_photos;
create policy "community_photos_admin_all"
  on public.community_photos for all
  to authenticated
  using (true)
  with check (true);

-- 5. Sembrar las 8 fotos actuales de la galería como datos iniciales
insert into public.community_photos (caption, image_url, likes, display_order, is_active)
values
  ('Show en vivo y energía total en tarima 🎤🔥', '/comunidad/Ambiente_cantante.webp', 248, 1, true),
  ('Presentación estelar de los mejores talentos en vivo 🌟', '/comunidad/Cantante_Grijalba.webp', 195, 2, true),
  ('Celebrando las mejores noches en zona VIP 🥂✨', '/comunidad/Clientes_1.webp', 312, 3, true),
  ('Momentos inolvidables con la mejor compañía 🎉', '/comunidad/Clientes_2.webp', 184, 4, true),
  ('Coctelería de autor y mezclas exclusivas 🍸🍹', '/comunidad/Cocteles.webp', 267, 5, true),
  ('Festejando cumpleaños por todo lo alto en 180° VIP 🎂🍾', '/comunidad/Cumpleanos.webp', 389, 6, true),
  ('Servicio de botellas premium y atención personalizada 🍾👑', '/comunidad/Licor_mesa.webp', 215, 7, true),
  ('Nuestro equipo VIP listo para darte la mejor noche 💎✨', '/comunidad/Personal.webp', 290, 8, true)
on conflict do nothing;

-- 6. Forzar recarga inmediata de la caché de PostgREST
notify pgrst, 'reload schema';
