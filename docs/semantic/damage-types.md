---
Estado: "activo"
Rol: "Contrato semántico de tipos de daño y sus mapeos"
Impacto_ID: "semantic-damage"
Fidelidad_Fisica: "Project/src/shared/types/damage.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-08-06"
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

| Tipo de daño | Efecto de estado | `PT_*` (token DE) | Categoría |
|---|---|---|---|
| `impact` | Stagger ⚠️ | `PT_KNOCKBACK` | CC |
| `puncture` | Weakened | `PT_FRAILTY` | Debuff |
| `slash` | Bleed | `PT_BLEEDING` | DoT |
| `heat` | Ignite | `PT_IMMOLATION` | DoT + Debuff |
| `cold` | Freeze | `PT_CHILLED` | CC |
| `electricity` | Tesla Chain | `PT_ELECTROCUTION` | CC |
| `toxin` | Poison | `PT_POISONED` | DoT |
| `blast` | Detonation | `PT_FLASHBANG` † | CC |
| `corrosive` | Corrosion | `PT_CAUSTIC_BURN` | Stack Debuff |
| `gas` | Gas Cloud | `PT_ASPHYXIATION` | DoT (AoE) |
| `magnetic` | Disruption 🔴 | `PT_MAGNETIZED` | Stack Debuff |
| `radiation` | Confusion | `PT_RAD_TOX` | CC |
| `viral` | Infection 🔴 | `PT_INFECTED` | Stack Debuff |
| `void` | Bullet Attraction | `PT_RADIANT` | CC |
| `tau` | Tau 🔴 | `PT_SENTIENT` | Debuff |
| `true` | — (no dispara proc) | — | — |

**El `PT_*` es el token de la fuente, no un canónico paralelo** — mismo rol que `DT_*` en §*Resolución
de Tags Raw*: ancla nuestro nombre al de DE. 13 de ellos los declara `ProcInternalName` en
`references/wiki/sources/damage-types-data.md`; † `blast` y `tau` **no** lo traen (el módulo declara
`ProcInternalName = ""` para `DT_EXPLOSION`) y los cierra `references/wiki/mechanics/status-effect.wikitext`.

### 🔴 Tres nombres display no coinciden con la fuente

Cruzado contra **tres** fuentes —la página del tipo de daño, el módulo Lua y el propio dato in-game—
porque una sola no alcanza: están desincronizadas entre sí.

| Tipo | Nuestro display | Página del tipo | Módulo Lua | Veredicto |
|---|---|---|---|---|
| `magnetic` | `Disruption` | **Disrupt** | **Disrupt** | 🔴 no coincide con ninguna |
| `viral` | `Infection` | **Virus** | **Virus** | 🔴 no coincide con ninguna |
| `tau` | `Tau` | **Status Chance Vulnerability** | **Status Vulnerability** | 🔴 pone **el tipo de daño en el lugar del efecto** |
| `blast` | `Detonation` | **Detonate** | *Inaccuracy* | ✅ **el nuestro es correcto** — el módulo arrastra la descripción vieja |
| `impact` | `Stagger` | **Stagger** | *Knockback* | ⚠️ **la wiki se contradice y lo declara**: `{{UpdateMe｜Is Impact status name "Stagger" or "Knockback"?}}` |

Los otros diez coinciden en las tres fuentes.

**`tau` es el único choque estructural**, no de nomenclatura: los otros son sinónimos del mismo efecto;
éste nombra el **tipo de daño** donde va el **efecto**. Y la fuente comete el error simétrico —
`Types.Tau` declara `InternalName = "PT_SENTIENT"`, un token de proc en el campo del tipo.

**`blast` fija la regla de lectura:** el token de DE sobrevive los reworks, su descripción no.
`PT_FLASHBANG` sigue siendo el identificador correcto aunque *"Accuracy reduction"* haya dejado de ser
lo que Blast hace. Al citar el módulo, el `InternalName` pesa; el `Status[]` en prosa hay que
contrastarlo contra la página de la mecánica.

### La Arista 1 es 1:1 en una sola dirección

