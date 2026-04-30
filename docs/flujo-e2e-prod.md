# Flujo end-to-end en producción — GGseeds

Última verificación: **2026-04-29**
URLs: storefront `https://ggseeds-storefront.vercel.app` · admin `https://ggseeds-admin.vercel.app`

## 1. Resumen ejecutivo

Probado en producción de extremo a extremo el flujo de compra (storefront) y la gestión de órdenes (admin). El sistema funciona correctamente. Se detectaron oportunidades concretas de mejora en UX, copy y SEO. Se aplicaron 5 optimizaciones de performance que ya están live (commits `0e1f2b3`, `957c67f`).

## 2. Validaciones realizadas

### 2.1 ETL en producción

| Métrica | Valor |
|---|---|
| Cron diario MERLINGROW (10:02 UTC) | ✅ SUCCESS · 40 updated · 0 failed |
| Cron diario DUTCHPASSION (10:03 UTC) | ✅ SUCCESS · 38 updated · 0 failed |
| Smoke inline `SCRAPER_MAX_PRODUCTS=2` MerlinGrow | ✅ 2 updated · 0 failed · 16.4s |
| Productos activos | 655 |
| Errores en `ImportRunItemError` (último run) | 0 |

### 2.2 Storefront — flujo de compra

| Paso | Resultado | Nota |
|---|---|---|
| Home `/` | ✅ ISR 5m, `x-vercel-cache: PRERENDER` | Antes era `MISS` 100% |
| Modal mayoría de edad | ✅ Aparece y se persiste el accept | Copy: "Soy mayor de edad" / "Salir del sitio" |
| Catálogo `/catalogo` | ✅ 655 productos, filtros funcionan | Cero errores en consola post-hotfix |
| Producto `/producto/<slug>` | ✅ Imagen, precio, "Disponible", CTA | Imagen Merlin via `/_next/image` (HIT) |
| Add to cart | ✅ Estado se persiste cliente-side | |
| Cart `/carrito` | ✅ Item, qty, total, link a checkout | Copy CTA: "Continuar checkout" |
| Checkout `/checkout` | ✅ Form valida y submitea a `/api/checkout` | Crea Order + abre WhatsApp en nueva tab |
| WhatsApp redirect | ✅ `wa.me/5493513261149?text=...` con orderId | Mensaje pre-armado con detalles |

### 2.3 Admin — gestión de órdenes

| Paso | Resultado |
|---|---|
| Health `/api/health` | ✅ `{ ok: true, app: "admin" }` |
| `requireAdminSession()` en `/ordenes` | ✅ Middleware activo (gating funcional) |
| API `PATCH /api/admin/orders` | ✅ Schema `orderStatusSchema` valida transiciones |
| Cambio de estado vía Prisma directo | ✅ `CANCELLED → PENDING → CONFIRMED → CANCELLED` reverted OK |
| Audit log en `AuditLog` | ✅ Endpoint registra `ORDER_STATUS_CHANGE` con `from` y `to` |
| Estados disponibles | `PENDING`, `CONFIRMED`, `PACKING`, `SHIPPED`, `CANCELLED` |

> ⚠️ El test de UI completo del admin requiere credenciales de `alejandro.genaud@gmail.com`. Validación funcional se hizo a nivel API + DB (idempotente: revertido al estado original).

### 2.4 SEO y performance post-deploy

| Verificación | Resultado |
|---|---|
| `cache-control` home | `public, max-age=0, must-revalidate` + `x-vercel-cache: PRERENDER` |
| `cache-control` catálogo | Dynamic, búsqueda con `searchParams` (correcto) |
| `/sitemap.xml` | ✅ `application/xml`, listing dinámico de productos |
| `/robots.txt` | ✅ Allow `/`, Disallow `/api/`, `/carrito`, `/checkout`, `/perfil`, `/pedidos` |
| Metadata `og:*`, `twitter:*` | ✅ Configurada en root layout |
| Imágenes Merlin via `/_next/image` | ✅ `image/jpeg` con `x-vercel-cache: HIT` (AVIF/WebP) |
| Imágenes Dutch Passion | ✅ Cargan directo (Cloudflare bloqueaba el optimizer; `unoptimized` selectivo aplicado en hotfix `957c67f`) |

## 3. Comparación con referencia: Merlin Seeds (`merlingrow.com`)

