---
Estado: "referencia"
Rol: "Registro de decisiones D-series del dominio data/ con estado de evolución"
Version: "v0.1.0"
Impacto_ID: "D-Data-Decisions"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-05-24"
Fecha_de_actualizacion: "2026-05-28"
---

# Data Domain — Decisiones (D-series)

Registro de decisiones del dominio `data/` y su pipeline. Reemplaza el extinto
`.working/engine-semantic-foundation.md` con un formato formal y evolutivo.

## Estados de decisión

- **VIGENTE** — correcta hoy, puede evolucionar con nueva evidencia. No requiere halt ni debate.
  Acción: actualizar esta entrada + documentar el motivo. Ver regla en `docs/CLAUDE.md`.
- **DEFINITIVA** — invariante del sistema. Requiere debate + autorización. Mismo protocolo que RED.

Por defecto todas las D-series son VIGENTES. Solo se declara DEFINITIVA explícitamente.

---

## D-1 — Override pattern = diseño deliberado, no deuda

**Estado:** VIGENTE
**Fecha:** 2026-04-18
**Decisión:** Los overrides en `Project/public/data/` son una capa de inteligencia manual, no deuda técnica. `generate-data.ts` produce la base desde `@wfcd/items`; los overrides añaden semántica que las fuentes externas no proveen.
**Ref:** `docs/data/rules/overrides.md`

---

## D-2 — `upgrade_by` no se añade al schema de mods

**Estado:** VIGENTE
**Fecha:** 2026-04-18
**Decisión:** En ability-stats, `upgrade_by` = "con qué stat escala la habilidad". En mods, ya existe `upgrade_type` = "a qué atributo del engine afecta". Añadir `upgrade_by` a mods crearía colisión semántica entre los dos ejes.

---

## D-3 — Vocabulario derivado de `upgrade_type` (antecedente de D-6)

**Estado:** VIGENTE
**Fecha:** 2026-04-18
**Decisión:** DE da strings como `WEAPON_PERCENT_BASE_DAMAGE_ADDED`; OmniFrame los normaliza a su propio vocabulario en el override. La convención activa es D-6 — D-3 es el antecedente histórico que justifica la necesidad de normalización.

---

## D-4 — `UPGRADE_MAP` vive en `@shared/types`, no en el engine

**Estado:** VIGENTE
**Fecha:** 2026-04-18
**Decisión:** El mapping de `upgrade_type` → operaciones del engine es un contrato compartido entre la capa de datos y la capa de cálculo. No es lógica interna del engine — vive en `shared/types/modifier.ts` donde ambas capas pueden accederlo.

---

## D-5 — Clasificación de deuda por capa

**Estado:** VIGENTE
**Fecha:** 2026-04-18
**Decisión:** Cuatro categorías de deuda:
- **A (intencionada):** helminth, focus — fuera de scope actual, sin modelar. Incarnon Genesis: pipeline de datos implementado (IncarnonRepository, override JSON, WEAPON_BASE_* tokens); features dinámicas (context.flags, on-kill stacking) siguen en categoría A.
- **B (legacy a purgar):** residuos de LoadoutState, rutas eliminadas — purgar cuando bloqueen
- **C1/C2 (resolutiva):** deuda que bloquea features pero tiene solución definida
- **Pipeline (vocabulario):** tokens sin mapping en UPGRADE_MAP — resolver por demanda

---

## D-6 — Convención `{FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}` (extensible con SUB_FAMILY)

**Estado:** VIGENTE
**Fecha:** 2026-04-19 | **Actualizado:** 2026-05-28 (criterio de uso de sub-familia precisado)
**Decisión:** Tokens de `upgrade_type` siguen la convención canónica:
- `FAMILY`: dominio del atributo (`AVATAR`, `WEAPON`, `GAMEPLAY`, …)
- `OPERATION`: tipo de modificación (`ADD`, `BASE`, `FLAT`, `MULT`)
- `PREFIX_SUFFIX`: atributo específico (`ABILITY_STRENGTH`, `CRIT_CHANCE`, …)

**Extensión de sub-familia** (activa desde 2026-05-26): cuando es necesario especificar el target de un modificador que **no reside en el mismo nodo que su destino** (modificador cross-entity):

