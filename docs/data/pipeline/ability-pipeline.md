---
Estado: "activo"
Rol: "Describir el flujo de datos de ability stats desde captura hasta runtime"
Version: "v0.1.0"
Impacto_ID: "D-Abilities-Pipeline"
Fidelidad_Fisica: "Project/scripts/apply-ability-md.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-22"
---

# Ability Stats Pipeline

## Flujo operativo

```
references/game-ui/<Warframe>.md        ← fuente semántica (anotaciones manuales $/$$ + //!)
         ↓
  apply-ability-md.ts                   ← npm run apply:ability -- ../references/game-ui/<Warframe>.md
  (parser + merge en un paso)
         ↓
ability-stats.override.json             ← groups/stats actualizados; name/desc/image_name intactos
         ↓
  generate-data.ts + @wfcd/items        ← aporta name, description, image_name desde DE
         ↓
  StaticHydrator (runtime)
```

## Artefactos y roles

| Archivo | Rol |
|---|---|
| `references/game-ui/<Warframe>.md` | **Fuente semántica**. Captura de UI + anotaciones `$`/`$$`. Spec: `references/game-ui/README.md`. |
| `Project/scripts/apply-ability-md.ts` | Parser + merge. Produce `groups[]` planos y aplica al override sin tocar otros campos. |
| `Project/scripts/parse-ability-md.ts` | Solo parser (stdout JSON). Para inspección sin modificar el override. |
| `Project/public/data/ability-stats.override.json` | **Runtime SSoT**. No se edita a mano para `groups`/`stats`. |
| `Project/src/core/engine/hydration/StaticHydrator.ts` | Consumidor final en el engine. |

## Reglas de operación

1. **Fuente única**: `groups`/`stats` solo se modifican vía `apply-ability-md.ts`. No editar el JSON a mano.
2. **Preservación**: `name`, `description`, `image_name` vienen de `@wfcd/items` — el script no los toca.
3. **Shorthands activos**: `$STRENGTH` · `$RANGE` · `$DURATION` · `$EFFICIENCY` · `$DRAIN` — aliases del parser a tokens completos.
4. **`//!` edge-cases**: Anotaciones en `.md` que emiten `console.warn` en el script — registran mecánicas sin modelar sin bloquear el pipeline.
5. **Fidelidad numérica**: Números europeos (`.` = miles, `,` = decimal) convertidos a lógicos por el parser. Los `.md` son capturas fieles del juego.
