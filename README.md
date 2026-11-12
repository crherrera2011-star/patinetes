# Patinetes Eléctricos

Web editorial de afiliados de Amazon.es especializada en patinetes eléctricos. Comparativas, fichas técnicas, comparador y guía de compra con datos verificables: nada de descuentos inventados ni especificaciones de relleno.

- **Stack:** React 18 + Vite 4 + Tailwind CSS 4 + Supabase (opcional, con fallback local).
- **Nicho:** patinetes eléctricos para adultos.
- **Afiliado:** `netcarmoncafe-21` (Amazon.es).
- **Producción:** `https://toppatinetes.com`.

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
3. Ejecuta [`supabase/migrations/001_replace_products.sql`](supabase/migrations/001_replace_products.sql), que crea la función `replace_products` y la tabla de histórico `sync_runs`.
4. Comprueba que existe la tabla `public.products` con lectura pública (RLS activo).

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

### Actualización automática semanal

El workflow [`.github/workflows/actualizar-catalogo.yml`](.github/workflows/actualizar-catalogo.yml) actualiza el catálogo de Supabase todos los **lunes a las 05:00 UTC** (07:00 en verano y 06:00 en invierno en España). También se puede lanzar a mano desde la pestaña **Actions** con estas opciones:

- `scrape`: refresca precios, valoraciones, reseñas, imágenes y specs desde Amazon.es.
- `dry_run`: valida y muestra el resultado sin tocar Supabase.
- `force`: permite reducir el catálogo o arrancar con una tabla vacía.

Antes del primer uso:

1. Ejecuta [`supabase/migrations/001_replace_products.sql`](supabase/migrations/001_replace_products.sql) en Supabase → SQL Editor.
2. En GitHub → **Settings → Secrets and variables → Actions**, crea:
   - `SUPABASE_URL` — URL del proyecto (`https://xxxx.supabase.co`).
   - `SUPABASE_SERVICE_ROLE_KEY` — clave `service_role`, nunca la anon/publishable.
   - `AMAZON_ASSOCIATE_TAG` — opcional; si falta se usa el de `niche.config.mjs`.
   - `VERCEL_DEPLOY_HOOK` — opcional pero recomendado: URL del *Deploy Hook* de Vercel
     (Vercel → proyecto → **Settings → Git → Deploy Hooks**, rama `main`). Sin él, el
     HTML prerenderizado se queda con los precios anteriores hasta el siguiente push.
3. Lanza el workflow a mano una vez con `dry_run` activado para comprobar credenciales y scraping.

Qué hace el script [`scripts/actualizar-catalogo.mjs`](scripts/actualizar-catalogo.mjs):

- Reutiliza el scraper del proyecto para leer las URLs de `datos/patinetes.xlsx`.
- Conserva las notas editoriales, etiquetas, textos, badges y el `created_at` que ya existen en Supabase; solo actualiza los datos volátiles.
- Si Amazon falla en un producto, mantiene sus datos actuales en lugar de borrarlo.
- Valida el resultado antes de escribir: mínimo de productos, sin duplicados y con nombre y URL de afiliado.
- Llama a `replace_products`, que borra e inserta todo el catálogo en **una sola transacción**.
- Guarda copias en `datos/catalogo.anterior.json` y `datos/catalogo.actualizado.json`, y el log en `datos/ultima-actualizacion.log` (también queda como artifact en GitHub Actions).
- Registra cada ejecución en `public.sync_runs` (estado, filas insertadas y errores), consultable solo con la clave `service_role`.

Salvaguardas: si no se refresca ningún producto, si el catálogo baja del mínimo (`MIN_PRODUCTS`, por defecto 8) o se reduce a menos de la mitad, la ejecución falla sin tocar Supabase salvo que se use `force`.

Comandos locales equivalentes:

```bash
npm run catalogo:update    # scrapea y reemplaza el catálogo en Supabase
npm run catalogo:dry-run   # scrapea y valida sin escribir
npm run catalogo:test      # prueba con 2 productos, sin Supabase
npm run catalogo:offline   # valida el catálogo local sin conectar
npm run catalogo:export    # exporta el catálogo actual de Supabase a JSON
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
| `npm run build` | Genera el sitemap, compila y prerenderiza las rutas a `dist/` |
| `npm run preview` | Sirve la build localmente |
| `npm run og:image` | Regenera `public/images/og-default.png` (1200×630) |
| `npm run schema` | Regenera `supabase/schema.sql` desde `niche.config.mjs` |
| `npm run top20` | Busca el top 20 en Amazon.es |
| `npm run scrape` | Scrapea sin escribir SQL |
| `npm run scrape:sql` | Scrapea y genera SQL |
| `npm run scrape:push` | Scrapea y sube a Supabase (service role) |
| `npm run verify` | Valida el catálogo |
| `npm run catalogo:update` | Scrapea y reemplaza el catálogo completo en Supabase |
| `npm run catalogo:dry-run` | Igual que `catalogo:update` pero sin escribir |
| `npm run catalogo:test` | Prueba con 2 productos, sin Supabase |
| `npm run catalogo:offline` | Valida el catálogo local sin conectar |
| `npm run catalogo:export` | Exporta el catálogo actual de Supabase a JSON |

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
- Prerender con Chrome headless (`scripts/prerender.mjs`): cada ruta del sitemap se
  guarda como HTML estático (`letra.html`), así Google recibe el contenido sin
  ejecutar JavaScript y las URLs inexistentes devuelven un 404 real.
- Divulgación de afiliación visible en cabecera, fichas y pie de página.
- Navegación por teclado, foco visible, `aria-label` en controles y contraste revisado.
- Diseño probado a 390 px sin scroll horizontal.

## Despliegue

La build es estática y prerenderizada:

```bash
npm run build
```

Genera en `dist/` un `.html` por ruta (`index.html`, `patinetes.html`,
`producto/<asin>.html`, `404.html`) más `sitemap.xml` y `robots.txt`. Sube el
contenido de `dist/` al hosting.

- **Vercel**: `vercel.json` ya activa `cleanUrls` (sirve `/patinetes` desde
  `patinetes.html`), redirige `/maquinas/:id` → `/producto/:id` con 301 y deja
  que las rutas inexistentes caigan en `404.html`.
- **Apache/Hostinger**: `public/.htaccess` mapea `/ruta` → `/ruta.html` y usa
  `index.html` como último recurso.

Si Chrome no arranca en el build (por ejemplo, en un contenedor sin librerías),
`prerender.mjs` avisa y copia el shell SPA en cada ruta: la web sigue
funcionando, solo pierde el HTML estático.

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
  actualizar-catalogo.mjs Actualización semanal y reemplazo atómico
  verificar-catalogo.mjs  Validación del catálogo
  generate-sitemap.mjs    Sitemap en build
  prerender.mjs           HTML estático por ruta (Chrome headless)
  generate-og-image.mjs   Imagen social 1200×630
  lib/launch-browser.mjs  Chrome local o Chromium empaquetado (Vercel)
  crear-esquema.mjs       Esquema SQL
supabase/
  schema.sql              Tabla products + RLS
  insert-productos.sql    Datos generados por el scraper
  migrations/
    001_replace_products.sql  RPC de reemplazo + histórico
datos/
  patinetes.xlsx          URLs de partida
  productos.json          Snapshot scrapeado
  catalogo.actualizado.json  Último catálogo validado
  catalogo.anterior.json     Copia previa a cada actualización
  ultima-actualizacion.log   Log de la última ejecución
.github/workflows/
  actualizar-catalogo.yml Actualización semanal programada
```

## Notas editoriales

- La nota final pondera: autonomía real 20 %, potencia 18 %, frenos y seguridad 18 %, plegado y peso 16 %, confort 14 % y calidad-precio 14 %.
- La calidad-precio se calcula con la calidad ponderada frente al precio relativo a la mediana del catálogo. No se muestran descuentos que Amazon no certifique.
- Las especificaciones que no aparecen en la ficha se muestran como «—». No se inventan datos.
- Las imágenes y los precios pertenecen a Amazon.es y pueden cambiar. La ficha enlazada es la fuente final.

## Licencia

Uso privado. El contenido editorial es propio; los datos y las imágenes de producto pertenecen a sus respectivos titulares.