```
{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}
```

- `WEAPON` → sub-familias válidas: `PRIMARY`, `SECONDARY`, `MELEE`
- Tokens sin `SUB_FAMILY` se aplican universalmente — son la norma por defecto

**Criterio de uso de sub-familia (2026-05-28):** La sub-familia solo se añade cuando el modificador **no reside en el mismo nodo que su target**. Si el modificador ya está en el nodo del arma (mod en melee, perk en melee), el target es implícito por contexto — no se añade sub-familia aunque el stat sea melee-exclusivo.

| Caso | Token correcto | Por qué |
|---|---|---|
| Archon Shard (en warframe) → Melee Crit Mult | `WEAPON_MELEE_ADD_CRIT_MULT` | Cross-entity: shard en warframe apunta a melee |
| Mod en arma melee → Combo Duration | `WEAPON_ADD_COMBO_DURATION` | Intra-entity: mod en el mismo nodo |
| Perk Incarnon en melee → Heavy Windup Speed | `WEAPON_ADD_HEAVY_CHARGE_SPEED` | Intra-entity: perk en el mismo nodo |

**Condición que activó la extensión:** ≥3 casos en overrides reales — Crimson Archon Shards: `WEAPON_MELEE_ADD_CRIT_MULT`, `WEAPON_PRIMARY_ADD_STATUS_CHANCE`, `WEAPON_SECONDARY_ADD_CRIT_CHANCE`. Estos tres son los únicos casos cross-entity confirmados.

**Deuda conocida en `mod-stats.override.json`:** ~26 entradas con tokens `WEAPON_MELEE_*` incorrectos (mods intra-entity con sub-familia indebida: `WEAPON_MELEE_COMBO_DURATION_BONUS`, `WEAPON_MELEE_HEAVY_CHARGE_SPEED`, etc.). Son tokens inválidos — no están en `UPGRADES`, engine los silencia. Cleanup pendiente.

**Nota sobre `WEAPON_MELEE_HEAVY_CHARGE_SPEED`:** confirmado = mismo stat que "Heavy Attack Wind Up Speed" en Incarnon perks. Token canónico: `WEAPON_ADD_HEAVY_CHARGE_SPEED`. Cleanup: `WEAPON_MELEE_HEAVY_CHARGE_SPEED` → `WEAPON_ADD_HEAVY_CHARGE_SPEED` (quitar sub-familia).

**Nota D-7:** Los tokens D-6 (incluida la sub-familia) son los futuros IDs de atributo del engine. `UPGRADE_MAP` es un puente temporal — no se extiende con lógica de filtrado por clase; eso corresponde al engine post-D-7.

**Ref:** `shared/types/modifier.ts`, `docs/semantic/upgrade-tokens.md`

---

## D-7 — Token D-6 como ID de atributo del engine (dirección futura)

**Estado:** VIGENTE
**Fecha:** 2026-04-19 | **Actualizado:** 2026-05-26 (arquitectura definida, scope faseado; sub-pregunta proc resuelta)
**Decisión:** El token D-6 es el ID de atributo canónico del engine. `UPGRADE_MAP` desaparece. Los attr IDs internos (`critical_chance`, `critical_multiplier`, etc.) se renombran a tokens D-6.

**Arquitectura de resolución (sin UPGRADE_MAP):**
```
token → attr: sub-familia removida si existe → WEAPON_MELEE_ADD_CRIT_MULT → WEAPON_ADD_CRIT_MULT
       op:   derivado del segmento OPERATION → ADD | FLAT | BASE | MULT → 4 entradas
       target_channel: del segmento SUB_FAMILY → 'melee' | 'primary' | 'secondary' | undefined
```
Tokens de sub-familia acumulan en el nodo genérico del arma con `target_channel` como filtro — no crean AttributeNodes separados.

