# Documentacion GGseeds

Esta carpeta concentra la documentacion operativa del proyecto.

## Indice

- [Inventario AWS](/Users/gastongenaud/Documents/Github/GGseeds/docs/aws-inventario.md)
- [Usuarios y Accesos](/Users/gastongenaud/Documents/Github/GGseeds/docs/usuarios-y-accesos.md)
- [Manual de Usuario](/Users/gastongenaud/Documents/Github/GGseeds/docs/manual-usuario.md)
- [Diagramas](/Users/gastongenaud/Documents/Github/GGseeds/docs/diagramas.md)
- [Runbook Operativo](/Users/gastongenaud/Documents/Github/GGseeds/docs/runbook-operativo.md)
- [ADRs](/Users/gastongenaud/Documents/Github/GGseeds/docs/adr/README.md)

## Alcance

Incluye:

- recursos AWS actualmente desplegados
- distincion entre recursos creados por CloudFormation y recursos gestionados manualmente
- usuarios tecnicos y accesos del proyecto
- diagramas de arquitectura y flujo de importacion
- pasos operativos frecuentes

No incluye secretos ni passwords en texto plano. Las credenciales deben leerse desde variables de entorno o AWS Secrets Manager.
