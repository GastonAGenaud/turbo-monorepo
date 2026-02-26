# GGseeds Monorepo

E-commerce completo para **GGseeds** (venta de semillas legales en CABA), orientado a bajo costo operativo y despliegue simple para una sola persona.

## Stack

- Monorepo: Turborepo + pnpm
- Frontend: Next.js App Router + TypeScript estricto
- UI: Tailwind + componentes reutilizables tipo shadcn (`@ggseeds/ui`)
- Backend/API: Route Handlers en Next
- DB: PostgreSQL (Docker local, Neon/Supabase en producción)
- ORM: Prisma (schema + migración + seed)
- Auth: NextAuth con credenciales
- Scraping/ETL: Playwright + Cheerio
- Jobs: endpoint cron protegido + `vercel.json` en `apps/admin`
- Logs: pino + auditoría de `ImportRun`

## Estructura

```text
apps/
  storefront/   # Tienda pública (catálogo, carrito, checkout, perfil)
  admin/        # Panel admin (productos, categorías, órdenes, importador)
packages/
  db/           # Prisma schema, migraciones, seed, client y upsert importado
  scrapers/     # Adaptadores MerlinGrow / DutchPassion + runner ETL
  shared/       # tipos, zod, pricing, rate-limit, logger
  ui/           # componentes UI compartidos
```

## Funcionalidades implementadas

### Storefront (`apps/storefront`)

- Home con branding GGseeds (dark/light, neon accent, copy legal)
- Catálogo con búsqueda, filtros (categoría/marca/disponibilidad) y orden
- Detalle de producto con stock y precio final
- Carrito persistente (`localStorage`) + sync server-side para usuario logueado
- Checkout (crea `Order` en estado `PENDING`)
- Registro/login
- Perfil editable (nombre/teléfono/dirección)
- Historial de órdenes

### Admin (`apps/admin`)

- Login y protección por rol `ADMIN`
- Dashboard con métricas (órdenes pendientes, stock bajo, últimos imports)
- CRUD de productos
- Gestión de categorías
- Gestión de órdenes y cambio de estado
- Gestión básica de usuarios
- Pantalla de importación manual por fuente o total
- Historial de `ImportRun` y errores por item

### ETL/Scraping (`packages/scrapers`)

- Adaptadores:
  - `MerlinGrowScraper`
  - `DutchPassionScraper`
- Respeto de `robots.txt` (best effort)
- `User-Agent` identificable
- Rate limit configurable + reintentos con backoff
- Parseo robusto con selectores centralizados
- Sanitización de descripciones
- Upsert por `(source, externalId)`
- Markup configurable (default 15%)
- Precio final: `round(basePrice * (1 + markup/100), 2)`
- Si stock no es detectable, se guarda `stock = null` + `stockStatus = UNKNOWN`

## Cumplimiento scraping

- Solo lectura de contenido público.
- Sin acciones destructivas ni interacción autenticada.
- Si `robots.txt` bloquea, el importador no fuerza acceso y continúa en modo best effort.
- Si un sitio cambia HTML o bloquea scraping:
  - fallback recomendado: carga manual desde admin,
  - o integración API oficial del proveedor (si existe).

## Modelo de datos

Incluye, entre otros:

- `User`, `Profile`, `Category`, `Product`, `ProductSourceMeta`
- `Cart`, `CartItem`
- `Order`, `OrderItem`
- `ImportRun`, `ImportRunItemError`
- `Setting`

## Levantar local

### 1) Requisitos

- Node 20+
- pnpm 9+
- Docker

### 2) Variables

```bash
cp .env.example .env
```

### 3) Base de datos local

```bash
docker compose up -d
```

### 4) Instalar y preparar Prisma

```bash
pnpm install
pnpm db:generate
pnpm --filter @ggseeds/db db:migrate:dev
pnpm db:seed
```

### 5) Ejecutar apps

Terminal 1:
```bash
pnpm --filter @ggseeds/storefront dev
```

Terminal 2:
```bash
pnpm --filter @ggseeds/admin dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3001](http://localhost:3001)

## Usuario admin seed

Se crea con:

- `ADMIN_EMAIL` (default: `admin@ggseeds.local`)
- `ADMIN_PASSWORD` (default: `Admin1234!`)

Podés cambiar ambas en `.env` antes de correr `pnpm db:seed`.

## Importación manual

Desde scripts:

```bash
pnpm import:merlin
pnpm import:dutch
pnpm import:all
```

Desde UI admin:

- `/imports` -> botones:
  - Importar/Actualizar MerlinGrow
  - Importar/Actualizar Dutch Passion
  - Importar todo

## Cron (Vercel)

`apps/admin/vercel.json` configura un cron diario a `/api/cron/imports`.

Endpoint protegido por token Bearer:

- `IMPORT_CRON_TOKEN` o `CRON_SECRET`

Ejemplo manual:

```bash
curl -X POST https://tu-admin.vercel.app/api/cron/imports \
  -H "Authorization: Bearer $IMPORT_CRON_TOKEN"
```

## Deploy barato (recomendado)

### Opción recomendada

- DB: Neon o Supabase Postgres
- Frontend/API:
  - Proyecto Vercel 1: `apps/storefront`
  - Proyecto Vercel 2: `apps/admin`

### Pasos

1. Crear DB Postgres en Neon/Supabase.
2. Cargar `DATABASE_URL` en ambos proyectos Vercel.
3. Configurar envs en ambos proyectos:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `MARKUP_PERCENT_DEFAULT`
   - `IMPORT_CRON_TOKEN` / `CRON_SECRET`
4. En build/deploy, ejecutar migraciones:
   - `pnpm --filter @ggseeds/db db:migrate`
5. Seed inicial (una vez):
   - `pnpm db:seed`
6. Deploy storefront y admin desde monorepo (Root Directory por app).
7. Verificar cron en proyecto admin.

## Calidad y seguridad

- TypeScript estricto
- Validación de inputs con Zod
- Tests unitarios para pricing y utils de scrapers
- Smoke tests de endpoints health
- Headers de seguridad en middleware
- Rate limit básico en endpoints sensibles (registro/cron)
- Auth + control de rol en admin y APIs admin

## Scripts útiles

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm import:all
```

## Nota de pagos

MercadoPago no está bloqueando el flujo principal: checkout funcional en modo pedido pendiente (`PENDING`). Integración real puede agregarse como módulo opcional sin romper el core.