**Scope faseado:**
- **Fase 1** (attrs no-daño): ✅ COMPLETADA 2026-05-26. Renombrados `critical_chance/multiplier`, `status_chance`, `fire_rate`, `magazine_size`, `reload_speed` + `resolveToken()` en `ModRepository`. `reload_time` tratado como dato puro en `innate_dna.profiles`, nunca como `AttributeNode`.
- **Fase 2** (attrs de daño): renombrar `damage_*` → `WEAPON_ADD_*_DAMAGE`. Afecta `DamageCombiner`, `StaticHydrator` (filtro `startsWith('damage_')` → `isUpgrade()`), `PRIMARY_ELEMENTS`, `PHYSICAL_TYPES`, `DAMAGE_EFFICIENCY`, `StatusEngine`, `ELEMENTAL_COMBINATIONS`, `ItemRepository.mapDamage()`. UPGRADE_MAP: 17 entradas de daño se vuelven redundantes tras la Fase 2 (`resolveToken()` las cubre) — purgar en la misma Fase.

**Sub-pregunta resuelta — vocabulario de proc vs attr de daño:** Los identificadores de proc/estado del enemigo (`damage_slash_proc`, `damage_corrosive`, etc. en `EnemyState`) son vocabulario de runtime independiente — NO son tokens D-6 ni se renombran en Fase 2. Un tipo de daño (`heat`) y su proc (`Ignite`) son conceptos distintos modelados en `damage.ts` via `statusLabel`. Ver `references/wiki/mechanics/status-effects.md`.

**Deuda documentada:** Las claves de `EnemyState.stacks` y `dot_pools` usan la convención `damage_*` heredada. Su renombre a identificadores de proc semánticamente correctos es scope de una Fase 3 independiente — no bloquea Fase 2.

**Sub-pregunta abierta — `reload_time`:** RESUELTA en Fase 1. Es dato puro fuera del sistema de modificadores — vive en `innate_dna.profiles`, la fórmula en `CombatCalculator` lo lee directamente. No necesita token D-6.

**Refs:** `Project/src/core/engine/hydration/ModRepository.ts`, `shared/types/modifier.ts`, `docs/semantic/upgrade-tokens.md`, `references/wiki/mechanics/status-effects.md`

---

## D-8 — `Upgrade` como vocabulario unificado (no `UpgradeType` + `UpgradeBy`)

**Estado:** VIGENTE
**Fecha:** 2026-04-19
**Decisión:** Un token puede aparecer como `upgrade_type` ("a qué atributo afecta") o como `upgrade_by` ("con qué stat escala una habilidad"). Son ejes semánticos distintos del mismo vocabulario. La responsabilidad de declarar el eje es del override JSON, no del tipo TypeScript.
**Ref:** `shared/types/modifier.ts`

---

## D-9 — DatasetSeeder eliminado; datos de prueba = pipeline real

**Estado:** VIGENTE
**Fecha:** 2026-05-19
**Decisión:** El engine es agnóstico a los datos. Los datos de prueba vienen del pipeline real (overrides), no de fixtures sintéticos. Si un Upgrade no tiene entrada en el override → `console.warn` → el mod no aplica. Eso es comportamiento correcto.

---

## D-10 — Purge completo del path legacy (2026-05-21)

**Estado:** VIGENTE
**Fecha:** 2026-05-21
**Decisión:** `simulate(LoadoutState)` y sus 4 métodos privados eliminados de `MutatorBridge`. `loadout.ts`, `LoadoutState`, `SimulationLab.tsx` y `__tests__-legacy/` eliminados. `MutatorBridge` tiene una única ruta canónica: `simulateFromIntention(EnsembleIntention)`.

---

## D-11 — `upgrade_by: "NONE"` → campo opcional (2026-05-22)

**Estado:** VIGENTE
**Fecha:** 2026-05-22
**Decisión:** `"NONE"` era un sentinel para "este stat no escala". La semántica correcta es ausencia del campo (`upgrade_by` opcional). 468 instancias purgadas de `ability-stats.override.json`. `calcStatValue()` ya manejaba `undefined` — sin cambios en lógica de cálculo.
**Ref:** `shared/types/ability.ts`, `Project/public/data/ability-stats.override.json`

---

## D-12 — `AbilityStatEntry` plano, `AbilityStatValue` eliminado (2026-05-22)

