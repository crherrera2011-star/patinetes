-- Esquema generado por crear-esquema.mjs
-- Nicho: Patinetes Eléctricos
-- Tabla: public.products
-- Criterios: 6 (pesos al 100 %)
--
-- Ejecuta este archivo completo en Supabase → SQL Editor.
-- Es idempotente: se puede volver a ejecutar tras añadir criterios.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  asin text not null unique,
  name text not null,
  slug text unique,
  brand text,
  model text,
  price numeric(10, 2) not null default 0 check (price >= 0),
  currency text not null default 'EUR',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  image_src text,
  gallery text[] not null default '{}',
  affiliate_url text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  tags text[] not null default '{}',
  ideal_for text,
  reviews_summary jsonb not null default '{}',
  specifications jsonb not null default '{}',
  autonomy smallint not null default 60 check (autonomy between 0 and 100),
  power smallint not null default 60 check (power between 0 and 100),
  safety smallint not null default 60 check (safety between 0 and 100),
  portability smallint not null default 60 check (portability between 0 and 100),
  comfort smallint not null default 60 check (comfort between 0 and 100),
  value_for_money smallint not null default 60 check (value_for_money between 0 and 100),
  badge text,
  badge_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migración segura para tablas ya creadas
alter table public.products
  add column if not exists autonomy smallint not null default 60 check (autonomy between 0 and 100);
alter table public.products
  add column if not exists power smallint not null default 60 check (power between 0 and 100);
alter table public.products
  add column if not exists safety smallint not null default 60 check (safety between 0 and 100);
alter table public.products
  add column if not exists portability smallint not null default 60 check (portability between 0 and 100);
alter table public.products
  add column if not exists comfort smallint not null default 60 check (comfort between 0 and 100);
alter table public.products
  add column if not exists value_for_money smallint not null default 60 check (value_for_money between 0 and 100);

create index if not exists products_brand_idx on public.products (brand);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_rating_idx on public.products (rating desc, review_count desc);
create index if not exists products_specs_idx on public.products using gin (specifications);
create index if not exists products_tags_idx on public.products using gin (tags);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

-- Lectura pública; la escritura queda solo para service_role (bypass RLS)
alter table public.products enable row level security;
drop policy if exists "products_lectura_publica" on public.products;
create policy "products_lectura_publica"
  on public.products
  for select
  to anon, authenticated
  using (true);

comment on column public.products.autonomy is 'Autonomía real (0-100). Peso 20 %.';
comment on column public.products.power is 'Potencia y cuestas (0-100). Peso 18 %.';
comment on column public.products.safety is 'Frenos y seguridad (0-100). Peso 18 %.';
comment on column public.products.portability is 'Plegado y peso (0-100). Peso 16 %.';
comment on column public.products.comfort is 'Confort y suspensión (0-100). Peso 14 %.';
comment on column public.products.value_for_money is 'Calidad-precio (0-100). Peso 14 %.';

-- Verificación
select count(*) as productos from public.products;
