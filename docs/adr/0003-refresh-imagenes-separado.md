# ADR 0003

## Titulo

Refresco de imagenes separado del import de catalogo

## Estado

Aprobado

## Contexto

Algunos productos importados pueden quedar con URLs de imagen viejas, incompletas o erroneas aunque precio y stock sigan correctos. Reimportar todo el catalogo para corregir solo imagenes es mas costoso y menos controlable.

## Decision

Agregar un flujo separado `refresh-images` que:

- recorre productos importados existentes
- usa `sourceMeta.sourceUrl`
- vuelve a extraer imagenes desde el origen
- actualiza `Product.images` solo si encuentra una lista valida distinta
- no pisa imagenes si el extractor vuelve vacio

## Consecuencias

Positivas:

- permite mantenimiento fino sin tocar precios ni stock
- reduce riesgo de degradar productos ya correctos
- es facil de correr desde CLI, ECS o panel admin

Negativas:

- agrega una accion operativa mas al ETL
- no reemplaza al import normal, lo complementa
