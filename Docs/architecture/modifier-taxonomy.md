# Modifier Taxonomy — Estado actual

> Estado: referencia
> Última actualización: 2026-03-19
> Contexto: documentar el sistema de scaling de habilidades y el rol del override de mods
> tras la adopción de `upgradeTypes` como fuente canónica.

---

## 1. AbilityScaling — escalado de habilidades

Usado en `ability-stats.json` para indicar cómo escala cada stat de una habilidad
con los mods del Warframe.

```ts
// types.ts
export type AbilityScaling =
  | 'STRENGTH'      // escala con Ability Strength (Intensify, etc.)
  | 'RANGE'         // escala con Ability Range (Stretch, etc.)
  | 'DURATION'      // escala con Ability Duration (Continuity, etc.)
  | 'EFFICIENCY'    // escala con Ability Efficiency (Streamline, etc.)
  | 'ENERGY_DRAIN'  // coste de energía por segundo (afectado por Efficiency)
  | 'NONE';         // valor fijo, no escala con ningún mod de warframe
```

La wiki usa `AVATAR_ABILITY_STRENGTH`, `AVATAR_ABILITY_RANGE`, etc. Usamos la versión
corta — es una decisión de diseño válida, no un error.

`AbilityModifier` es un alias de compatibilidad que apunta a `AbilityScaling`.

---

## 2. upgradeTypes — fuente canónica para mods

`upgradeTypes[]` en `mods.json` (post-fork) identifica sin ambigüedad qué stat modifica
cada mod. Cubre el ~85% de los mods de armas. Ver `decisions/mods-builder-analysis.md` §2
para la tabla completa de tipos y su semántica.

El builder consume `upgradeTypes` directamente — no necesita un tipo `ModModifier`
inventado para los mods estándar.

---

## 3. Override — solo para gaps canónicos

El override (`mod-stats.json`) es un complemento quirúrgico. No define qué stat modifica
un mod — eso es `upgradeTypes`. Solo cubre:

| Caso | Campo en el override |
|---|---|
| Progresión no lineal (Primed, Galvanized, Archon) | `values[]` explícitos por rango |
| Augmentos UNIQUE (`upgradeTypes: []`) | `misc: []` — placeholder, sin poblar hasta que el builder lo necesite |
| Tipo de daño elemental (si no se amplía el fork) | `damageType` como fallback temporal |
| Condiciones de activación (si no se amplía el fork) | `condition` como fallback temporal |

Los campos `damageType` y `condition` son fallbacks temporales que desaparecen cuando
D2 (ampliar el fork con `DamageType`, `ValidPostures`, `ValidProcTypes`) esté implementado.

---

## 4. ModModifier — obsoleto

El tipo `ModModifier` con valores como `DAMAGE_BASE`, `CRIT_CHANCE`, `MULTISHOT`, etc.
fue diseñado antes de tener `upgradeTypes`. Es redundante e inferior a la fuente canónica.

No implementar. No usar en código nuevo. Los archivos `mod.*.stats.json` existentes
contienen estos valores como contexto histórico — no son la fuente de verdad.

---

## 5. Relación entre los dos sistemas

| | AbilityScaling | upgradeTypes |
|---|---|---|
| Contexto | Cómo escala un stat de habilidad | Qué stat modifica el mod |
| Ejemplos | `STRENGTH` → afectado por Intensify | `AVATAR_ABILITY_STRENGTH` → Intensify mismo |
| Consumidor | Motor de cálculo de habilidades | Motor de cálculo de builds |
| Fuente | Diseño propio (versión corta de la wiki) | Public Export de DE (canónico) |

Son complementarios. El builder usa ambos: `upgradeTypes` para saber qué hace el mod,
`AbilityScaling` para saber cómo ese efecto impacta en las habilidades del Warframe.

---

## Referencias

- `decisions/mods-builder-analysis.md` §2 — tabla completa de upgradeTypes
- `decisions/open-questions.md` §D1 — decisión sobre el override
- `architecture/mod-stats-gap.md` — gaps que el override cubre