**Estado:** VIGENTE
**Fecha:** 2026-05-22
**Decisión:** `values: AbilityStatValue[]` fue diseñado contra la wiki (tablas multi-rank) en lugar de contra la UI del juego. La UI siempre muestra: 1 stat = 1 línea = 1 eje de scaling. `base_value: number | [number, number]` cubre todos los casos incluido min-max. 1564 stats migrados, 26 entradas min-max convertidas correctamente.
**Ref:** `shared/types/ability.ts`, `docs/data/schemas/abilities/schema.md`

---

## D-13 — Incarnon Genesis: SSoT manual + patrón repository (2026-05-27)

**Estado:** VIGENTE
**Fecha:** 2026-05-27
**Decisión:** El override `incarnon-evolutions.override.json` es SSoT manual — mismo patrón que `archon-shards.json`. 85 armas extraídas de wikitext con script archivado; nuevas armas se añaden a mano. El schema indexa por `unique_name`; variantes (Boltor / Telos / Prime) tienen entradas separadas — no existe campo `variant`. Los perks dinámicos (condicionales, on-kill, stacking) se documentan como `null + note` hasta que exista soporte en C1. Tokens `WEAPON_BASE_*` (BASE_FLAT) añadidos a `UPGRADE_MAP` para los 4 perks estáticos implementables: `WEAPON_BASE_DAMAGE`, `WEAPON_BASE_CRIT_CHANCE`, `WEAPON_BASE_STATUS_CHANCE`, `WEAPON_BASE_MAGAZINE_MAX`.
**Ref:** `docs/data/schemas/incarnon/schema.md`, `docs/data/schemas/incarnon/gaps.md`, `IncarnonRepository`, `Project/public/data/incarnon-evolutions.override.json`

---

## D-14 — `condition?:` y `note?:` como campos de seguimiento de diseño en todos los schemas

**Estado:** VIGENTE
**Fecha:** 2026-05-28
**Decisión:** Todos los schemas de override de stats (mods, arcanes, incarnon) exponen dos campos opcionales a nivel de stat entry:

```ts
condition?: string | null  // token canónico del vocabulario de conditions
note?:      string | null  // descripción semántica de lo que el token no puede expresar aún
```

Estos campos son **mecanismos de seguimiento de diseño**, no ruido de desarrollo.
Su contenido debe ser útil para una futura sesión de implementación — no para el autor de la sesión actual.

### Semántica de los tres estados de una stat entry

| Estado | `upgrade_type` | `condition` | `note` | Significado |
|---|---|---|---|---|
| Sin analizar | `null` | ausente | ausente | Entry no revisada todavía |
| Analizada, sin modelo | `null` | token o `null` | presente | Semántica conocida, vocabulario insuficiente |
| Mapeada, con matiz | token | token o `null` | presente | Mapeada pero hay contexto que el token solo no captura |
| Mapeada, completa | token | token o `null` | ausente | Entrada correcta y completa |

### Regla de contenido para `note?:`

El contenido debe ser conciso y orientado a implementación. Formatos válidos:
- Semántica no tokenizable: `"stacks 6x; per_stack: 110%; decay on timer"`
- Scope específico: `"primary weapons only"`
- Fórmula: `"formula: per 10% Puncture Status chance"`
- Acción futura: `"needs WEAPON_ADD_AMMO_EFFICIENCY token"`
- Condición compleja: `"With Armor Over 450 — threshold condition L2"`

Lo que NO va en `note`: referencias a la sesión actual, nombres de scripts, números de ticket.

**Alcance:** mods-schema.md, arcane/schema.md, incarnon/schema.md — los tres actualizados en la misma sesión que esta decisión.
**Ref:** `docs/semantic/conditions.md`

---

## D-15 — Modelo de condiciones Fase 0: tracking-only, default siempre activo

**Estado:** VIGENTE
**Fecha:** 2026-05-28
**Decisión:** Durante la fase de mapeo de datos (hasta alcanzar ≥70% de cobertura por sector, D-16), las conditions se modelan como campos de datos, no como lógica de evaluación.

### Tres principios del modelo Fase 0

