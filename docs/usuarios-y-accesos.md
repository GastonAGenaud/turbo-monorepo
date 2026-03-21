# Usuarios y Accesos

## Aplicacion

### Roles de negocio

- `ADMIN`: acceso total al panel admin, imports, productos, ordenes y usuarios.
- `CUSTOMER`: usuario comprador con perfil e historial de ordenes.
- visitante anonimo: navega, arma carrito y puede avanzar a checkout.

## Creacion del usuario admin

El admin de aplicacion no se guarda en codigo. Se genera o actualiza desde variables de entorno al correr el seed.

Variables relevantes:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Implementacion:

- [seed.ts](/Users/gastongenaud/Documents/Github/GGseeds/packages/db/prisma/seed.ts)

Comando:

```bash
pnpm db:seed
```

Comportamiento actual del seed:

- crea el admin si no existe
- actualiza password si el email ya existe
- promueve el usuario a rol `ADMIN`
- si se cambia el bootstrap admin historico, lo desactiva

### Alta manual recomendada

Para crear o rotar el admin del proyecto:

```bash
export ADMIN_EMAIL="tu-email@dominio.com"
export ADMIN_PASSWORD="tu-password-segura"
pnpm db:seed
```

Nota:

- no versionar el password en archivos del repo
- en produccion conviene inyectar estas variables desde Vercel o desde el entorno del job que corre `db:seed`

## Autenticacion

La autenticacion usa `NextAuth` con `CredentialsProvider`.

Referencias:

- [apps/storefront/lib/auth.ts](/Users/gastongenaud/Documents/Github/GGseeds/apps/storefront/lib/auth.ts)
- [apps/admin/lib/auth.ts](/Users/gastongenaud/Documents/Github/GGseeds/apps/admin/lib/auth.ts)

Flujo:

1. el usuario envia email y password
2. se busca `User` por email en PostgreSQL
3. se valida `passwordHash` con `bcrypt`
4. se emite sesion JWT
5. middleware protege `/admin`

## Usuarios tecnicos AWS

### Creados por CloudFormation

| Recurso | Uso |
|---|---|
| `ggseeds-prod-admin-import` | Usuario tecnico con permisos acotados para disparar tasks ECS desde el panel admin desplegado en Vercel |
| `ggseeds-prod-scraper-exec` | Execution role de ECS para leer secrets y bajar imagen de ECR |
| `ggseeds-prod-scraper-task` | Task role del contenedor scraper |
| `ggseeds-prod-events` | Role usado por EventBridge para lanzar la task diaria |

### Gestion manual

| Recurso | Uso |
|---|---|
| `ggseeds-github-actions-deploy` | Role asumido por GitHub Actions via OIDC para desplegar infraestructura |
| `token.actions.githubusercontent.com` | OIDC provider de GitHub en AWS |

## Donde viven las credenciales

- `DATABASE_URL`: AWS Secrets Manager o `.env`
- `IMPORT_CRON_TOKEN`: AWS Secrets Manager o variables de Vercel
- `ADMIN_EMAIL` y `ADMIN_PASSWORD`: variables de entorno, no git
- credenciales del usuario tecnico ECS admin import: secret `AdminImportCredentialsSecretArn`

## Recomendaciones operativas

- no guardar passwords en markdown ni commits
- rotar `ADMIN_PASSWORD` si se expuso en terminal, chat o logs
- preferir `Secrets Manager` y Vercel envs para produccion
- dejar el usuario admin con email personal solo si es una cuenta controlada por vos
