# Runbook Operativo

## Tareas frecuentes

### 1. Levantar local

```bash
docker compose up -d
pnpm install
pnpm db:generate
pnpm --filter @ggseeds/db db:migrate:dev
pnpm db:seed
pnpm --filter @ggseeds/storefront dev
pnpm --filter @ggseeds/admin dev
```

### 2. Reimportar catalogo

```bash
pnpm import:all
```

Por source:

```bash
pnpm import:merlin
pnpm import:dutch
```

### 3. Refrescar imagenes ya importadas

```bash
pnpm import:images
```

Por source:

```bash
pnpm import:images:merlin
pnpm import:images:dutch
```

Con limite para pruebas:

```bash
pnpm import:images:merlin 10
```

### 4. Rotar usuario admin

```bash
export ADMIN_EMAIL="tu-email@dominio.com"
export ADMIN_PASSWORD="tu-password-segura"
pnpm db:seed
```

### 5. Ver logs del worker

```bash
/opt/homebrew/bin/aws logs tail /aws/ecs/ggseeds/prod/imports \
  --region us-east-1 \
  --follow
```

### 6. Ejecutar import remoto en ECS

```bash
/opt/homebrew/bin/aws ecs run-task \
  --region us-east-1 \
  --cluster arn:aws:ecs:us-east-1:387416083876:cluster/ggseeds-prod-cluster \
  --task-definition arn:aws:ecs:us-east-1:387416083876:task-definition/ggseeds-prod-scraper:2 \
  --launch-type FARGATE \
  --count 1 \
  --network-configuration 'awsvpcConfiguration={subnets=[subnet-07b408c9aa5f32411,subnet-0050bcba0c7bb6320],securityGroups=[sg-01ef38f7bb55d60d6],assignPublicIp=ENABLED}'
```

### 7. Publicar nueva imagen del scraper

```bash
export PATH="/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:$PATH"
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 387416083876.dkr.ecr.us-east-1.amazonaws.com
docker buildx build \
  --platform linux/amd64 \
  -f Dockerfile.scraper \
  -t 387416083876.dkr.ecr.us-east-1.amazonaws.com/ggseeds-prod-scraper:latest \
  --push .
```

## Checklists

### Antes de deploy

- `pnpm --filter @ggseeds/scrapers test`
- `pnpm --filter @ggseeds/db test`
- `pnpm --filter @ggseeds/scrapers build`
- `pnpm --filter @ggseeds/db build`

### Despues de deploy del scraper

- revisar que la imagen nueva este en ECR
- correr una task manual corta
- verificar `exitCode: 0`
- revisar `ImportRun` en admin

## Incidentes comunes

### El refresh de imagenes falla local con `localhost:5432`

Causa:

- no esta levantado el PostgreSQL local

Resolucion:

```bash
docker compose up -d
```

o exportar `DATABASE_URL` al entorno correcto.

### ECS queda en `PENDING`

Causas comunes:

- imagen aun no disponible
- networking o subnets
- capacidad transitoria de Fargate

Chequeos:

```bash
/opt/homebrew/bin/aws ecs describe-tasks --region us-east-1 --cluster arn:aws:ecs:us-east-1:387416083876:cluster/ggseeds-prod-cluster --tasks TASK_ARN
```

### Imagen remota se ve rota en storefront

Chequeos:

- revisar `Product.images` en DB
- correr `pnpm import:images`
- revisar adaptador del source
- validar que la URL no sea `data:` o relativa sin normalizar
