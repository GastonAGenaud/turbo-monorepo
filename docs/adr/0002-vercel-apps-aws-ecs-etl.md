# ADR 0002

## Titulo

Vercel para apps y AWS ECS para ETL

## Estado

Aprobado

## Contexto

Las apps web necesitan deploy barato y simple. El ETL requiere una ejecucion aislada, con networking y dependencia opcional de Playwright.

## Decision

- desplegar `storefront` y `admin` en Vercel
- ejecutar imports y tareas de scraping en AWS ECS Fargate
- usar ECR para la imagen del scraper
- disparar el ETL diario desde EventBridge

## Consecuencias

Positivas:

- separacion clara entre UI y trabajo pesado
- el scraper no bloquea el runtime web
- cron y secretos quedan del lado AWS

Negativas:

- hay dos plataformas operativas
- los imports remotos requieren credenciales AWS desde admin o GitHub Actions
