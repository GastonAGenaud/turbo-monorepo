# GGseeds Monorepo

E-commerce completo para **GGseeds** (venta de semillas legales en CABA), preparado para:

- `storefront` y `admin` en Vercel
- PostgreSQL barato en Neon/Supabase o local con Docker
- imports/scraping en AWS ECS Fargate
- despliegue de infra AWS desde GitHub con CloudFormation

## Documentacion

Documentacion operativa y de infraestructura:

- [docs/README.md](/Users/gastongenaud/Documents/Github/GGseeds/docs/README.md)
- [docs/manual-usuario.md](/Users/gastongenaud/Documents/Github/GGseeds/docs/manual-usuario.md)
- [docs/branding.md](/Users/gastongenaud/Documents/Github/GGseeds/docs/branding.md) — logo, iconos derivados, OG/Twitter images
- [docs/flujo-e2e-prod.md](/Users/gastongenaud/Documents/Github/GGseeds/docs/flujo-e2e-prod.md) — flujo end-to-end + comparativa con Merlin Seeds
- [docs/mejoras-ronda-2.md](/Users/gastongenaud/Documents/Github/GGseeds/docs/mejoras-ronda-2.md) — plan de mejoras post-deploy + Greenhouse + Basta de Lobby

## Estado actual

Implementado y probado en local:

- catálogo, carrito, checkout, auth y perfil
- admin con CRUD de productos/órdenes/imports
- admin actualizado con shell visual alineada al storefront
- edición manual de `basePrice` y `markupPercent` desde admin con recálculo de `finalPrice`
- import real desde MerlinGrow y Dutch Passion hacia PostgreSQL
- CloudFormation validado por AWS CLI

Pruebas locales realizadas:

- import MerlinGrow: `created 3 / updated 0 / failed 0`
- import Dutch Passion: `created 3 / updated 0 / failed 0`
- edición de precio desde UI admin sobre producto importado:
  - `basePrice: 18000`
  - `markupPercent: 20`
  - `finalPrice: 21600`

## Arquitectura

- `apps/storefront`: tienda pública Next.js
- `apps/admin`: panel admin Next.js
- `packages/db`: Prisma schema, migraciones, seed, client
- `packages/scrapers`: ETL/scrapers MerlinGrow y Dutch Passion
- `packages/shared`: tipos, validaciones, pricing, logger
- `packages/ui`: componentes UI compartidos
- `infra/cloudformation/ggseeds-stack.yaml`: infra principal AWS
- `infra/cloudformation/ggseeds-github-oidc.yaml`: bootstrap OIDC para GitHub Actions

### Modos de ejecución de imports

- `inline`: corre el import en el mismo proceso del admin. Ideal para local/dev.
- `ecs`: el admin en Vercel dispara una task en AWS ECS Fargate. Recomendado en producción.

## Stack

- Monorepo: Turborepo + pnpm
- Frontend/API: Next.js App Router + TypeScript
- UI: Tailwind + librería compartida `@ggseeds/ui`
- DB: PostgreSQL + Prisma
- Auth: NextAuth Credentials
- Scraping: Cheerio + Playwright opcional en Docker worker
- Logs: pino + auditoría `ImportRun`
- AWS: CloudFormation + ECS Fargate + EventBridge + ECR + Secrets Manager + SSM

## Modelo de datos

Incluye:

- `User`, `Profile`
- `Category`, `Product`, `ProductSourceMeta`
- `Order`, `OrderItem`
- `Cart`, `CartItem`
- `ImportRun`, `ImportRunItemError`
- `Setting`

Migraciones nuevas aplicadas en esta iteración:

- `202603211410_add_category_deleted_at`
- `202603211415_sync_production_schema`

Estas migraciones alinean la base productiva con el schema actual de Prisma para storefront, auth y auditoría admin.

## UX reciente

- storefront migrado a una dirección visual editorial inspirada en Amsterdam
- popup legal de mayoría de edad persistente y ajustado para mobile
- registro con captcha matemático firmado por servidor
- admin con shell, login y vistas principales rediseñadas para mayor claridad operativa
- checkout simplificado: nombre, WhatsApp y zona como núcleo; email y dirección exacta opcionales
- CTA directos a WhatsApp en login, registro, carrito y checkout
- copy del storefront ajustado para un tono más humano y profesional

## Levantar local

### Requisitos

- Node 22+
- pnpm 9+
- Docker

### 1. Variables

```bash
cp .env.example .env
```

### 2. Base local

```bash
docker compose up -d
pnpm install
pnpm db:generate
pnpm --filter @ggseeds/db db:migrate:dev
pnpm db:seed
```

### 3. Apps

