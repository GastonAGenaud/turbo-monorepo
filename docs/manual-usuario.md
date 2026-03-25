# Manual de Usuario

## Storefront

### Ingreso al sitio

Al abrir la tienda aparece un popup de descargo legal:

- confirma mayoría de edad
- recuerda que la venta es para coleccionismo y preservación genética
- indica que pago y envío se coordinan por WhatsApp

El popup se guarda localmente en el navegador para no repetirse en cada visita.

En mobile el modal usa un layout tipo sheet, con scroll interno y botones a ancho completo para no romper el viewport.

### Home

La portada nueva muestra:

- hero principal con identidad visual inspirada en Amsterdam
- categorías destacadas
- novedades en stock
- sección narrativa de marca
- accesos directos a catálogo, contacto y WhatsApp

### Catálogo

En `/catalogo` se puede:

- buscar por texto
- filtrar por categoría
- filtrar por marca
- ver solo productos disponibles
- ordenar por novedad o precio

### Producto

Cada ficha de producto muestra:

- nombre y marca
- precio final
- estado de stock
- galería de imágenes
- botón de agregar al carrito
- botón de consulta por WhatsApp

### Carrito y checkout

El carrito permite:

- cambiar cantidad
- quitar productos
- avanzar a checkout

En checkout:

- se piden solo nombre, WhatsApp y barrio o ciudad
- email y dirección exacta quedan como opcionales
- se puede dejar una preferencia de contacto o un mensaje útil para el equipo
- se genera la orden
- se abre WhatsApp para coordinar pago, envío o retiro con administración

### Registro y login

El registro ahora incluye:

- nombre
- email
- contraseña
- captcha matemático firmado por el servidor

El captcha ayuda a reducir altas automáticas.

Además:

- en registro y login hay salida directa a WhatsApp para usuarios que prefieren no crear cuenta
- el login recuerda mejor el flujo de seguimiento de pedidos y coordinación

## Admin

### Experiencia visual

El panel ahora comparte la misma dirección visual del storefront:

- tipografía editorial
- panels con glass effect
- navegación superior persistente
- headers más claros por sección
- mejor jerarquía para productos, órdenes, ETL y auditoría

### Panel de imports

En `/imports` ahora se ve:

- estado general del ETL
- último run
- métricas recientes
- runs en curso
- historial con badges y errores expandibles

Acciones disponibles:

- importar MerlinGrow
- importar Dutch Passion
- importar todo
- refrescar imágenes por source
- refrescar imágenes de todo el catálogo importado

## Soporte operativo

Canal principal de atención:

- WhatsApp `+54 9 351 326-1149`
