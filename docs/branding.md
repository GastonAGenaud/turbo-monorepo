# Branding y assets — GG Seeds

Última actualización: **2026-04-30**.

## Logo

Master con fondo transparente recortado (PIL `getbbox` + threshold de cream
`#fefade ± 38`) en ambos apps:

- `apps/storefront/public/logo.png` — 560×562 px, 240 KB
- `apps/admin/public/logo.png` — idéntico

El logo se monta en navbar y footer vía `next/image` con aspect cuadrado
(la marca real es circular + tagline ≈ 1:1) y `sizes` por breakpoint para
que el optimizer pida la densidad correcta:

| Surface | Tailwind classes | Sizes prop |
|---|---|---|
| Storefront navbar | `h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16` | `(max-width: 768px) 56px, 80px` |
| Storefront footer | `h-20 w-20` | `80px` |
| Admin shell header | `h-16 w-16 md:h-20 md:w-20` | `(max-width: 768px) 64px, 80px` |

Si necesitás reemplazar el master:

1. Pasá la imagen original (preferentemente PNG con fondo plano o PNG ya
   transparente) al pipeline de `/tmp/remove_bg.py`. Detecta el color de
   esquina superior-izquierda y lo reemplaza con alpha=0 dentro de un
   threshold de 38 por canal.
2. Re-corre `/tmp/gen_icons.py` para regenerar los iconos derivados (ver
   abajo). Las rutas destino están hardcodeadas — actualizá si movés
   archivos.

Ambos scripts viven en `/tmp` durante la sesión que los crea; si querés
versionarlos, copialos a `scripts/branding/` (recomendado).

## Iconos derivados

Generados desde el master square-trimmed (562×562 transparente):

| Archivo | Tamaño | Notas |
|---|---|---|
| `apps/storefront/app/icon.png` | 192×192 transparente | Favicon principal (Next 15 file-based). |
| `apps/storefront/app/apple-icon.png` | 180×180 sobre `#06090d` | iOS borra el alpha; se compone sobre el surface dark. |
| `apps/storefront/app/opengraph-image.png` | 1200×630, logo 460×460 sobre `#080c10` | Default OG image cuando una página no override. |
| `apps/storefront/app/twitter-image.png` | Igual que OG. | Default Twitter card image. |
| `apps/admin/app/icon.png` | 192×192 transparente | Admin favicon. |
| `apps/admin/app/apple-icon.png` | 180×180 sobre `#06090d` | Admin iOS icon. |

## Open Graph en producto

`apps/storefront/app/producto/[slug]/page.tsx` define `generateMetadata`
que sobrescribe `og:image` con la primera imagen del producto. Si ese
campo está vacío, el fallback es el `app/opengraph-image.png` global.

## SEO marca

`apps/storefront/app/layout.tsx` declara un JSON-LD `Organization` con
nombre "GGseeds", `alternateName` "GG Seeds", el dominio canónico, la
dirección (Buenos Aires/CABA), `contactPoint` con WhatsApp y `sameAs`
apuntando al Instagram de la marca. Esto alimenta el knowledge panel en
buscadores y los ofrece automáticamente como enriquecimiento en Google.

## Restricciones operativas conocidas

- **Imágenes de `dutch-passion.ar`** rebotan en el optimizer de Vercel
  con `OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED` (Cloudflare bloquea
  el server-fetch). Bypass selectivo en
  `apps/storefront/components/product-image.tsx` con `unoptimized` solo
  cuando el host coincide con `dutch-passion.ar`.
- **`images.remotePatterns`** está restringido a:
  `merlingrow.com`, `www.merlingrow.com`, `dutch-passion.ar`,
  `www.dutch-passion.ar`, `dutchpassion.com`, `www.dutchpassion.com`,
  `images.unsplash.com`. Agregar nuevos hosts en
  `apps/storefront/next.config.mjs` y `apps/admin/next.config.mjs` antes
  de importar imágenes desde otra fuente.

## Vercel Analytics + Speed Insights

Wired en ambos `app/layout.tsx` con `@vercel/analytics/next` y
`@vercel/speed-insights/next`. Para activar:

1. https://vercel.com/gastonagenauds-projects/ggseeds-storefront/analytics
   → Enable Web Analytics (gratis hasta 2.5 k events/mes en Hobby).
2. Mismo paso para `ggseeds-admin`.
3. Speed Insights se habilita en `/speed-insights` de cada proyecto.

Mientras estén deshabilitados, el script proxy `/[hash]/script.js`
retorna 404 (genera 2 errores en consola). El código no necesita
re-deploy una vez que se habilita en el dashboard.
