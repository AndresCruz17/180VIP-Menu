-- ==============================================================================
-- 180 VIP - DATABASE SCHEMA & RLS POLICIES
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. TABLA CATEGORIES
-- ==============================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  image_url   text,
  description text,
  created_at  timestamptz not null default now()
);

-- ==============================================================================
-- 2. TABLA DRINKS
-- ==============================================================================
create table if not exists public.drinks (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  category_id  uuid references public.categories(id) on delete set null,
  price        numeric(14,2),
  brand        text,
  volume       text,
  description  text,
  image_url    text,
  is_available boolean not null default true,
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ==============================================================================
-- 3. TABLA ADMIN_USERS
-- ==============================================================================
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. HABILITAR RLS
-- ==============================================================================
alter table public.categories  enable row level security;
alter table public.drinks      enable row level security;
alter table public.admin_users enable row level security;

-- ==============================================================================
-- 5. RLS - CATEGORIES
-- ==============================================================================
create policy "categories_public_read"
  on public.categories for select to public using (true);

create policy "categories_admin_all"
  on public.categories for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- ==============================================================================
-- 6. RLS - DRINKS
-- ==============================================================================
create policy "drinks_public_read"
  on public.drinks for select to public
  using (true);

create policy "drinks_admin_all"
  on public.drinks for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- ==============================================================================
-- 7. RLS - ADMIN_USERS
-- ==============================================================================
create policy "admin_users_self_read"
  on public.admin_users for select to authenticated
  using (user_id = auth.uid());

-- ==============================================================================
-- 8. STORAGE BUCKET
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('drinks', 'drinks', true)
on conflict (id) do nothing;

create policy "drinks_images_public_read"
  on storage.objects for select to public
  using (bucket_id = 'drinks');

create policy "drinks_images_admin_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'drinks' and exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "drinks_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'drinks' and exists (select 1 from public.admin_users where user_id = auth.uid()));

-- ==============================================================================
-- 9. SEED - CATEGORIAS
-- ==============================================================================
insert into public.categories (name, slug, description) values
  ('Aguardientes', 'aguardientes', 'Aguardientes colombianos y regionales'),
  ('Cocteles',     'cocteles',     'Cocteleria clasica y de autor'),
  ('Cervezas',     'cervezas',     'Cervezas nacionales e importadas'),
  ('Whisky',       'whisky',       'Scotch, Bourbon y Single Malts premium'),
  ('Tequila',      'tequila',      'Tequilas reposados, anejos y cristalinos'),
  ('Botellas',     'botellas',     'Servicio de botella con hielo y acompanantes'),
  ('Ron',          'ron',          'Rones blancos, anejos y premium'),
  ('Vinos',        'vinos',        'Vinos tintos, blancos y espumosos')
on conflict (slug) do nothing;

-- ==============================================================================
-- 10. SEED - BEBIDAS INICIALES DE EJEMPLO
-- ==============================================================================
insert into public.drinks (name, slug, category_id, price, brand, volume, description, is_available, is_featured)
select d.name, d.slug,
  (select id from public.categories where slug = d.cat_slug),
  d.price, d.brand, d.volume, d.description, true, d.featured
from (values
  ('Antioqueno Azul',        'antioqueno-azul-750ml',           'aguardientes', 180000::numeric, 'Sin Azucar',       '750ml',       'Aguardiente sin azucar con notas puras de anis estrellado.',      true::boolean),
  ('Aguardiente Amarillo',   'aguardiente-amarillo-manzanares', 'aguardientes', 210000::numeric, 'Manzanares',       '750ml',       'El clasico de Colombia con color ambar natural.',                  true::boolean),
  ('Whisky Old Parr 12',     'whisky-old-parr-12-anos-750ml',   'whisky',       280000::numeric, 'Old Parr',         '750ml',       'Blended escoces anejado 12 anos. Notas de frutas y caramelo.',     true::boolean),
  ('Buchanans De Luxe 12',   'buchanans-de-luxe-12-750ml',      'whisky',       290000::numeric, 'Buchanans',        '750ml',       'Sedoso blended scotch con toques de mandarina y chocolate.',       true::boolean),
  ('Tequila Don Julio 70',   'tequila-don-julio-70-700ml',      'tequila',      450000::numeric, 'Don Julio',        '700ml',       'Anejo cristalino filtrado. Frescura del agave con riqueza.',       true::boolean),
  ('Corona Extra',           'corona-extra-355ml',              'cervezas',      15000::numeric, 'Botella',          '355ml',       'Cerveza clara mexicana refrescante, servida fria con limon.',      false::boolean),
  ('Gin Tonic Premium',      'gin-tonic-premium',               'cocteles',      45000::numeric, 'Bosque de Indias', 'Copa Balon',  'Ginebra artesanal botanica, tonica premium y citricos.',          false::boolean),
  ('Mojito Maracuya VIP',    'mojito-maracuya-vip',             'cocteles',      38000::numeric, '180 Signature',    'Copa Collins','Ron blanco, pulpa fresca de maracuya, menta y lima.',             false::boolean)
) as d(name, slug, cat_slug, price, brand, volume, description, featured)
on conflict (slug) do nothing;

-- ==============================================================================
-- SIGUIENTE PASO (ejecutar DESPUES de crear tu usuario admin en Authentication):
--
-- INSERT INTO public.admin_users (user_id, email)
-- VALUES ('<PEGA_AQUI_EL_UUID_DE_TU_USUARIO>', '<tu@email.com>');
-- ==============================================================================
