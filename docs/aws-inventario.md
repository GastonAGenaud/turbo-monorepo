# Inventario AWS

Ultima verificacion: `2026-03-21`

Region principal: `us-east-1`

Stack principal:

- Nombre: `ggseeds-prod`
- ARN: `arn:aws:cloudformation:us-east-1:387416083876:stack/ggseeds-prod/2ba73f20-2484-11f1-ab0d-0ee0ea002b47`
- Estado: `UPDATE_COMPLETE`

## Recursos administrados por CloudFormation

### Storage y configuracion

| Recurso | Tipo | Identificador |
|---|---|---|
| Assets bucket | `AWS::S3::Bucket` | `ggseeds-prod-assets-387416083876-us-east-1` |
| Database URL secret | `AWS::SecretsManager::Secret` | `arn:aws:secretsmanager:us-east-1:387416083876:secret:/ggseeds/prod/database-url-R60mqt` |
| Cron secret | `AWS::SecretsManager::Secret` | `arn:aws:secretsmanager:us-east-1:387416083876:secret:/ggseeds/prod/cron-secret-dJryi6` |
| Admin import credentials secret | `AWS::SecretsManager::Secret` | `arn:aws:secretsmanager:us-east-1:387416083876:secret:/ggseeds/prod/admin-import-credentials-U6fRlO` |
| Markup parameter | `AWS::SSM::Parameter` | `/ggseeds/prod/markup-percent` |
| Log group imports | `AWS::Logs::LogGroup` | `/aws/ecs/ggseeds/prod/imports` |

### Base de datos

| Recurso | Tipo | Identificador |
|---|---|---|
| RDS instance | `AWS::RDS::DBInstance` | `ggseeds-prod-db` |
| RDS ARN | `AWS::RDS::DBInstance` | `arn:aws:rds:us-east-1:387416083876:db:ggseeds-prod-db` |
| Endpoint | `RDS endpoint` | `ggseeds-prod-db.cniw4qskolus.us-east-1.rds.amazonaws.com` |
| Puerto | `PostgreSQL` | `5432` |
| Motor | `postgres` | `17.6` |
| DB name | `PostgreSQL` | `ggseeds` |
| DB subnet group | `AWS::RDS::DBSubnetGroup` | `ggseeds-prod-databasesubnetgroup-7hm5wj7gijye` |
| DB security group | `AWS::EC2::SecurityGroup` | `sg-0be901aa5a3bb78f5` |

### ECS y worker de imports

| Recurso | Tipo | Identificador |
|---|---|---|
| ECS cluster | `AWS::ECS::Cluster` | `ggseeds-prod-cluster` |
| ECS cluster ARN | `AWS::ECS::Cluster` | `arn:aws:ecs:us-east-1:387416083876:cluster/ggseeds-prod-cluster` |
| ECR repository | `AWS::ECR::Repository` | `ggseeds-prod-scraper` |
| ECR URI | `AWS::ECR::Repository` | `387416083876.dkr.ecr.us-east-1.amazonaws.com/ggseeds-prod-scraper` |
| Task definition family | `AWS::ECS::TaskDefinition` | `ggseeds-prod-scraper` |
| Task definition actual | `AWS::ECS::TaskDefinition` | `arn:aws:ecs:us-east-1:387416083876:task-definition/ggseeds-prod-scraper:2` |
| Container name | `ECS container` | `ggseeds-scraper` |
| Imagen actual | `ECR image` | `387416083876.dkr.ecr.us-east-1.amazonaws.com/ggseeds-prod-scraper:latest` |
| CPU | `Fargate` | `512` |
| Memoria | `Fargate` | `1024` |
| Security group worker | `AWS::EC2::SecurityGroup` | `sg-01ef38f7bb55d60d6` |
| Subnets worker | `AWS subnet` | `subnet-07b408c9aa5f32411`, `subnet-0050bcba0c7bb6320` |

### Scheduler

| Recurso | Tipo | Identificador |
|---|---|---|
| EventBridge rule | `AWS::Events::Rule` | `ggseeds-prod-daily-import` |
| EventBridge ARN | `AWS::Events::Rule` | `arn:aws:events:us-east-1:387416083876:rule/ggseeds-prod-daily-import` |
| Schedule | `cron` | `cron(0 10 * * ? *)` |
| Target ECS cluster | `AWS::Events::Target` | `arn:aws:ecs:us-east-1:387416083876:cluster/ggseeds-prod-cluster` |
| Target task definition | `AWS::Events::Target` | `arn:aws:ecs:us-east-1:387416083876:task-definition/ggseeds-prod-scraper:2` |

### IAM del stack

| Recurso | Tipo | Identificador |
|---|---|---|
| Scheduler invoke role | `AWS::IAM::Role` | `ggseeds-prod-events` |
| Scraper execution role | `AWS::IAM::Role` | `ggseeds-prod-scraper-exec` |
| Scraper task role | `AWS::IAM::Role` | `ggseeds-prod-scraper-task` |
| Admin import user | `AWS::IAM::User` | `ggseeds-prod-admin-import` |

Nota:

- El `AWS::IAM::AccessKey` del usuario `ggseeds-prod-admin-import` existe, pero su valor literal no debe documentarse en git.
- Las credenciales vigentes deben leerse desde el secret `AdminImportCredentialsSecretArn`.

## Configuracion actual del worker

Task definition actual:

- Family: `ggseeds-prod-scraper`
- Revision: `2`
- Runtime: `LINUX / X86_64`
- Launch type: `FARGATE`
- Command por default: `pnpm import:all`
- Secret inyectado: `DATABASE_URL`

Variables de entorno declaradas en la task:

- `LOG_LEVEL=info`
- `MARKUP_PERCENT_DEFAULT=15`
- `SCRAPER_CONCURRENCY=2`
- `SCRAPER_DELAY_MS=800`
- `SCRAPER_MAX_RETRIES=3`
- `SCRAPER_TIMEOUT_MS=15000`
- `SCRAPER_MAX_PRODUCTS=40`

## Recursos fuera del stack principal

Estos recursos existen hoy en la cuenta AWS, pero no cuelgan del stack `ggseeds-prod`.

### GitHub Actions OIDC

| Recurso | Tipo | Identificador |
|---|---|---|
| GitHub OIDC provider | `AWS::IAM::OIDCProvider` | `arn:aws:iam::387416083876:oidc-provider/token.actions.githubusercontent.com` |
| Deploy role GitHub | `AWS::IAM::Role` | `arn:aws:iam::387416083876:role/ggseeds-github-actions-deploy` |
| Role name | `AWS::IAM::Role` | `ggseeds-github-actions-deploy` |
| Role id | `AWS::IAM::Role` | `AROAVUM6MJWSGVGYZTHAI` |

Restriccion actual del trust policy:

- repo: `GastonAGenaud/turbo-monorepo`
- branch: `main`
- audience: `sts.amazonaws.com`

## Comandos utiles

Ver outputs del stack:

```bash
/opt/homebrew/bin/aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name ggseeds-prod
```

Ver recursos del stack:

```bash
/opt/homebrew/bin/aws cloudformation list-stack-resources \
  --region us-east-1 \
  --stack-name ggseeds-prod
```

Ver task definition:

```bash
/opt/homebrew/bin/aws ecs describe-task-definition \
  --region us-east-1 \
  --task-definition ggseeds-prod-scraper:2
```
