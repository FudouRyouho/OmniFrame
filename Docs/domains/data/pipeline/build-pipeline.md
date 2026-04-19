# Build Pipeline

> Estado: activo — **Verificado 2026-04-18**
> Rol: describir la función de `generate-data.ts` en el flujo de normalización de datos

## Responsabilidades del Pipeline de Build

El motor de generación de datos (`Project/scripts/generate-data.ts`) es el responsable de transformar la fuente cruda de `@wfcd/items` en los datasets consumibles por el Resolver del proyecto.

1.  **Mapeo Fiel**: Respeta la estructura canónica del dataset base.
2.  **Normalización Determinista**: Convierte formatos crudos (porcentajes, snake_case) a los contratos del Engine.
3.  **Modularización**: Delega la limpieza de taxonomías específicas a módulos en `Project/scripts/normalization/` (Polaridad, Armas, Arcanos, etc.).
4.  **Generación de Artefactos**: Produce los archivos JSON en `Project/public/data/` que sirven de base al runtime.

## Reglas de Operación

- **Desacoplamiento**: El pipeline automático NO toca los archivos de override manual (`ability-stats.override.json`). Estos se integran posteriormente en la fase de resolución.
- **Determinismo**: No se inyecta conocimiento manual ni se completan mecanicas desde evidencia externa en esta fase. Si no es derivable de la fuente, no pertenece a `generate-data`.
- **Observabilidad**: El pipeline reporta valores desconocidos o "gaps" de normalización para asegurar la integridad de los datos.

---

### Notas de Integridad
Para la jerarquía de roles entre la capa generada y la capa de override manual, consultar la guía de gobernanza de datos del proyecto.