Terminal 1:

```bash
pnpm --filter @ggseeds/storefront dev
```

Terminal 2:

```bash
pnpm --filter @ggseeds/admin dev
```

URLs:

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3001](http://localhost:3001)

Admin seed:

- Email: `admin@ggseeds.local`
- Password: `Admin1234!`

## Imports locales

Los scripts CLI ahora cargan `.env` automáticamente desde la raíz del repo.

```bash
pnpm import:merlin
pnpm import:dutch
pnpm import:all
```

Para pruebas cortas:

```bash
SCRAPER_MAX_PRODUCTS=5 pnpm import:all
```

Comportamiento:

- discovery por sitemap público
- respeta `robots.txt`
- user-agent identificable
- reintentos con backoff
- upsert por `(source, externalId)`
- aplica markup por `MARKUP_PERCENT_DEFAULT` o `Setting.defaultMarkupPercent`

## Admin: edición de precios

El formulario de producto permite editar:

- `basePrice`
- `markupPercent`
- `stock`
- `stockStatus`
- `source`

La UI muestra preview de `finalPrice` y el backend recalcula:

```txt
finalPrice = round(basePrice * (1 + markupPercent / 100), 2)
```

## Infra AWS

La infraestructura está pensada para este modelo:

- Vercel: `storefront` + `admin`
- AWS: worker de imports en ECS Fargate
- DB: Neon/Supabase recomendado

### Archivo principal

`infra/cloudformation/ggseeds-stack.yaml`

Provisiona:

- S3 bucket de assets
- Secrets Manager para `DATABASE_URL` y cron secret
- SSM parameter para markup
- CloudWatch log group para imports
- ECR repository para el worker
- ECS cluster + task definition
- EventBridge rule diaria para correr imports
- IAM user y credenciales limitadas para que el admin en Vercel pueda lanzar imports en ECS

### Bootstrap GitHub OIDC

Primera vez, una sola vez por cuenta AWS:

```bash
aws cloudformation deploy \
  --stack-name ggseeds-github-oidc \
  --template-file infra/cloudformation/ggseeds-github-oidc.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    GitHubOwner=TU_USUARIO_O_ORG \
    GitHubRepository=GGseeds \
    GitHubBranch=main
```

Guardá el output `GitHubDeployRoleArn` como secret de GitHub:

- `AWS_GITHUB_DEPLOY_ROLE_ARN`

### Deploy AWS desde GitHub

Workflow:

- `.github/workflows/deploy-aws-infra.yml`

Secrets requeridos en GitHub:

- `AWS_GITHUB_DEPLOY_ROLE_ARN`
- `AWS_DATABASE_URL`
- `IMPORT_CRON_TOKEN`

Variables recomendadas en GitHub:

- `AWS_REGION`
- `AWS_STACK_NAME`
- `AWS_ENVIRONMENT`
- `AWS_VPC_ID`
- `AWS_ECS_SUBNET_IDS`
- `SCRAPER_SCHEDULE_EXPRESSION`
- `MARKUP_PERCENT_DEFAULT`

Qué hace el workflow:

1. asume rol por OIDC
2. valida el template
3. despliega/actualiza CloudFormation
4. resuelve el output del ECR repo
5. build + push de `Dockerfile.scraper`

## Deploy en Vercel

Workflow:

- `.github/workflows/deploy-vercel.yml`

Secrets requeridos en GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_STOREFRONT`
- `VERCEL_PROJECT_ID_ADMIN`

### Proyectos Vercel

- proyecto 1: `apps/storefront`
- proyecto 2: `apps/admin`

### Variables para `storefront`

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `MARKUP_PERCENT_DEFAULT`

### Variables para `admin`

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_NEXTAUTH_URL`
- `ADMIN_APP_URL`
- `MARKUP_PERCENT_DEFAULT`
- `SCRAPER_CONCURRENCY`
- `SCRAPER_DELAY_MS`
- `SCRAPER_MAX_RETRIES`
- `SCRAPER_TIMEOUT_MS`
- `IMPORT_CRON_TOKEN`
- `IMPORT_EXECUTION_MODE=ecs`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ECS_CLUSTER_ARN`
- `AWS_ECS_TASK_DEFINITION_ARN`
- `AWS_ECS_CONTAINER_NAME`
- `AWS_ECS_SUBNET_IDS`
- `AWS_ECS_SECURITY_GROUP_IDS`

### De dónde sale cada variable AWS

Desde outputs del stack `ggseeds-stack`:

- `ScraperClusterArn` -> `AWS_ECS_CLUSTER_ARN`
- `ScraperTaskDefinitionArn` -> `AWS_ECS_TASK_DEFINITION_ARN`
- `ScraperContainerName` -> `AWS_ECS_CONTAINER_NAME`
- `ScraperSubnetIds` -> `AWS_ECS_SUBNET_IDS`
- `ScraperSecurityGroupId` -> `AWS_ECS_SECURITY_GROUP_IDS`

Desde el secret de AWS generado por CloudFormation:

- `AdminImportCredentialsSecretArn`
  - contiene `AWS_ACCESS_KEY_ID`
  - contiene `AWS_SECRET_ACCESS_KEY`

### Sincronización automática a Vercel

Scripts:

- [render-admin-env.sh](/Users/gastongenaud/Documents/Github/GGseeds/scripts/aws/render-admin-env.sh)
- [render-storefront-env.sh](/Users/gastongenaud/Documents/Github/GGseeds/scripts/aws/render-storefront-env.sh)
- [sync-admin-env.sh](/Users/gastongenaud/Documents/Github/GGseeds/scripts/vercel/sync-admin-env.sh)
- [sync-storefront-env.sh](/Users/gastongenaud/Documents/Github/GGseeds/scripts/vercel/sync-storefront-env.sh)

Renderizar variables del admin desde AWS:

```bash
STACK_NAME=ggseeds-prod AWS_REGION=us-east-1 pnpm aws:render:admin-env
```

Subir variables AWS-derived directamente a Vercel admin:

```bash
export VERCEL_TOKEN=...
export VERCEL_ORG_ID=...
export VERCEL_PROJECT_ID_ADMIN=...
export STACK_NAME=ggseeds-prod
export AWS_REGION=us-east-1

pnpm vercel:sync:admin-env
```

Subir las variables AWS-derived del storefront:

```bash
export VERCEL_TOKEN=...
export VERCEL_ORG_ID=...
export VERCEL_PROJECT_ID_STOREFRONT=...
export STACK_NAME=ggseeds-prod
export AWS_REGION=us-east-1

pnpm vercel:sync:storefront-env
```

Esto sincroniza:

- `DATABASE_URL`
- `IMPORT_CRON_TOKEN`
- `MARKUP_PERCENT_DEFAULT`
- `IMPORT_EXECUTION_MODE`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ECS_CLUSTER_ARN`
- `AWS_ECS_TASK_DEFINITION_ARN`
- `AWS_ECS_CONTAINER_NAME`
- `AWS_ECS_SUBNET_IDS`
- `AWS_ECS_SECURITY_GROUP_IDS`

Para storefront sincroniza:

- `DATABASE_URL`
- `MARKUP_PERCENT_DEFAULT`

## LocalStack

Se agregó soporte de stack en modo local:

- `DeploymentMode=local`
- omite ECS/ECR/EventBridge
- crea recursos compatibles con LocalStack

Archivos:

- `docker-compose.localstack.yml`
- `scripts/localstack/deploy-cloudformation.sh`

Comandos:

```bash
pnpm infra:local:up
pnpm infra:local:deploy
pnpm infra:local:down
```

El script:

1. valida el template
2. despliega CloudFormation contra `http://localhost:4566`
3. lista outputs del stack
4. verifica el bucket S3 creado

Nota realista:

- en esta máquina, `aws cloudformation validate-template` pasó
- el pull de la imagen `localstack/localstack:3.4` quedó bloqueado por Docker sin devolver progreso, así que el template y el script están listos pero la prueba de deploy completo depende de que Docker termine de descargar esa imagen

## Docker worker

Archivo:

- `Dockerfile.scraper`

Construcción local:

```bash
pnpm docker:scraper:build
```

El worker:

- usa imagen base de Playwright
- instala dependencias del monorepo
- ejecuta `pnpm import:all`

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
pnpm infra:validate
pnpm infra:local:up
pnpm infra:local:deploy
pnpm infra:local:down
```

## Seguridad y operación

- validación con Zod
- auth + rol `ADMIN`
- rate limit en endpoints sensibles
- logs estructurados con pino
- imports auditables en `ImportRun`
- scraper en modo best effort si cambia el HTML o hay bloqueo parcial

## Qué quedó funcional

- imports MerlinGrow y Dutch Passion con data real
- cálculo de markup y precio final persistido
- admin editando precios de productos importados
- dispatcher de imports local `inline`
- dispatcher de imports productivo `ecs`
- template principal AWS validado
- workflows de GitHub para AWS y Vercel

## Siguientes pasos recomendados

1. crear el stack bootstrap OIDC en AWS
2. configurar secrets/vars en GitHub
3. correr `deploy-aws-infra.yml`
4. copiar outputs/secrets del stack a Vercel envs
5. correr `deploy-vercel.yml`
