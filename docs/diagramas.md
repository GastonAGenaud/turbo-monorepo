# Diagramas

## Arquitectura general

```mermaid
flowchart LR
    User["Cliente / Admin"] --> Storefront["Vercel - Storefront Next.js"]
    User --> Admin["Vercel - Admin Next.js"]
    Storefront --> DB["PostgreSQL"]
    Admin --> DB
    Admin --> ECS["AWS ECS Fargate"]
    ECS --> DB
    ECS --> Merlin["merlingrow.com"]
    ECS --> Dutch["dutch-passion.ar"]
    EventBridge["AWS EventBridge"] --> ECS
    ECR["AWS ECR"] --> ECS
    Secrets["AWS Secrets Manager"] --> ECS
    SSM["AWS SSM Parameter"] --> ECS
    Logs["CloudWatch Logs"] <-- ECS
```

## Flujo de importacion

```mermaid
sequenceDiagram
    participant A as Admin UI
    participant API as Admin API
    participant ECS as ECS Task
    participant SRC as Sitio origen
    participant DB as PostgreSQL

    A->>API: POST /api/admin/imports
    API->>ECS: RunTask(command=import source)
    ECS->>SRC: Lee sitemap y paginas publicas
    ECS->>ECS: Normaliza stock, precio e imagenes
    ECS->>DB: Upsert Product + ProductSourceMeta
    ECS->>DB: Registra ImportRun
```

## Flujo de refresco de imagenes

```mermaid
flowchart TD
    Start["refresh-images"] --> Load["Leer productos importados con sourceMeta"]
    Load --> Fetch["Fetch pagina origen"]
    Fetch --> Extract["Extraer imagenes markup + JSON-LD"]
    Extract --> Compare{"Cambio respecto a DB?"}
    Compare -- "No" --> Skip["Skip"]
    Compare -- "Si" --> Update["Actualizar Product.images"]
    Skip --> End["Log summary"]
    Update --> End
```

## Relacion de despliegue

```mermaid
flowchart LR
    GitHub["GitHub repo"] --> Vercel["Vercel deploy storefront/admin"]
    GitHub --> Actions["GitHub Actions"]
    Actions --> CFN["CloudFormation"]
    CFN --> AWS["AWS recursos base"]
    Actions --> ECR["Build/push scraper image"]
    ECR --> ECS["ECS task latest"]
```
