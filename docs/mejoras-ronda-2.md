# Ronda 2 de mejoras — GGseeds (post-deploy 2026-04-30)

Fecha: **2026-04-30**
Referencias visuales: [Greenhouse Coffeeshops](https://greenhousecoffeeshops.com/) (Amsterdam, premium/heritage) y [Basta de Lobby](https://bastadelobby.com/) (Buenos Aires, growshop directo).
Commit live: `ccdbead` sobre `957c67f` y `0e1f2b3`.

## 1. Verificación post-deploy de la ronda 1

| Fix | Verificación | Estado |
|---|---|---|
| 1. Leak `Fuente: MERLINGROW` | Reemplazado por "Stock actualizado el 26/3/2026." | ✅ |
| 2. Navbar overlap | Opacidad 80→95, heading se lee limpio sin bleed-through | ✅ |
| 3. `generateMetadata` por producto | Title `<nombre> — <brand> · GGseeds`, og:title/desc/url, JSON-LD `Product` | ✅ |
| 4. Copy review | "Tu pedido", "Finalizar compra", "Ej: Andrea Gómez", "Detalles para coordinar", "Algo más que quieras decirnos", "Enviar pedido por WhatsApp", "Hablemos por WhatsApp", "Consultar por WhatsApp", "Coordinamos pago y envío..." | ✅ |
| 5. Disclaimer datos | "Tus datos se usan únicamente para coordinar tu pedido por WhatsApp. No los compartimos con terceros." encima del CTA | ✅ |

Curl checks:
- `curl -s .../producto/<slug> | grep -oE "<title>[^<]*</title>"` → título per-producto correcto.
- 1 bloque `application/ld+json` por página de producto.
- og: meta tags presentes.

## 2. Comparación con referencias

| Aspecto | Greenhouse (premium/heritage) | Basta de Lobby (growshop AR) | GGseeds (hoy) |
|---|---|---|---|
| Background | Negro puro + acentos amarillo | Blanco utilitario + verde | Oscuro editorial + verde menta |
| Copy hero | "Welcome to Paradise" + "Creators of Champions Since 1985" | "SI COMPRÁS HOY ANTES DE LAS 13:00 HS" | "Genéticas premium para coleccionistas." |
| Stats / autoridad | "0+ Years of Experience" / "0+ Awards" | No | No |
| Hall of Fame / testimonios | Sí (Snoop Dogg, Mike Tyson…) | No | No |
| Reviews 5★ | Sí (carrusel) | No | No |
| Trust badges row | "Awards", "Cuelloshops in Amsterdam" | "ENVÍOS A TODA LA ARGENTINA · TODAS LAS FORMAS DE PAGO · DESCUENTO 10% · COMUNICATE" | No |
| Brand logos row | Implícito en brand grid | "Nuestras marcas" | No |
| Cutoff de envío | No | "Antes de 13:00 hs llega entre 16-22 hs" | No (todo por WhatsApp) |
| Local físico CTA | "Visit the Hall of Fame" / "View Cookies Lounge" | "¡Vení a Visitarnos!" con foto | No (es 100% remoto) |
| Hero image | Foto real del coffeeshop | Mano + paquete (humano) | SVG sintético + Sketchfab card |
| Newsletter | No | Sí | No |
| Categorías iconográficas | Brand cards | Iconos | Cards estéticos (mantener) |

GGseeds está más cerca del polish editorial de Greenhouse que del approach utilitario de Basta. Pero le faltan elementos de **autoridad**, **prueba social** y **claridad operativa** que aportan ambas referencias.

## 3. Nuevas mejoras propuestas

### 3.1 Autoridad y prueba social (inspiración: Greenhouse)

1. **Banda de stats** debajo del hero
   - "+650 genéticas curadas · X bancos seleccionados · X envíos coordinados desde 2026"
   - Si los counts reales son bajos, formular en términos atemporales: "Curado en CABA · Selección de bancos europeos · Atención humana".
   - Implementación: server component que lee de Prisma (`Product.count`, `distinct brand`, `Order.count`).
   - Archivo: nuevo `apps/storefront/components/store-stats.tsx`, montar en `app/page.tsx` debajo del hero.
   - **Riesgo**: LOW.

2. **Trust badges row** ("franja negra" estilo Basta de Lobby)
   - 4 ítems: "Envíos a CABA y todo el país · Coordinación 100% por WhatsApp · Stock actualizado a diario · Atención humana, no bots"
   - Visual: row horizontal con iconos `lucide-react` (Truck, MessageCircle, RefreshCw, User), border top + bottom.
   - Archivo: nuevo `apps/storefront/components/trust-row.tsx`, mostrar en home (debajo de hero) y opcionalmente en footer.
   - **Riesgo**: LOW.

3. **Brand showcase en home**
   - Sección "Bancos en el catálogo" con logos / nombres de los bancos disponibles (Dutch Passion, Royal Queen Seeds, etc.). Click → filtra catálogo por brand.
   - Implementación: server query `db.product.groupBy({ by: ['brand'], _count })`, render como grid de chips o cards.
   - Archivo: nuevo `apps/storefront/components/brand-showcase.tsx`, mostrar entre hero y "Categorías".
   - **Riesgo**: LOW.

### 3.2 Claridad operativa (inspiración: Basta de Lobby)

4. **Banner de envío contextual**
   - "Hoy coordinamos envíos hasta las 19:00 hs · Resto del país: 24-72 hs según zona"
   - Mostrar como banda fina sobre el navbar o en el hero card.
   - Si no hay cutoff real, omitir y solo dejar "Coordinamos por WhatsApp · Lun-Vie · 10:00 a 19:00".
   - Archivo: actualizar `apps/storefront/components/store-navbar.tsx` para aceptar un slot superior, o crear `apps/storefront/components/promo-banner.tsx`.
   - **Riesgo**: LOW.

5. **CTA "Hablar antes de comprar" más prominente en home**
   - Hoy el WhatsApp flotante existe, pero el primary CTA es "Explorar catálogo". Para usuarios que prefieren consultar primero (común en este nicho), agregar `Button variant="outline"` en el hero: "Consultar por WhatsApp" al lado de "Explorar catálogo".
   - Archivo: [apps/storefront/app/page.tsx](apps/storefront/app/page.tsx) líneas 60-69 (zona del hero CTA).
   - **Riesgo**: LOW.

### 3.3 UX de catálogo y producto

6. **Botón "Comprar" rápido en cada card del catálogo** (inspiración: Basta)
   - Hoy cada card es un link a detalle. Agregar un botón secundario "Agregar" que use `useCart` + `setQuantity(productId, 1)`.
   - Cuidado: mantiene el link al detalle como acción principal (los productos del catálogo de seeds suelen requerir lectura), el "Agregar" es atajo opcional.
   - Archivo: [apps/storefront/components/product-card.tsx](apps/storefront/components/product-card.tsx).
   - **Riesgo**: MEDIUM (cambia interacción del catálogo).

7. **Quantity stepper component**
   - Reemplazar el `<input type="number">` del carrito y producto por componente `QuantityStepper` con botones `−` / valor / `+`.
   - Archivo: nuevo `apps/storefront/components/quantity-stepper.tsx`. Consumidores: `cart-page-client.tsx`, `producto/[slug]/product-client.tsx`.
   - **Riesgo**: LOW.

8. **Image zoom en producto**
   - Greenhouse y Merlin Seeds tienen lupa al hover. Para galería de hasta 4 imágenes, click en thumbnail → swap principal; click en principal → modal con zoom (lightbox simple).
   - Archivo: [apps/storefront/app/producto/[slug]/page.tsx](apps/storefront/app/producto/[slug]/page.tsx) (zona galería líneas 86-105 del archivo nuevo).
   - **Riesgo**: MEDIUM (componente nuevo, accesibilidad).

### 3.4 Conversion / funnel

9. **Persistir carrito en localStorage**
   - Verificar `apps/storefront/components/cart-provider.tsx`. Si solo es state en memoria, agregar persistencia. Si ya está, documentarlo.
   - **Riesgo**: LOW.

10. **Cross-sell en carrito** (Merlin: "Podría interesarte")
    - 3-4 productos en stock de marcas distintas a las del carrito, mostrados debajo del total con foto + precio + "Agregar".
    - Archivo: [apps/storefront/components/cart-page-client.tsx](apps/storefront/components/cart-page-client.tsx).
    - **Riesgo**: LOW.

11. **Newsletter optional en footer**
    - "Recibí novedades del catálogo y reposiciones, una vez por semana. Sin spam."
    - Backend: tabla `Subscriber { email, createdAt }` o servicio externo (Mailchimp/Resend).
    - **Riesgo**: MEDIUM (requiere backend nuevo, GDPR-style consent).

### 3.5 Copy del hero (microcopy)

| Hoy | Sugerido | Razón |
|---|---|---|
| "Genéticas premium para coleccionistas." | "Genéticas premium, curadas en Buenos Aires." | Más específico, sumá origen |
| "Curamos semillas de bancos reconocidos para coleccionismo y preservación genética. Catálogo vivo, trato directo y coordinación simple desde CABA a todo el país." | Mantener pero acortar a 2 frases | Lectura rápida en mobile |
| "Stock real / Colección curada / Atención humana" (highlights) | "Selección curada / Stock actualizado / Atención por WhatsApp" | "Real" suena defensivo; "WhatsApp" explicita el canal |
| "De los canales de Amsterdam a tu colección." | OK, mantener | Hook editorial fuerte |

### 3.6 Heading SEO y JSON-LD adicional

12. **JSON-LD Organization en root layout**
    - Agregar `<script type="application/ld+json">` con `Organization` + `ContactPoint` + `Address` + `sameAs` (instagram).
    - Archivo: [apps/storefront/app/layout.tsx](apps/storefront/app/layout.tsx).
    - **Riesgo**: LOW. SEO long-term.

13. **JSON-LD BreadcrumbList en producto y catálogo**
    - Para que Google muestre breadcrumbs en los resultados.
    - **Riesgo**: LOW.

## 4. Prioridad recomendada

| Orden | Tema | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | Trust badges row + Stats + Brand showcase (3 componentes) | 2-3 h | Alto (autoridad inmediata) |
| 2 | Quantity stepper + persistencia localStorage del carrito | 1.5 h | Alto (UX + recuperación funnel) |
| 3 | CTA dual en hero ("Consultar por WhatsApp" + "Explorar catálogo") | 15 min | Medio |
| 4 | Cross-sell en carrito | 2 h | Medio (AOV) |
| 5 | JSON-LD Organization + BreadcrumbList | 30 min | Medio (SEO long-term) |
| 6 | Image zoom en producto | 2 h | Medio |
| 7 | Banner de envío contextual | 30 min | Medio |
| 8 | Newsletter en footer | 4 h | Bajo-Medio (depende del effort backend) |

## 5. Lo que NO conviene copiar de las referencias

- **Greenhouse Hall of Fame** — está bien para una marca de 40 años con celebrities reales; en GGseeds suena vacío.
- **Basta cutoff de horario fijo** — solo si efectivamente operan así. Si la coordinación es siempre 1:1 por WhatsApp, mejor no prometer ventana.
- **Pago con tarjeta / múltiples pasarelas** (estilo WooCommerce) — el modelo de GGseeds es WhatsApp-first. Mantener.
- **Carrito clásico con cupones / códigos** — overkill mientras la operación sea manual.

## 6. Pendientes técnicos identificados durante la verificación

- En checkout, el bloque "Te pedimos solo lo necesario para avanzar" repite "El pago se coordina directamente por WhatsApp una vez generado el pedido" que ya aparece arriba en el bloque "Cómo sigue después de enviar el pedido". Mantener uno solo.
- `apps/storefront/.env.local` tiene `DATABASE_URL="*"` (placeholder) que rompe el build local. Documentado en memoria; no es bloqueante pero conviene limpiar.
- Hay decenas de archivos duplicados con sufijo " 2" (`audit 2.ts`, `brand 2.ts`, etc.) en el repo. Higiene del filesystem; ninguno se referencia en imports.