**1. Default activo.** El engine aplica TODOS los modificadores sin evaluar `condition`. Un modificador con `condition: "on_kill"` tiene el mismo efecto que uno con `condition: null`. El campo `condition` existe para tracking y preparación de C1, no para branching de runtime.

**2. Stacking = valor máximo total.** Los mods con mecánica de stacking no tienen un campo `stacks` en el schema. El valor almacenado en `base_value` es el **total a máximo de stacks**. El `note` documenta el desglose:
```json
{
  "base_value": [0, 0, 0, 0, 0, 660],
  "upgrade_type": "WEAPON_ADD_DAMAGE",
  "note": "stacks 6x; per_stack: 110%"
}
```
El `note` no es parte del modelo de cálculo — es documentación para cuando se implemente stacking en C1-B.

**3. Duración = irrelevante por ahora.** Los buffs temporales (on_kill: +X% for Ys) no tienen campo `duration`. El `note` puede documentarla si es relevante para implementación futura. El engine aplica el valor como si fuera permanente.

### Qué NO cambia con esta decisión
- La estructura del JSON de los overrides
- El vocabulario de tokens `upgrade_type`
- La semántica de `condition` como campo de datos

### Condición de evolución (cuándo cambia esta decisión)
Cuando el vocabulario de conditions alcance ≥70% de cobertura (D-16) Y el engine tenga `SimContext` con `context.flags`, esta decisión evoluciona a **Fase 1**: el engine evalúa `condition` para L1 (estado) y L2 (umbral).

**Ref:** `docs/semantic/conditions.md`

---

## D-16 — Target de cobertura 70-80% por sector (datos antes que integración)

**Estado:** VIGENTE
**Fecha:** 2026-05-28
**Decisión:** La integración de cualquier fuente de datos al engine requiere ≥70% de cobertura en su sector. La cobertura se mide por sector, no en el total acumulado.

### Definición de sector

Un sector es un eje semántico de una fuente de datos. Cada fuente tiene múltiples sectores independientes.

### Qué significa "cubierto" en cada sector

| Sector | Fuente | Cubierto cuando | Estado actual |
|---|---|---|---|
| `mods/upgrade_type` | mod-stats.override.json | stat tiene `upgrade_type` mapeado y semánticamente correcto | ~14% (119/853) |
| `mods/condition` | mod-stats.override.json | stat condicional tiene `condition` con token canónico | ~0% (no mapeado) |
| `arcanes/upgrade_type` | arcane-stats.override.json | stat tiene `upgrade_type` verificado | ~33% (60/182) |
| `arcanes/condition` | arcane-stats.override.json | stat tiene `condition` con token canónico | ~69% (121/175) |
| `incarnon/upgrade_type` | incarnon-evolutions.override.json | perk tiene `upgrade_type` o `note` con semántica clara | ~35% estimado |
| `incarnon/condition` | incarnon-evolutions.override.json | perk con trigger tiene `condition` con token canónico | ~8% (notes estructuradas) |
| `archon/upgrade_type` | archon-shards.json | stat tiene `upgrade_type` mapeado | ~22% |
| `conditions/L1` | vocabulary.md | token de estado definido con semántica y fuente | ~100% (10/10) |
| `conditions/L2` | vocabulary.md | token de umbral definido con N y stat requerido | ~90% (6/6+ pendientes) |
| `conditions/L3` | vocabulary.md | token de evento definido con fuentes cruzadas | ~50% (60/~120 estimado) |

### Prioridad de sectores (orden de trabajo)

1. `conditions/L3` — completar el vocabulario es prerequisito de todo lo demás
2. `mods/condition` — exilus primero (ROI alto, condiciones simples), galvanizados después
3. `mods/upgrade_type` — segunda revisión: 734 entradas sin revisar
4. `incarnon/condition` — normalizar notes a tokens canónicos
5. `arcanes/upgrade_type` — actualmente 33%, 87 nulls con semántica catalogada en schema §3

### Lo que NO determina cobertura
- Integración al engine: los overrides son SSoT de datos independientemente del engine
- Cobertura total acumulada: 60% global con un sector al 0% no cumple el target

**Ref:** `docs/semantic/conditions.md`, `docs/data/status.md`
