# ADR 0001

## Titulo

Monorepo con Next.js y paquetes compartidos

## Estado

Aprobado

## Contexto

GGseeds necesita operar storefront, admin, base de datos, scrapers y UI compartida con bajo costo operativo y mantenimiento simple para una sola persona.

## Decision

Usar un monorepo con `pnpm` y `Turborepo`, separando:

- `apps/storefront`
- `apps/admin`
- `packages/db`
- `packages/scrapers`
- `packages/shared`
- `packages/ui`

## Consecuencias

Positivas:

- una sola fuente de verdad para tipos y utilidades
- deploy desacoplado entre apps y worker
- mejor reutilizacion de componentes y validaciones

Negativas:

- el workspace requiere disciplina con scripts y builds
- cambios pequenos pueden impactar varios paquetes
