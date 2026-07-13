---
Estado: "activo"
Rol: "Contrato semántico de tipos de daño y sus mapeos"
Version: "v0.0.3"
Impacto_ID: "semantic-damage"
Fidelidad_Fisica: "Project/src/shared/types/damage.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-13"
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

> El código rastrea ESTADO solo para los 4 efectos con LEY que resuelve en C1 hoy (Corrosion,
> Infection, Ignite, Disruption) — `EnemyStatusState` keyeado por efecto. Ese subconjunto es
> conocimiento del engine (`TrackedStatusEffect` en `formulas/status/stack-debuff.ts`, subtipo del
> canónico verificado por `Extract`); el NOMBRE del efecto se **DERIVA** de `@shared` vía
> `effectOfDamageType`, ya no se reimplementa (`EFFECT_BY_DAMAGE_TYPE` retirado 2026-07-13;
> `EFFECT_BY_DOT_KEY` ahora derivado — solo persiste el key legacy `damage_*_dot` de `dot_pools`).

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
