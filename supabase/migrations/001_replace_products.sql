-- ============================================================================
-- 001 · Reemplazo atómico del catálogo de patinetes + histórico de ejecuciones
-- ============================================================================
-- Ejecutar este archivo UNA VEZ en Supabase → SQL Editor, después de
-- supabase/schema.sql.
--
-- Qué aporta:
--   1. public.replace_products(rows jsonb): borra todas las filas de
--      public.products e inserta las nuevas en una sola transacción. Si el
--      catálogo llega vacío o falla un INSERT, no se borra nada.
--   2. public.sync_runs: histórico de cada actualización semanal.
--
-- Seguridad:
--   - La función es SECURITY DEFINER y solo se puede ejecutar con el rol
--     service_role (el que usa GitHub Actions).
--   - anon/authenticated no pueden borrar ni insertar productos.
--   - sync_runs tiene RLS activado y ninguna política: solo service_role
--     (que ignora RLS) puede leerla o escribirla.
-- ============================================================================

SET search_path TO public, pg_catalog;

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 0. Comprobación previa
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    RAISE EXCEPTION
      'Falta la tabla public.products. Ejecuta antes supabase/schema.sql.';
  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 1. Histórico de ejecuciones
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sync_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at       TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running', 'success', 'error')),
  source            TEXT,
  products_received INTEGER NOT NULL DEFAULT 0,
  products_inserted INTEGER NOT NULL DEFAULT 0,
  message           TEXT,
  details           JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;

-- Sin políticas: anon y authenticated no ven nada. service_role ignora RLS.

CREATE INDEX IF NOT EXISTS idx_sync_runs_started_at
  ON public.sync_runs (started_at DESC);

-- El script escribe el histórico con la clave service_role.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON public.sync_runs FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON public.sync_runs FROM authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE ON public.sync_runs TO service_role';
  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 2. Reemplazo atómico del catálogo
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.replace_products(p_rows JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inserted INTEGER;
BEGIN
  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'replace_products: se esperaba un array JSON de productos';
  END IF;

  IF jsonb_array_length(p_rows) = 0 THEN
    RAISE EXCEPTION 'replace_products: el catálogo está vacío; no se borra la tabla';
  END IF;

  -- Borrado e inserción dentro de la misma transacción de la función.
  DELETE FROM public.products;

  INSERT INTO public.products (
    id, asin, name, slug, brand, model, price, currency, rating,
    review_count, image_src, gallery, affiliate_url, pros, cons, tags,
    ideal_for, reviews_summary, specifications, autonomy, power, safety,
    portability, comfort, value_for_money, badge, badge_color,
    created_at, updated_at
  )
  SELECT
    x.id,
    COALESCE(NULLIF(x.asin, ''), x.id),
    COALESCE(NULLIF(x.name, ''), NULLIF(x.model, ''), x.id),
    COALESCE(NULLIF(x.slug, ''), lower(x.id)),
    COALESCE(x.brand, ''),
    COALESCE(NULLIF(x.model, ''), NULLIF(x.name, ''), ''),
    GREATEST(COALESCE(x.price, 0), 0),
    COALESCE(NULLIF(x.currency, ''), 'EUR'),
    LEAST(GREATEST(COALESCE(x.rating, 0), 0), 5),
    GREATEST(COALESCE(x.review_count, 0), 0),
    COALESCE(x.image_src, ''),
    COALESCE(x.gallery, '{}'::text[]),
    COALESCE(x.affiliate_url, ''),
    COALESCE(x.pros, '{}'::text[]),
    COALESCE(x.cons, '{}'::text[]),
    COALESCE(x.tags, '{}'::text[]),
    COALESCE(x.ideal_for, ''),
    COALESCE(x.reviews_summary, '{}'::jsonb),
    COALESCE(x.specifications, '{}'::jsonb),
    LEAST(GREATEST(COALESCE(x.autonomy, 60), 0), 100),
    LEAST(GREATEST(COALESCE(x.power, 60), 0), 100),
    LEAST(GREATEST(COALESCE(x.safety, 60), 0), 100),
    LEAST(GREATEST(COALESCE(x.portability, 60), 0), 100),
    LEAST(GREATEST(COALESCE(x.comfort, 60), 0), 100),
    LEAST(GREATEST(COALESCE(x.value_for_money, 60), 0), 100),
    COALESCE(x.badge, ''),
    COALESCE(x.badge_color, ''),
    COALESCE(x.created_at, now()),
    COALESCE(x.updated_at, now())
  FROM jsonb_to_recordset(p_rows) AS x(
    id TEXT,
    asin TEXT,
    name TEXT,
    slug TEXT,
    brand TEXT,
    model TEXT,
    price NUMERIC,
    currency TEXT,
    rating NUMERIC,
    review_count INTEGER,
    image_src TEXT,
    gallery TEXT[],
    affiliate_url TEXT,
    pros TEXT[],
    cons TEXT[],
    tags TEXT[],
    ideal_for TEXT,
    reviews_summary JSONB,
    specifications JSONB,
    autonomy INTEGER,
    power INTEGER,
    safety INTEGER,
    portability INTEGER,
    comfort INTEGER,
    value_for_money INTEGER,
    badge TEXT,
    badge_color TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
  );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
$$;

-- Solo service_role puede ejecutar el reemplazo.
REVOKE ALL ON FUNCTION public.replace_products(JSONB) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.replace_products(JSONB) FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.replace_products(JSONB) FROM authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.replace_products(JSONB) TO service_role';
  END IF;
END
$$;

COMMENT ON FUNCTION public.replace_products(JSONB) IS
  'Borra todo public.products e inserta el catálogo recibido de forma atómica. Solo service_role.';

-- Para que PostgREST reconozca la función sin esperar a la recarga automática.
NOTIFY pgrst, 'reload schema';