`DT_ → PT_` es identidad fija: 15 tipos, 15 procs, `true` sin proc. **La inversa no es total.**
`references/wiki/sources/damage-types-data.md` mide **38 procs, 29 con token** — hay procs reales sin
tipo de daño de origen (`Lifted`, `Knockdown`, `Microwave`, `Sleep`, `Slow`, `Blind`…), y tres de ellos
**cuentan para Condition Overload**.

**Consecuencia para el vocabulario:** `statusEffect` es hoy un **campo dentro** de la definición del
`DamageType`, de modo que todo proc tiene tipo por construcción. Un `PT_*` sin `DT_*` no tiene fila
donde existir, y `effectOfDamageType(type) → StatusEffect | null` es la única puerta de entrada. Esa
inversión —el proc como entidad propia, con el tipo de origen como campo nullable— es trabajo de la
campaña de recomposición del engine, no de este documento.

**El patrón para alojar el `PT_*` ya está construido y no requiere renombrar nada.**
`DAMAGE_TYPE_DEFINITIONS` ancla el canónico al nombre de DE y admite N alias:

```ts
impact: { rawTags: ['DT_IMPACT'],          statusLabel: 'Stagger', statusEffect: 'stagger' },
heat:   { rawTags: ['DT_HEAT','DT_FIRE'],  statusLabel: 'Ignite',  statusEffect: 'ignite'  },
```

El `PT_*` entra ahí, **hermano de `DT_*`**: el canónico sigue en minúsculas y el nombre de la fuente
vive al lado como puente. Es *canónico ↔ rawTag*, no dos nombres para lo mismo.

⚠️ **Pero unificar el vocabulario no unifica el mecanismo de entrada.** Un `PT_*` sin `DT_*` no llega
por resolver daño: llega por otra vía (heavy attack, arma específica, habilidad). **Un nombre común,
dos vías de aplicación** — y sólo una está construida.

### El choque `stagger` ↔ `PT_STAGGERED` no puede manifestarse en Condition Overload

De los tres choques de arriba, el de `impact` es el menos peligroso y conviene dejarlo dicho: **CO lee
por tipo de daño, no por nombre de proc.** Impact entra al contador como `impact`; `PT_STAGGERED` **no
está en la lista de 18**. Son dos tokens que nunca se leen desde el mismo namespace.

Y tampoco hay ruta indirecta: la rampa *Impact ×5 → Knockdown/Ragdoll* **murió en `{{ver|27.3}}`** —
*"Instead of ending in a knockdown or ragdoll, accumulating 5+ Impact Effects will now result in a **big
stagger**"* (`references/wiki/mechanics/damage-impact-damage.wikitext`). El escalón quedó **dentro** de
la familia stagger, así que `stagger` no alcanza el contador por escalada. El choque es de
**nomenclatura**, no de cómputo.

## `PE_*` — el único prefijo que acuñamos nosotros

Los prefijos del juego se **adoptan**, no se traducen: si la fuente no distingue dos cosas, no hay
ambigüedad semántica que resolver, y renombrar lo que ya tiene nombre sólo agrega un espacio-nombre que
driftea.

| Prefijo | Qué nombra | Origen |
|---|---|---|
| **`DT_*`** | el **tipo de daño**, y sólo eso | DE |
| **`PT_*`** | el **proc type** — todos, con o sin `DT_` de origen | DE (vía el módulo Lua de la wiki) |
| **`PE_*`** | *Ported Effect* — **lo que se porta y no es un proc** | **nuestro** |

**`PE_*` está libre de colisiones:** el único match contra el corpus de DE es `PE_BIAS`, y es substring
de `WEAPON_DAMAGE_TY|PE_BIAS` (12 mods de daño físico), no un token.

Lo que `PE_*` nombra son las marcas que una entidad porta y que **no** nacen de un proc: el caso
poblado es `PE_DAMAGE_VULNERABILITY` (`../domains/engine/design/arch-decisions.md` §21), donde Viral y
Magnetic entran como procs pero Molecular Prime, Reap o Petrify no.

⚠️ **Adoptar la fuente incluye adoptar sus huecos:** `PT_VOID` se autodeclara desconocido en el propio
módulo, y `DT_`/`PT_` no soportan el mismo peso de evidencia (`references/CLAUDE.md` §*Cómo leer un
token*). Se citan declarando cuál es cuál.

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