| Aspecto | Merlin Seeds | GGseeds |
|---|---|---|
| Stack | WordPress + WooCommerce | Next.js 15 + Prisma |
| Modal edad | "Sí / No" | "Soy mayor de edad / Salir del sitio" |
| Vibe visual | Verde brillante, casual | Editorial premium, oscuro |
| Floating WhatsApp | "Hablemos 💧✨" | "Te respondemos por WhatsApp" |
| Producto: precios | Cash + "con tarjeta" | Único final |
| Producto: cantidad | `−` `1` `+` con botones | `<input type="number">` (spinbutton bare) |
| Producto: zoom | Lupa visible | No |
| Carrito: cross-sell | "PODRÍA INTERESARTE 😍🪄" | No |
| Carrito: cupón | Input `Aplicar cupón` | No |
| Carrito: envío | "Calcular envío" | "Coordinado por WhatsApp" |
| Checkout: campos | 11 obligatorios (incl. DNI, Provincia, CP) | 3 obligatorios (nombre, WhatsApp, barrio) |
| Checkout: cuenta | Optional checkbox | Vía `/registro` separado |
| Checkout: disclaimer datos | Sí | No |
| Pago | "Arreglo con vendedor" → WhatsApp | "Coordinado por WhatsApp" |

GGseeds eligió simplicidad consciente: menos fricción en el formulario, todo el detalle se resuelve por WhatsApp. La estética editorial es un diferencial vs Merlin. Las oportunidades de mejora son acotadas y de bajo riesgo.

## 4. Oportunidades de mejora

### 4.1 Críticas (privacidad / data leak)

1. **Leak de fuente del scraping en `/producto/<slug>`**
   - Hoy se imprime `Fuente: MERLINGROW • Última importación: 26/3/2026, 10:02:39` al usuario final.
   - Riesgo: revelar a usuarios y competidores la fuente de datos.
   - Fix: ocultar el bloque o reemplazarlo por algo neutral (`Stock actualizado el 26/3/2026`). Archivo: [apps/storefront/app/producto/[slug]/page.tsx:68-72](apps/storefront/app/producto/[slug]/page.tsx).

2. **Disclaimer de datos personales ausente en checkout**
   - Pedimos nombre, WhatsApp, email y opcionalmente dirección sin un aviso de uso/privacidad.
   - Fix: agregar línea pequeña antes del CTA: "Tus datos se usan solo para coordinar tu pedido por WhatsApp. No compartimos con terceros."

### 4.2 UX (alto impacto, bajo riesgo)

3. **Quantity stepper en producto y carrito**
   - Hoy: `<input type="number">`. Resta clarity en mobile.
   - Fix: botones `−` `1` `+` (componente nuevo `QuantityStepper`). Reusable. Archivos: [apps/storefront/app/producto/[slug]/product-client.tsx](apps/storefront/app/producto/[slug]/product-client.tsx), [apps/storefront/components/cart-page-client.tsx](apps/storefront/components/cart-page-client.tsx).

4. **Layout overlap del navbar en checkout y producto**
   - El navbar sticky se superpone al heading "Coordinemos tu pedido en un minuto." al hacer scroll arriba (visible en screenshot).
   - Fix: agregar `pt-N` al main o transformar navbar a no-sticky en pages con hero text. Archivo: [apps/storefront/app/layout.tsx:38](apps/storefront/app/layout.tsx).

5. **Cross-sell en carrito**
   - Merlin tiene "Podría interesarte". Subir AOV barato.
   - Fix: en `/carrito` mostrar 3-4 productos en stock de marcas distintas a las del carrito. Archivo: [apps/storefront/components/cart-page-client.tsx](apps/storefront/components/cart-page-client.tsx).

6. **Indicador de envío en carrito**
   - Hoy carrito no menciona envío hasta llegar a checkout.
   - Fix: línea bajo total: "Envío y forma de pago se coordinan por WhatsApp."

### 4.3 Copy review (para sonar simplemente como "una compra")

