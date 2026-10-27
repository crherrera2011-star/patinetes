# Patinetes Eléctricos

Web editorial de afiliados de Amazon.es especializada en patinetes eléctricos. Comparativas, fichas técnicas, comparador y guía de compra con datos verificables: nada de descuentos inventados ni especificaciones de relleno.

- **Stack:** React 18 + Vite 4 + Tailwind CSS 4 + Supabase (opcional, con fallback local).
- **Nicho:** patinetes eléctricos para adultos.
- **Afiliado:** `netcarmoncafe-21` (Amazon.es).
- **Producción:** `https://patinetes-electricos.es`.

## Arranque rápido

```bash
npm install
copy .env.example .env   # Windows
npm run dev
```

Abre `http://localhost:5173`. La web funciona sin Supabase: si la tabla no existe o está vacía, usa `src/data/productos.json` como snapshot local.

## Variables de entorno

Copia `.env.example` a `.env` y rellena:

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (solo lectura) |
| `VITE_SITE_URL` | Dominio canónico para SEO y sitemap |
| `VITE_CONTACT_EMAIL` | Correo de contacto / aviso legal |
| `VITE_AMAZON_TAG` | Tag de afiliado, termina en `-21` |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo scripts. Nunca en el frontend |

## Base de datos

1. Entra en Supabase → **SQL Editor**.
2. Pega y ejecuta el contenido completo de [`supabase/schema.sql`](supabase/schema.sql).
3. Comprueba que existe la tabla `public.products` con lectura pública (RLS activo).

El esquema es idempotente. Las notas editoriales (`autonomy`, `power`, `safety`, `portability`, `comfort`, `value_for_money`) solo se escriben al insertar: una actualización posterior de precios o specs no las sobrescribe.

## Pipeline de datos

```bash
# 1. Localizar el top 20 de Amazon.es y generar datos/patinetes.xlsx
npm run top20

# 2. Scrapear las fichas y generar datos/productos.json + SQL
npm run scrape:sql

# 3. Verificar cobertura y coherencia del catálogo
npm run verify
```

- `top20` filtra productos infantiles, exige valoración y reseñas mínimas y guarda ASIN, título, precio y valoración.
- `scrape` extrae precio, galería, bullets y especificaciones. Si Amazon no publica un dato en la tabla técnica, lo deduce del título y los bullets con los patrones `infer` de `niche.config.mjs`. El dato estructurado siempre tiene prioridad.
- `--push` requiere `SUPABASE_SERVICE_ROLE_KEY`. Sin ella, usa `--sql` y ejecuta `supabase/insert-productos.sql` en Supabase.
- El snapshot `datos/productos.json` se copia a `src/data/productos.json` para que la web tenga datos aunque Supabase no esté configurado.

```bash
copy datos/productos.json src/data/productos.json
```

### Añadir o actualizar productos

1. Añade las URLs a `datos/patinetes.xlsx` (columna `url`) o edita el Excel existente.
2. Ejecuta `npm run scrape:sql`.
3. Revisa `datos/productos.json` y `supabase/insert-productos.sql`.
4. Copia el snapshot al frontend y vuelve a desplegar.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el sitemap y compila a `dist/` |
| `npm run preview` | Sirve la build localmente |
| `npm run schema` | Regenera `supabase/schema.sql` desde `niche.config.mjs` |
| `npm run top20` | Busca el top 20 en Amazon.es |
| `npm run scrape` | Scrapea sin escribir SQL |
| `npm run scrape:sql` | Scrapea y genera SQL |
| `npm run scrape:push` | Scrapea y sube a Supabase (service role) |
| `npm run verify` | Valida el catálogo |

## Rutas

- `/` — home editorial con tres selecciones y rankings.
- `/patinetes` — catálogo con búsqueda, filtros, orden y paginación.
- `/producto/:id` — ficha con galería, radar, specs, pros/contras, alternativas y CTA.
- `/comparador` — comparación de hasta 3 modelos, persistida en `localStorage`.
- `/ofertas` — precios frente a la mediana del catálogo (sin rebajas inventadas).
- `/guia-2026` — guía de compra del nicho.
- `/categorias` — accesos por uso, precio y prestaciones.
- `/aviso-legal` — afiliación, privacidad y responsabilidad.
- `/maquinas/:id` — redirección heredada a `/producto/:id`.

## SEO y accesibilidad

- Metadatos por ruta (título, descripción, canónica, Open Graph) en `src/lib/seo.js`.
- JSON-LD de producto y `BreadcrumbList` en las fichas.
- `sitemap.xml` generado en cada build desde Supabase o desde el snapshot local.
- Divulgación de afiliación visible en cabecera, fichas y pie de página.
- Navegación por teclado, foco visible, `aria-label` en controles y contraste revisado.
- Diseño probado a 390 px sin scroll horizontal.

## Despliegue

La build es estática:

```bash
npm run build
```

Sube el contenido de `dist/` a Hostinger (o cualquier hosting estático). Configura una regla de reescritura hacia `index.html` para que las rutas de React Router funcionen al recargar.

## Estructura

```
niche.config.mjs          Identidad, criterios, specs, filtros y guía
src/
  components/             UI compartida y de producto
  context/                Catálogo y comparador
  data/                   Snapshot local y categorías
  lib/                    Normalización, SEO, formato y Supabase
  pages/                  Rutas
scripts/
  top20-amazon.mjs        Búsqueda del top 20
  scrape-catalogo.mjs     Scraper y generación de SQL
  verificar-catalogo.mjs  Validación del catálogo
  generar-sitemap.mjs     Sitemap en build
  crear-esquema.mjs       Esquema SQL
supabase/
  schema.sql              Tabla products + RLS
  insert-productos.sql    Datos generados por el scraper
datos/
  patinetes.xlsx          URLs de partida
  productos.json          Snapshot scrapeado
```

## Notas editoriales

- La nota final pondera: autonomía real 20 %, potencia 18 %, frenos y seguridad 18 %, plegado y peso 16 %, confort 14 % y calidad-precio 14 %.
- La calidad-precio se calcula con la calidad ponderada frente al precio relativo a la mediana del catálogo. No se muestran descuentos que Amazon no certifique.
- Las especificaciones que no aparecen en la ficha se muestran como «—». No se inventan datos.
- Las imágenes y los precios pertenecen a Amazon.es y pueden cambiar. La ficha enlazada es la fuente final.

## Licencia

Uso privado. El contenido editorial es propio; los datos y las imágenes de producto pertenecen a sus respectivos titulares.
