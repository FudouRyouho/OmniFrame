---
Estado: "referencia"
Rol: "Registro de decisiones D-series del dominio data/ con estado de evolución"
Version: "v0.1.0"
Impacto_ID: "D-Data-Decisions"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-05-24"
Fecha_de_actualizacion: "2026-05-24"
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
- **A (intencionada):** helminth, focus, incarnon — fuera de scope actual, sin modelar
- **B (legacy a purgar):** residuos de LoadoutState, rutas eliminadas — purgar cuando bloqueen
- **C1/C2 (resolutiva):** deuda que bloquea features pero tiene solución definida
- **Pipeline (vocabulario):** tokens sin mapping en UPGRADE_MAP — resolver por demanda

---

## D-6 — Convención `{FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}` (extensible con SUB_FAMILY)

**Estado:** VIGENTE
**Fecha:** 2026-04-19 | **Actualizado:** 2026-05-26 (sub-familia formalizada — OQ-W-4 cerrado)
**Decisión:** Tokens de `upgrade_type` siguen la convención canónica:
- `FAMILY`: dominio del atributo (`AVATAR`, `WEAPON`, `GAMEPLAY`, …)
- `OPERATION`: tipo de modificación (`ADD`, `BASE`, `FLAT`, `MULT`)
- `PREFIX_SUFFIX`: atributo específico (`ABILITY_STRENGTH`, `CRIT_CHANCE`, …)

**Extensión de sub-familia** (activa desde 2026-05-26): cuando un stat es clase-específico dentro de una familia, se inserta `SUB_FAMILY` entre `FAMILY` y `OPERATION`:

```
{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}
```

- `WEAPON` → sub-familias válidas: `PRIMARY`, `SECONDARY`, `MELEE`
- Tokens sin `SUB_FAMILY` siguen siendo válidos y se aplican universalmente
- Un token clase-específico coexiste con su equivalente global: `WEAPON_MELEE_ADD_CRIT_MULT` + `WEAPON_ADD_CRIT_MULT` son ortogonales

**Condición que activó la extensión:** ≥3 casos en overrides reales — Crimson Archon Shards: `WEAPON_MELEE_ADD_CRIT_MULT`, `WEAPON_PRIMARY_ADD_STATUS_CHANCE`, `WEAPON_SECONDARY_ADD_CRIT_CHANCE`.

**Nota D-7:** Los tokens D-6 (incluida la sub-familia) son los futuros IDs de atributo del engine. `UPGRADE_MAP` es un puente temporal — no se extiende con lógica de filtrado por clase; eso corresponde al engine post-D-7.

**Ref:** `shared/types/modifier.ts`, `docs/data/schemas/mods/upgrade-taxonomy.md`

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

**Refs:** `Project/src/core/engine/hydration/ModRepository.ts`, `shared/types/modifier.ts`, `docs/data/schemas/mods/upgrade-taxonomy.md`, `references/wiki/mechanics/status-effects.md`

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
