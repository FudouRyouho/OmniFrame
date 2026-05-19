# Ability Stats Pipeline

> Estado: activo — **Verificado 2026-04-18**
> Rol: describir el flujo de datos entre los RIPS semánticos y el runtime del proyecto

## Flujo Operativo

```text
Captura (Manual/Script)
  -> references/semantic-ui-rips/*.md (Gramática Semantic Format)
  -> utilities/parse-semantic.mjs
  -> parsed-output.json (Estructura intermedia de groups)

Consolidación (Fase Actual)
  -> Merge manual/asistido de groups hacia:
     Project/public/data/ability-stats.override.json

Publicación (Runtime)
  -> El Engine integra el JSON mediante inyección de dependencias en el Resolver.
```

## Artefactos y Roles

| Archivo | Rol en el Pipeline |
| :--- | :--- |
| `references/semantic-ui-rips/*.md` | **Fuente de Verdad Semántica**. No se modifican manualmente tras la captura. |
| `utilities/parse-semantic.mjs` | Extractor de gramática. Transforma MD en objetos JSON de `groups[]`. |
| `Project/public/data/...overrides.json` | **Runtime y Almacén Temporal**. Actualmente actúa como SSoT por deuda técnica. |
| `Project/src/core/engine/sim-v2/logic/StaticHydrator.ts` | Consumidor final. Carga la data del JSON en el motor sim-v2. |

## Reglas de Procesamiento

1.  **Fidelidad**: El parser solo extrae valores y etiquetas. Los nombres (`name`) e iconos (`icon`) se gestionan en la fase de consolidación en el JSON.
2.  **Placeholder**: Por defecto, los stats nuevos entran con `upgradeBy: "NONE"`. La asignación de la variable de escalado correcta (`STR`, `DUR`, etc.) es una tarea de revisión técnica.
3.  **No Redundancia**: No se deben guardar copias de estos datos en la carpeta `docs/`. La documentación reside en los esquemas; la data reside en el JSON y los RIPS.

---

### Notas Operativas
El flujo de pipeline garantiza la trazabilidad entre la captura semántica y el runtime del proyecto.
