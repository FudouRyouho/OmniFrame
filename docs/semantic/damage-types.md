---
Estado: "activo"
Rol: "Contrato semántico de tipos de daño y sus mapeos"
Impacto_ID: "semantic-damage"
Fidelidad_Fisica: "Project/src/shared/types/damage.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-24"
---

# DamageType — Semántica Canónica

## Catálogo de Daños

El sistema unifica los tipos de daño bajo una taxonomía canónica (lowercase), resolviendo las inconsistencias de los tokens raw del juego.

| Familia | Miembros |
| :--- | :--- |
| **Físico** | `impact`, `puncture`, `slash` |
| **Elemental Base** | `heat`, `cold`, `electricity`, `toxin` |
| **Combinado** | `blast`, `corrosive`, `gas`, `magnetic`, `radiation`, `viral` |
| **Especial** | `void`, `tau` (Sentient), `true` (Finisher) |

## Mapeo tipo de daño → efecto de estado (Arista 1)

El **tipo de daño** y el **efecto de estado** que dispara son cosas distintas: `corrosive` es el tipo,
`Corrosion` es el efecto; `viral` es el tipo, `Infection` el efecto (por sí solo no hace daño, amplifica
el daño recibido). Este mapeo es **1:1 e identidad fija** (heat solo puede producir Ignite, nunca
Corrosion) — es vocabulario, la "Arista 1" de [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §14.

La tabla lista **el nombre display**. El **token canónico-máquina** del efecto vive en
`Project/src/shared/types/damage.ts` (campo `statusEffect` por tipo + helper `effectOfDamageType`) —
esa es la SSoT que el engine deriva; NO se replica como tabla espejo acá (evita re-sombrear el
vocabulario). La **fórmula** de cada efecto (qué hace N stacks) tampoco vive acá — es mecánica:
`references/wiki/mechanics/status-effects.md` + `Project/src/core/engine/formulas/status/` (ejes ortogonales).

| Tipo de daño | Efecto de estado | Categoría |
|---|---|---|
| `impact` | Stagger | CC |
| `puncture` | Weakened | Debuff |
| `slash` | Bleed | DoT |
| `heat` | Ignite | DoT + Debuff |
| `cold` | Freeze | CC |
| `electricity` | Tesla Chain | CC |
| `toxin` | Poison | DoT |
| `blast` | Detonation | CC |
| `corrosive` | Corrosion | Stack Debuff |
| `gas` | Gas Cloud | DoT (AoE) |
| `magnetic` | Disruption | Stack Debuff |
| `radiation` | Confusion | CC |
| `viral` | Infection | Stack Debuff |
| `void` | Bullet Attraction | CC |
| `tau` | Tau | Debuff |
| `true` | — (no dispara proc) | — |

> El engine modela ESTADO para los 6 efectos con `EffectBehavior` hoy (Bleed, Poison, Ignite,
> Corrosion, Infection, Disruption) — un contenedor único `Map<StatusEffect, S>` + registro
> `EFFECT_BEHAVIORS` (una fórmula por efecto), no una tabla de estado por-tipo. El NOMBRE del efecto se
> **DERIVA** de `@shared` vía `effectOfDamageType` (Arista 1), ya no se reimplementa: las tablas-sombra
> `EFFECT_BY_DAMAGE_TYPE`/`EFFECT_BY_DOT_KEY` y los subtipos `TrackedStatusEffect`/`EnemyStatusState`
> fueron **retirados** (modelo unificado de proc + saneamiento). Ver
> [`../domains/engine/design/damage-status-model.md §Modelo unificado de proc`](../domains/engine/design/damage-status-model.md).

## Resolución de Tags Raw (`DT_*`)

El proyecto resuelve automáticamente los tags de la fuente (ej: en descripciones de habilidades o stats de armas) mediante `resolveDamageTypeTag()`.

- **Patrón**: `DT_<UPPER>` (con sufijos `_COLOR` u `_OUTLINE` opcionales) → `DamageType` canónico.
- **Ejemplo**: `DT_EXPLOSION` o `DT_BLAST_COLOR` se resuelven como `blast`.

## Implementación Técnica

- **Lógica**: `Project/src/shared/types/damage.ts` (Tipo, mapeos y resolución).
- **UI**: `Project/src/lib/presentation/icons/IconDamageType.tsx` provee el renderizado de iconos canónicos.
- **Dataset**: Los campos `damage: DamageMap` en los JSONs de items ya contienen las keys canónicas normalizadas.

---

### Notas Operativas
Este documento es la referencia para asegurar que cualquier nuevo dato inyectado al sistema respete la nomenclatura de daños unificada para el cálculo y la visualización.