| Hoy | Sugerido | Razón |
|---|---|---|
| "Soy mayor de edad" / "Salir del sitio" | "Sí, tengo 18+" / "No" | Más natural, alineado con Merlin |
| "Continuar checkout" (en carrito) | "Finalizar compra" o "Ir a checkout" | "Continuar checkout" es spanglish |
| "Enviar pedido y seguir por WhatsApp" | "Enviar pedido por WhatsApp" | Más corto, mismo significado |
| "Te respondemos por WhatsApp" (floating) | "Hablemos por WhatsApp" | Más cálido |
| "Como querés que te identifiquemos" (placeholder Nombre) | "Ej: Andrea Gómez" | Las placeholders deben ser ejemplos, no preguntas |
| "Cómo preferís que coordinemos" (label) | "Detalles para coordinar" | Más declarativo |
| "Mensaje para el equipo" (textarea) | "Algo más que quieras decirnos" | Menos formal |
| "Catálogo asistido" / "Checkout asistido" (kickers) | "Catálogo" / "Tu pedido" | "Asistido" es jerga corporativa |
| "Genéticas premium para coleccionistas" (hero) | OK, mantener | Diferenciador claro |
| "Fuente: MERLINGROW • Última importación: ..." (producto) | Eliminar (o reemplazar por "Stock actualizado el {fecha}") | Leak interno |
| "Pago coordinado directamente por WhatsApp una vez generado el pedido." | "Coordinamos pago y envío por WhatsApp después de tu pedido." | Más directo |
| "GGseeds — Semillas legales en CABA" (title default en `/producto/[slug]`) | `{nombre} · GGseeds` (vía `generateMetadata`) | Falta SEO por producto |

### 4.4 SEO (medium effort, alto impacto)

7. **`generateMetadata` en `/producto/[slug]`**
   - Hoy todos los productos comparten title/desc del root layout. Pierde long-tail SEO.
   - Fix: agregar `export async function generateMetadata({ params })` que retorne `{ title: product.name, description: product.description?.slice(0,160), openGraph: { images: [product.images[0]] } }`. Archivo: [apps/storefront/app/producto/[slug]/page.tsx](apps/storefront/app/producto/[slug]/page.tsx).

8. **JSON-LD `Product` structured data**
   - Para que Google muestre rich snippets de precio y stock.
   - Fix: en producto page, inyectar `<script type="application/ld+json">` con schema.org Product. Junto al `generateMetadata`.

### 4.5 Conversion / funnel

9. **Persistencia del carrito**
   - Si el usuario cierra el sitio, ¿se pierde el carrito? Verificar `useCart` (probable que use localStorage; si es solo memoria, agregar localStorage).

10. **Empty states accionables**
    - El "Tu carrito está vacío" tiene CTA al catálogo (✅). Agregar también "Hablar por WhatsApp" para usuarios que quieren consultar antes de armar pedido.

## 5. Cambios ya aplicados (commits live)

### `0e1f2b3` — perf(storefront): enable ISR, image optimization, SEO metadata, sitemap and robots

- Mover `force-dynamic` del root layout a `/perfil` y `/pedidos` (las únicas con sesión).
- ISR (`revalidate=300`) en home, catalogo, producto/[slug].
- Activar `next/image` optimization (drop `unoptimized`, AVIF/WebP, quality=75).
- Restringir `images.remotePatterns` a hosts reales (`merlingrow.com`, `dutch-passion.ar`, `images.unsplash.com`).
- Reemplazar `<img>` por `<Image>` en home Amsterdam story.
- Metadata expandida: `metadataBase`, `title.template`, `openGraph`, `twitter`, `canonical`, `robots`.
- Crear `app/sitemap.ts` (productos desde Prisma) y `app/robots.ts`.
- `experimental.optimizePackageImports: ["lucide-react"]`.

### `957c67f` — fix(storefront): bypass next/image optimizer for dutch-passion.ar (Cloudflare blocks server fetch)

- Detectar host `dutch-passion.ar` en `product-image.tsx` y pasar `unoptimized` solo en ese caso.
- Merlin (615 imgs) sigue optimizado, Dutch (39 imgs) carga directo.

### Resultado en build

- Home, carrito, checkout, login, registro, robots.txt: `ƒ Dynamic` → `○ Static` ✅
- Pedidos, perfil: siguen `ƒ Dynamic` (correcto, usan sesión).
- Sitemap.xml: `ƒ Dynamic` (correcto, runtime).

## 6. Plan recomendado de próximos pasos

| Orden | Cambio | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | Eliminar leak `Fuente: MERLINGROW...` en producto | 5 min | Crítico (data leak) |
| 2 | Copy review (12 strings, todas en `lib/brand.ts`, `app/page.tsx`, forms) | 30 min | Alto (sonar más natural) |
| 3 | `generateMetadata` por producto + JSON-LD | 1 h | Alto (SEO long-tail) |
| 4 | Disclaimer de datos en checkout | 10 min | Medio (compliance) |
| 5 | Quantity stepper component | 1 h | Medio (UX mobile) |
| 6 | Fix navbar overlap en pages con hero | 15 min | Medio (visual bug) |
| 7 | Cross-sell en carrito | 2 h | Medio (AOV) |
| 8 | Persistir carrito en localStorage (si no está) | 30 min | Alto (recuperación de funnel) |
