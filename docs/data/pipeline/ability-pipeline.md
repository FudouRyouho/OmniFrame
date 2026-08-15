---
Estado: "activo"
Rol: "Describir el flujo de datos de ability stats desde captura hasta runtime"
Impacto_ID: "D-Abilities-Pipeline"
Fidelidad_Fisica: "Project/scripts/apply-ability-md.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-26"
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
| `Project/src/core/engine/resolve/hydration/StaticHydrator.ts` | Consumidor final en el engine. |

## Referencias wiki (`references/wiki/sources/`)

Los módulos Lua de la wiki son referencia pasiva — nunca fuente primaria del pipeline. No se editan sin autorización.

| Módulo | Utilidad | Notas |
|---|---|---|
| `maximization-data.lua` | **Alta** — contiene estructuras de fórmulas por stat (`{'STR * 800', 'Mirror damage'}`, `{'(2 - EFF) * 75', 'Energy'}`). Fuente para verificar multi-scaling y fórmulas no convencionales. | Algunas entradas están vacías (ej: Mass Vitrify, línea ~519). Puede estar desactualizado. |
| `ability-data-stats.lua` | **Baja** — es esencialmente una versión oficial más antigua de nuestro override (mismas keys `/Lotus/...`, mismo vocabulario `AVATAR_ABILITY_*`). Nuestro schema ya lo supera. | 7288 líneas. Útil como fallback para warframes sin `.md`. No modela exaltadas antiguas. |
| `damage-types-data.lua` | Referencia de tipos de daño — `DT_*` tokens. | Ver `docs/semantic/` para el vocabulario operativo. |
| `mods-data.lua` | Referencia de mods. | Pipeline independiente. |
| `text-icons-data.lua` / `text-icons.lua` | Mapeo de iconos de texto del juego. | Usados para `<DT_*>` en labels. |

**Workflow de consulta de fórmulas:** si un stat tiene `upgrade_by` con múltiples tokens o lógica no convencional, buscar en `maximization-data.lua` la entrada correspondiente. Si está vacía o ausente → registrar en OQ-W-7.

## Reglas de operación

1. **Fuente única**: `groups`/`stats` solo se modifican vía `apply-ability-md.ts`. No editar el JSON a mano.
2. **Preservación**: `name`, `description`, `image_name` vienen de `@wfcd/items` — el script no los toca.
3. **Shorthands activos**: `$STRENGTH` · `$RANGE` · `$DURATION` · `$EFFICIENCY` · `$DRAIN` — aliases del parser a tokens completos.
4. **`//!` edge-cases**: Anotaciones en `.md` que emiten `console.warn` en el script — registran mecánicas sin modelar sin bloquear el pipeline.
5. **Fidelidad numérica**: Números europeos (`.` = miles, `,` = decimal) convertidos a lógicos por el parser. Los `.md` son capturas fieles del juego.
