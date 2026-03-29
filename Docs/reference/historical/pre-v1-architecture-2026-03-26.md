# Pre-v1 Architecture — Estado y Clasificación

> Estado: temporal residual — promovido al arbol canonico, NO usar como lectura operativa normal
> Fecha inicio: 2026-03-26
> Última actualización: 2026-03-28 (promoción canónica aplicada)
> Propósito: conservar el registro de trabajo original previo a su reclasificación histórica
> No es: documento de estado operativo ni índice vigente de decisiones (ver `Docs/decisions/stage-0-architecture-decisions.md`)
> Historial de debate: archivado en reference/historical/engine-v1-formulas-plan-2026-03-26.md
> 
> **Historial de cambios (2026-03-27)**:
> - Pasos 1-7: clasificación Zona A, limpieza CAT 3 (7 artefactos eliminados), CAT 1 marcado
> - Pasos 8-10: debates PA-2/3/4 + PA-1 + PA-1b cerrados (decisiones C12–C18)
> - Punto 1 cleanup: s6-horizontal-minimum, override-strategy, layout-contract, questions, gaps eliminados
>   Creados: builder-questions.md, builder-gaps.md, interpreter-gaps.md, engine-layout-input-spec.md
> - Punto 2 cleanup: formula-overview (supuesto v1 declarado), upgrade-taxonomy (refs actualizadas),
>   source-model (estado actualizado), status.md (CAT 3 registrado, deps corregidas)
> - Punto 3 cleanup: builder-questions, builder-gaps, interpreter-gaps, engine-layout-input-spec eliminados
>   Contenido único migrado al temporal como RV-1 a RV-7 (pendiente revisión antes de debatir)

---

## Framework de clasificación

| # | Nombre | Preguntas clave |
|---|---|---|
| CAT 1 | Existe + en debate | ¿El plan de cambio genera drift sobre lo que ya existe? |
| CAT 2 | No existe | ¿Qué impacto tiene cuando llegue? ¿Estructura conocida? ¿Disruptivo? |
| CAT 3 | Existe + problema | ¿Dónde se definió? ¿Dónde está el drift? ¿Desechable o rescatable? |
| CAT 4 | Existe + estable | ¿Hasta qué punto está estructurado? ¿Necesita revisión? |
| CAT 5 | No existe + puede ser problema | ¿Es debatible? ¿Bajo qué condición es bloqueante? |

---

## CAT 3 — ELIMINADOS (stage 0 completado)

> Artefactos eliminados en Paso 5 (2026-03-27). Sin deuda técnica.

---

## CAT 1 — Existe + en debate

### Modelo 3+1 capas: Loadout / Resolver / Engine + Observer (C1/C32/C33)

Concepto aprobado en debate. Nombres cerrados (C32/C33). Contratos forward cerrados (C35-C40) y frontera React cerrada con provider dominante (C41).

```
Loadout  →  Resolver  →  Engine
(capa 1)    (capa 2)    (capa 3)
                ↑ Observer (capa 4 transversal)
```

| Capa | Responsabilidad | Estado del diseño |
|---|---|---|
| Loadout | Estado mutable de selección del jugador | Implementado (Paso 17). C37. loadout.ts + 27 tests. |
| Resolver | Bidireccional: construye `CalculationContext` (forward) + traduce `EngineOutput` para UI (backward) | Forward implementado (Paso 16). Backward (B4) pendiente de contratos UI. |
| Engine | Cálculo puro. Sin React, sin fetch, sin estado. | Implementado (Paso 15). Firma: `calculate(resolved, context) → EngineOutput`. |
| Observer | Captura boundaries B1–B4 sin acoplar capas. Solo en dev/on-demand. | No implementado. Prerequisito: contratos Pasos 12-13 |

**Decisión de dirección de diseño (acordada)**: bottom-up, no top-down. Definir primero
qué input mínimo necesita el Engine para un caso concreto. Ese input concreto define el
Layout mínimo. El espacio entre selección y ese input es el Interprete.

**PA-N: Layout / Entity / Config — concepto en evolución**

> No bloquea schema ni Engine. Bloquea únicamente el Builder (paso 13). Se retoma cuando
> Interprete y schema estén estables.

Entendimiento acumulado del debate (no cerrado, no implementar):

- **Layout** = conjunto de configs activas, una por slot de entidad (warframe, primary,
  secondary, melee, companion). Es el estado completo del equipamiento.
- **Entity** = una entidad concreta (Rhino, Braton Prime...) con sus `configs[]`.
- **Config** = unidad atómica de configuración de una entidad — mods por slot + arcanos
  propios. Cada config tiene sus propios arcanos (no compartidos entre configs).
- Las exaltadas (Excalibur, Mesa) y Venari (Khora) son capacidades de la entidad, no
  slots del layout. La fuente de verdad de qué slots tiene una entidad viene del ItemType
  en el dataset — no del schema del builder.

Punto abierto que no bloquea v1 pero se retoma al diseñar el Builder:
- ¿Cómo conviven distintas polaridades bajo una misma entidad? ¿Son la misma entidad
  o instancias separadas? (ItemType vs ItemInstance — sin resolver, sin urgencia).

### Whitelist de mods para dev UI (C7 — estable como concepto, inestable como criterio)

- Concepto: `Set<uniqueName>` derivado del override. La dev UI solo muestra mods en whitelist.
- **Inestable**: el criterio de inclusión usa el schema actual (CAT 3). Cambia con PA-2.
- **No bloquea**: el criterio se define después de cerrar el schema.

### Archivos CAT 1 procesados (2026-03-27 — limpieza completada)

- ~~`s6-horizontal-minimum.md`~~ ✓ Eliminado
- ~~`layout-contract.md`~~ ✓ Reemplazado por `engine-layout-input-spec.md`
- ~~`questions.md`~~ ✓ Dividido en `builder-questions.md` + `interpreter-gaps.md`
- ~~`gaps.md`~~ ✓ Dividido en `builder-gaps.md` + `interpreter-gaps.md`
- ~~`override-strategy.md`~~ ✓ Eliminado (decisiones resueltas en PA-2/3/4)
- `source-model.md` ✓ Estado actualizado (revisado tras PA-2/3/4)

---

## CAT 5 — No existe + puede ser problema

> Contenido migrado a `Docs/domains/data/conditions-baseline.md` (2026-03-27)

### Schema de mods objetivo — PA-2, PA-3, PA-4 (CERRADO 2026-03-27)

> Prerequisito cumplido: PA-2/3/4 cerrados. Queda documentar contrato y ejecutar migración piloto.

Lo que sí está decidido (estable):
- `label` con `|val1|` como placeholder — consistente con `ability-stats.override.json`
- `values` como array de valores por rank (índice 0 = rank 0)
- Indexado por `uniqueName` en el JSON

**PA-2 — Posición de `upgradeType` (CERRADO):**

- **2A**: al mismo nivel que `label`:
  `{ "label": "...", "upgradeType": "WEAPON_PROC_CHANCE", "values": [7.3, 80] }`
- **2B**: dentro de `values` como objeto:
  `{ "label": "...", "values": { "baseValue": [7.3, 80], "upgradeType": "..." } }`
- **2C**: `values` como array para múltiples entradas (como ability schema):
  `{ "label": "...", "values": [{ "baseValue": [7.3, 80], "upgradeType": "..." }] }`

Un `label` puede tener 2 valores y 2 `upgradeType` distintos — 2C lo refleja directamente.

**PA-3 — Nombre del array exterior (CERRADO):**
- `stats` ✅ elegido
- `effects` / `levelStats` descartados para evitar ambiguedad semantica

**PA-4 — Condición: embebida vs separada (CERRADO):**
- **B** ✅ campo `condition` separado con vocabulario canónico
- **A** descartada (parsing fragil del `label`)
- **C** descartada (hardcoded opaco y acoplamiento innecesario)

### Resultado PA-2/3/4 — contrato objetivo acordado (sin implementar)

Decisiones cerradas para `mod-stats.override.json`:

- **PA-2**: opcion **2C** (`values` como array de objetos `{ baseValue, upgradeType }`)
- **PA-3**: array exterior **`stats`**
- **PA-4**: campo **`condition`** separado

> **Correcciones aplicadas (2026-03-27) — C24–C28:**
> - `rank` eliminado de la raíz (era error del agente — C26)
> - `baseValue` debe contener todos los ranks como array indexado por rank (C25)
> - `condition` siempre presente: `null` cuando no aplica, string cuando condicional (C28)
> - `|val1|`, `|val2|` referencian posición en `values[]` por índice. Parsing nunca batch (C27)
> - Vocabulario de `condition` no predefinido — evoluciona por cada caso nuevo encontrado (C24)

Shape objetivo de referencia (contract-only):

```json
{
  "<uniqueName>": {
    "name": "Mod Name",
    "stats": [
      {
        "label": "+|val1|% Critical Chance",
        "values": [
          {
            "baseValue": [7.3, 14.6, 21.9, 29.2, 36.5, 43.8, 51.1, 58.4, 65.7, 80],
            "upgradeType": "WEAPON_CRIT_CHANCE"
          }
        ],
        "condition": null
      }
    ]
  }
}
```

Ejemplo con múltiples valores y condición conocida (reference only):

```json
{
  "<uniqueName>": {
    "name": "Galvanized Scope",
    "stats": [
      {
        "label": "+|val1|% Critical Chance for |val2|s on Headshot",
        "values": [
          {
            "baseValue": [20, 30, 40, 50, 60, 70, 80, 90, 100, 120],
            "upgradeType": "WEAPON_CRIT_CHANCE"
          },
          {
            "baseValue": [4, 5, 6, 7, 8, 9, 10, 11, 12, 14],
            "upgradeType": "WEAPON_CRIT_DURATION"
          }
        ],
        "condition": "on_headshot"
      }
    ]
  }
}
```

> Nota: `"on_headshot"` es ilustrativo. El vocabulario de condiciones se define
> incrementalmente — cada caso nuevo en el piloto genera una entrada de mapeo si aplica.

---

## CAT 2 — No existe (diseño pendiente)

### Capa Resolver — implementación y contrato

- Sin archivo, interface ni firma.
- Nombre cerrado (C32 — 2026-03-28). Contrato pendiente.
- **Bloqueante para diseñar**: C1 + cierre de schema de mods + PA-1.

### Schemas bajo prototipado evolutivo

> Metodología acordada: diseñar → implementar → probar en aislamiento → detectar errores →
> ajustar. Cada schema se prueba de forma aislada — no requiere Engine funcionando.
> Se respeta semántica y taxonomía de schemas existentes. Se puede rediseñar si hace falta.

| Schema | Estado | Bloqueante para iniciar | Notas |
|---|---|---|---|
| `mod-stats.override.json` (nuevo schema) | PA-2/3/4 cerrados + PA-1b v1 | Ninguno para piloto | Documentar contrato + piloto selectivo |
| `ability-stats.override.json` (aditivo) | Estable, posible aditivo | Vocabulario condiciones (PA-1) | Solo añade campo `condition` si el schema transversal lo requiere |
| Pasivas de warframe | No existe | Después de mods — reutiliza semántica | Posible extensión de ability schema. Investigar casos complejos. |
| Unique traits de armas | No existe | Después de mods | Schema nuevo. Analizar con ejemplos de wiki. |
| Incarnon evolutions | No existe | Después de unique traits | Similar a unique traits, con diferencias. Módulo wiki disponible. |
| Archon shards | Referencia existe (`archon-shards.md`) | Puede avanzar en paralelo con mods | Tabla completa disponible. Algunos shards tienen condiciones complejas. |

### Dominio docs builder/

- No existe. Se crea cuando el schema, C1 y el debate de Layout/build parcial cierren.
- Contenido esperado: `BuildState`, `toLayout()`, whitelist, serialización, spec dev UI.

---

## CAT 4 — Existe + estable

### ability-stats.override.json

Estable. Convenio `label/|val1|`, `values[]` como array de `AbilityStatValue`, indexado por
`uniqueName`. Posible cambio aditivo mínimo: campo `condition` si el schema transversal lo requiere.

### Fórmulas matemáticas (12 archivos en engine/formulas/)

Contenido matemático canónico y correcto. Rescatables incluso en stage 0 del engine.
Lo que cambia: cómo el nuevo engine las invoca y sobre qué datos opera — no las funciones.

Archivos: `crit-base.ts`, `status-base.ts`, `scaling-base.ts`, `warframe-core.ts`,
`weapon-core.ts`, `weapon-multishot.ts`, `weapon-crit.ts`, `weapon-status.ts`,
`weapon-condition-overload.ts`, `arcane-core.ts`, `ability-crit.ts`, `ability-status.ts`.

### domains/engine/formula-overview.md

Actualizado (2026-03-27): supuesto v1 declarado explícitamente, GAP-6 cerrado, contexto actualizado a Interprete→Engine.

### domains/data/mods/upgrade-taxonomy.md

Actualizado (2026-03-27): taxonomía estable, refs a archivos eliminados resueltas, nota de evolución agregada. No tratar la lista como cerrada.

### domains/data/warframes/source-model.md

Estable. Referencia operativa actualizada a `domains/engine/architecture.md` y `features/builder-engine/status.md`.

### reference/wiki/mechanics/

Documentación canónica del juego. No afectada por ningún debate.

---

## Decisiones estables (cerradas, sin drift)

| # | Decisión | Estado |
|---|---|---|
| C2 | `label` con `\|val1\|` como placeholder | ESTABLE — confirmado en `ability-stats.override.json` |
| C3 | `values[]` con todos los ranks para mods; abilities solo max rank | ESTABLE — diferencia intencional |
| C4 | Indexado por `uniqueName` | ESTABLE |
| C5 | Mods no necesitan `groups[]` | ESTABLE para el caso base |
| C6 | Condiciones deben estar en el schema como campo de datos | ESTABLE |
| C8 | Dirección de diseño: bottom-up (desde input mínimo del Engine hacia arriba) | ACORDADO |
| C9 | Schemas se prueban en aislamiento — no requieren Engine funcionando | ACORDADO |
| C10 | Migración de datos: piloto selectivo DESPUÉS de cerrar PA-2/3/4 completamente | ACORDADO |
| C11 | No crear placeholders — archivo inexistente comunica mejor que archivo vacío | ACORDADO |
| C12 | PA-2: `values` usa opcion 2C (array de objetos con `baseValue` + `upgradeType`) | CERRADO (2026-03-27) |
| C13 | PA-3: array exterior del schema de mods = `stats` | CERRADO (2026-03-27) |
| C14 | PA-4: `condition` como campo separado con vocabulario canonico | CERRADO (2026-03-27) |
| C15 | PA-1 baseline: `ConditionDefinition` + `ConditionState` con familias y source | CERRADO (2026-03-27) |
| C16 | PA-1b: acciones (`aiming`, `sliding`, `aim_gliding`, `wall_latching`) = `user-confirmed` | CERRADO (2026-03-27) |
| C17 | PA-1b: contexto de estado usa `enemy_proc_matrix` (tipo->stacks) | CERRADO (2026-03-27) |
| C18 | PA-1b: `attack_behavior_type` global, declarado via override/schema adicional | CERRADO (2026-03-27) |
| C19 | RV-1: Interface Layout pre-C1 eliminada. Tabla de slots conservada como referencia empírica | CERRADO (2026-03-27) |
| C20 | RV-2: Todas las condiciones en `CalculationContext`. Engine sin estado implícito (determinista) | CERRADO (2026-03-27) |
| C21 | RV-3: Debug = capa de observabilidad transversal. Engine e Intérprete no producen debug. Prerequisito: contratos formalizados en Pasos 12-13 | DIRECCIÓN ACORDADA — pendiente Pasos 12-13 |
| C22 | RV-4: Orden de mecánicas = auditoría tripartita (fórmulas → wiki → usuario). Ningún orden se asume sin fuente confirmada. Prerequisito de Paso 12 | DIRECCIÓN ACORDADA — pendiente Paso 12 |
| C23 | RV-7: Documentación = fuente de verdad. Schema JSON y tipos TS son artefactos derivados evolutivos. Ningún schema es definitivo mientras el dominio sigue en construcción | CERRADO (2026-03-27) |
| C24 | Vocabulario de `condition` en mods: no predefinido. Evoluciona incrementalmente — cada condición nueva encontrada define una entrada de mapeo | CERRADO (2026-03-27) |
| C25 | `baseValue` contiene todos los ranks como array indexado por rank (0..maxRank), igual que ability schema | CERRADO (2026-03-27) |
| C26 | `rank` a nivel raíz del mod eliminado del schema (era error). Estructura raíz: `{ name, stats[] }` — espeja ability schema sin `groups` | CERRADO (2026-03-27) |
| C27 | `\|val1\|`, `\|val2\|` referencian posición en `values[]` por índice de aparición. Parsing nunca batch | CERRADO (2026-03-27) |
| C28 | `condition` siempre presente en el stat: `null` cuando no condicional, string del vocabulario cuando sí. Nunca campo omitido | CERRADO (2026-03-27) |
| C29 | Archon Shards: `isTauforged` vive en el slot del layout, no en el schema. `baseValue` = valor normal. Engine aplica `* 1.5` cuando `isTauforged: true` | CERRADO (2026-03-27) |
| C30 | Archon Shards: casos complejos (Violet electricity scale, Violet crit threshold, Topaz stacking) son condicionales del mismo patrón que mods y arcanes. No requieren tratamiento especial en el schema | CERRADO (2026-03-27) |
| C31 | Vocabulario de condiciones = fuente única compartida entre todos los schemas (mods, arcanes, shards, habilidades, pasivas). Crece incrementalmente a medida que se encuentran casos — no requiere formalización previa ni documento maestro. Naming convention con prefijo único (ej. `on_kill_*`, `per_shard_*`) actúa como control para refactors batch vía regex. Trabajo paralelo al desarrollo de schemas | CERRADO (2026-03-27) |
| C32 | Nomenclatura de capas: capa 1 = **Loadout** (sustituye Builder), capa 2 = **Resolver** (sustituye Interprete). Inglés para seguir patrón `en` del módulo. Loadout: término de gaming sin colisión con código. Resolver: captura bidireccionalidad sin implicar patrón de diseño específico. | CERRADO (2026-03-28) |
| C33 | Observer como nombre de capa 4 transversal de debug/trazabilidad. Captura boundaries B1–B4 sin acoplar capas. No afecta camino crítico de producción. | CERRADO (2026-03-28) |
| C34 | Auditoría tripartita (C22) ejecutada. Orden de mecánicas para weapons: damage base → multishot → crit → status → CO. Anomalía A1 (|| true en weapon-core) registrada: el Engine nuevo no debe heredarla — debe soportar attacks[] o delegarlo explícitamente al Resolver. | CERRADO (2026-03-28) |
| C35 | Frontera Resolver/Engine: el Resolver entrega lista plana de stats resueltos (`{ upgradeType, value, condition }`, uno por stat de cada mod, sin agrupar ni sumar), más los stats base de la entidad y `deliveryType`. El Engine agrupa por `upgradeType`, suma, y aplica fórmulas — es el único dueño del conocimiento de mecánicas (CO behavior, crit-multishot, orden de operaciones). El Engine no accede a ningún JSON. `dataset` desaparece de la firma; el Resolver ya hizo el lookup. | CERRADO (2026-03-28) |
| C36 | Contrato B1 (Loadout → Resolver): `LoadoutInput` con `EquippedEntity[]` por canal (warframe, primaryWeapon, secondaryWeapon, meleeWeapon). Cada `EquippedEntity`: `{ uniqueName, mods: [{ uniqueName, rank }], arcanes? }`. El Resolver recibe las fuentes de datos como dependencias inyectadas (`modOverrideMap`, `itemDataset`) — no las importa hardcoded. Backward (B4) pendiente de contratos de UI (Paso 14). | CERRADO (2026-03-28) |
| C37 | Contrato del Loadout (PA-N cerrado como mínimo v1): `LoadoutState` con `EntitySlot` por canal (warframe, primary, secondary, melee). Cada `EntitySlot` tiene `uniqueName`, `activeConfigIndex` y `configs: EntityConfig[]`. Cada config tiene `mods: (ModSlot|null)[]` y `arcanes?`. El Loadout expone `toResolverInput()` que serializa la config activa como `LoadoutInput`. No evalúa fórmulas. Exaltadas/Venari: capacidades de la entidad, no canales del Loadout. Companion: fuera de v1. | CERRADO (2026-03-28) |
| C38 | WeaponBase expandida con `attacks: WeaponAttack[]`. Stats weapon-level: `magazineSize`, `reloadTime`, `multishot` (confirmado: 0 excepciones en el dataset). Stats per-attack en `WeaponAttack`: `name`, `totalDamage`, `damage: DamageMap`, `critChance`, `critMult`, `statusChance`, `fireRate`, `deliveryType`. Engine devuelve `WeaponStatOutput` con `magazineSize`, `reloadTime` + `attacks: WeaponAttackOutput[]` en espejo. | CERRADO (2026-03-28) |
| C39 | `deliveryType` es responsabilidad de `generate-data`, no del Resolver. Se normaliza POR ATAQUE usando `trigger` (raíz del arma) + `shot_type` (por ataque): `Held+Hit-Scan→beam-continuous`, `Held+Projectile→projectile-single` (caso Atomos Incarnon), `Charge+Projectile→projectile-charged`, `*+Hit-Scan→hitscan-single`, `*+AoE→aoe`, `*+DoT→dot-secondary`, `*+Thrown→thrown`. Casos pendientes documentados: `shot_type null` (melee + Simulor/Synoid Simulor), `Hitscan` vs `Hit-Scan` typo (Zylok/Zylok Prime). | CERRADO (2026-03-28) |
| C40 | Política fire modes v1: la UI renderiza TODOS los ataques del array en orden sin agrupación ni selección. Fire mode grouping descartado para v1 — override inviable a ~900 armas sin datos estructurados de referencia. Incarnon: soporte parcial — stats base correctos, evoluciones de progresión no implementadas (sin datos). Se revisa en v1+. | CERRADO (2026-03-28) |
| C41 | Frontera de integración React cerrada: `LoadoutProvider` dedicado con `useReducer` + hooks, montado en la jerarquía `DataState → Loadout → Menu → Shell → Theme → App`. El provider expone `LoadoutState` y outputs derivados (`LoadoutInput`, `ResolvedLayout`, `EngineOutput`) para compartir layout activo entre HUD y Arsenal. Persistencia de builds/Profile queda como capa aparte y no modifica esta frontera. | CERRADO (2026-03-28) |

---

## Puntos de debate pendientes

| ID | Punto | Bloqueante para |
|---|---|---|
| PA-1c | Growth incremental del catálogo canónico | Interprete (profundización), UX de toggles/sliders |
| PA-N | Layout / Entity / Config — identidad con distintas polaridades | Builder (paso 13) — no bloquea Engine ni schema |
| PA-T | **Trigger edge cases** — classify `shot_type: null` (Simulor "Orb Merging Damage" + Synoid Simulor "Singularity") y validar si `Active` (granadas) requiere tratamiento especial en generate-data más allá de C39. Referencias: [Trigger Type — wiki.warframe.com/w/Trigger_Type](https://wiki.warframe.com/w/Trigger_Type), [Alternate Fire — wiki.warframe.com/w/Alternate_Fire](https://wiki.warframe.com/w/Alternate_Fire). También: `references/` del workspace y `Docs/` tienen documentación de hitscan/deliveryType. Hasta que se cierre, generate-data mapea `null → "unknown"` (C39). No bloquea Paso 15. | generate-data deliveryType completo post-v1 |
| C1 | Contrato concreto de la capa Resolver (nombre resuelto en C32) | context-contract, output-contract |

---

## Orden de trabajo — stage 0 (actualizado 2026-03-27)

### Completados (Pasos 1-7 ✓)

```
✓ Paso 1: Debate PA-N — Layout / Entity / Config (concepto en evolución)
✓ Paso 2+3: Análisis Zona A — CAT 1/2/3/4/5 clasificados
✓ Paso 4: Limpieza — open-questions.md, archivos históricos archivados
✓ Paso 5: Eliminación CAT 3 — 6 docs + 1 TS removidos, formulas conservadas
✓ Paso 6: Marca CAT 1 — 6 docs marcados "desactualizado"
✓ Paso 7: Temporal actualizado — PA-N + cambios reflejados
```

### Próximos (Pasos 8-15)

```
✓ Paso 8: Debate PA-2 + PA-3 + PA-4 — cerrado (2C + stats + condition)
✓ Paso 9: Debate PA-1 baseline — cerrado (`ConditionDefinition` + `ConditionState`)
✓ Paso 10: Barrido wiki + seed catalog PA-1b — cerrado v1 (confirmado por usuario)
✓ Paso 11: Migración piloto schema mods — cerrado (2026-03-28)
    Script generate-mod-overrides.mjs actualizado al schema C12–C28.
    Output: 639 mods / 86.47% cobertura. Schema: { name, stats: [{ label, values: [{ baseValue, upgradeType }], condition }] }
✓ Paso 12: Contrato del Engine cerrado (2026-03-28)
    Auditoría tripartita ejecutada (C34). Frontera Resolver/Engine definida (C35).
    Firma: calculate(resolved: ResolvedLayout, context: CalculationContext): EngineOutput
    B2 shape documentado en architecture.md: lista plana ResolvedStat[] + base stats por entidad.
    Engine = dueño del conocimiento de mecánicas. Resolver = lookup + entrega, sin agregación.
✓ Paso 13: Contrato del Resolver cerrado (2026-03-28)
    B1 shape definido (C36): LoadoutInput con EquippedEntity por canal (uniqueName + mods[{uniqueName, rank}]).
    Resolver forward: lookup en modOverrideMap + itemDataset (inyectados) → ResolvedLayout + CalculationContext.
    Resolver backward (B4): pendiente de contratos de UI (Paso 14).
    Documentado en architecture.md: B1 + forward + backward + inyección de dependencias.
✓ Paso 14: Contrato del Loadout cerrado (2026-03-28)
    C37: LoadoutState con EntitySlot por canal (uniqueName + activeConfigIndex + configs[]).
    Cada EntityConfig: mods (ModSlot|null)[] + arcanes?. toResolverInput() serializa sin evaluar.
    PA-N cerrado como contrato mínimo. Exaltadas/Venari = capacidades de entidad, no canales.
    Documentado en architecture.md.
✓ Paso 15: Engine implementado (2026-03-28)
    Contrato calculate(resolved: ResolvedLayout, context: CalculationContext): EngineOutput.
    engine/index.ts reescrito: B2 types + B3 types + aggregateStats() + calculateWarframeChannel() + calculateWeaponChannel().
    warframe-core.ts: AVATAR_ARMOR_MAX → AVATAR_ARMOUR, input duck-typed (WarframeBaseStats), uniqueName/name removidos del output.
    weapon-core.ts: reescrito con per-attack calculation (attacks.map()), averageCritMultiplier, upgradeTypes corregidos
      (WEAPON_DAMAGE_AMOUNT, WEAPON_CRIT_DAMAGE, WEAPON_CLIP_MAX).
    AVATAR_ABILITY_STRENGTH → canal abilityStrength separado en WarframeStatOutput.
    EngineV1TextView.tsx marcado @deprecated + @ts-nocheck (dev tool con contrato viejo).
    Validación contra walkthrough: todos los valores coinciden (health 859.50 / shield 429.75 / armor 525.25 / power 450 / critChance 0.30 / critMult 4.40 / avgCrit 2.02).
    TypeScript compila sin errores.
✓ Paso 16: Resolver implementado (2026-03-28)
    engine/resolver.ts creado (~260 líneas). API: resolve(), resolveAndCalculate(), buildWeaponsMap(), buildWarframesMap().
    Tipos B1: EquippedMod, EquippedEntity, LoadoutInput. Override types: ModStatValue, ModStat, ModOverrideEntry, ModOverrideMap.
    ResolverDependencies: itemDataset (Maps) + modOverrideMap — inyectados, sin imports hardcoded (C36).
    Normalización snake_case→camelCase inline (responsabilidad Resolver). 
    Tests: resolver.test.ts (20 tests) + resolver-precision.test.ts (34 tests).
    Gaps v1 documentados con tests explícitos: WEAPON_PERCENT_BASE_DAMAGE_ADDED, WEAPON_MELEE_DAMAGE.
    engine-dataset-smoke.test.ts: 12 tests. Total 66/66 verdes. TypeScript limpio.
✓ Paso 17: Loadout implementado (2026-03-28)
    engine/loadout.ts creado. Tipos: ModSlot, ArcaneSlot, EntityConfig, EntitySlot, LoadoutState.
    API: toResolverInput(), createSlot(), emptyConfig(), equipEntity(), unequipEntity(), setActiveConfig(), setMod().
    Mutaciones puras — todas retornan nuevo estado (inmutabilidad para React).
    Tests: loadout.test.ts (27 tests). Total 93/93 verdes. TypeScript limpio.
✓ Paso 18: Integration layer mínima implementada (2026-03-28)
  OQ-2 cerrada con opción A: `LoadoutProvider` dedicado + hooks.
  providers/Loadout/loadout-context.tsx creado con `useReducer`, carga de datasets del Resolver y outputs derivados.
  engine/runtime-deps.ts creado para cargar weapons/warframes/mod overrides e indexarlos una sola vez en runtime.
  main.tsx actualizado: jerarquía `DataState → Loadout → Menu → Shell → Theme → App`.
  `ArsenalView` conectado como consumer mínimo con preset canónico de verificación.
  `HudHeader` y `ArsenalFooter` consumen el loadout activo real.
  `npm run build` OK.
```

**PA-N** evoluciona en paralelo — no tiene paso propio, se retoma en Paso 13.

Schemas en paralelo cuando el schema de mods esté cerrado:
- Archon shards (referencia existe, puede arrancar antes)
- Pasivas, unique traits, incarnon — cada uno bajo prototipado evolutivo aislado

---

## Contenido pendiente de revisión antes de debatir

> **Origen**: migrado de docs marcados "desactualizado" (2026-03-27-c).
> **Instrucción para agentes**: NO tratar como debates abiertos. Revisar primero si el
> contenido es contradictorio con decisiones C1–C18 antes de retomarlo.
> Puede contener contratos obsoletos, tipado incorrecto o semántica inconsistente.

### RV-1 — Slots por entidad ✓ PROCESADO (2026-03-27)

> Tabla migrada a `Docs/domains/data/warframes/slot-reference.md`.

---

### RV-2 — Condiciones en CalculationContext ✓ CERRADO (2026-03-27)

> Decisión: B (cerrar con opción A) — Todas las condiciones activas viven en `CalculationContext`. El Engine no tiene estado implícito ni baseline hardcodeado. Coherente con PA-1 (C15): `ConditionState` como input explícito.
> Rationale: un Engine sin estado implícito es determinista, testeable en aislamiento y alineado con el diseño bottom-up (C8).

---

### RV-3 — Granularidad del EngineOutput + responsabilidad del debug

¿`EngineOutput` expone solo resultados finales o también breakdowns/metadatos? ¿Quién produce el debug?

> **Dirección acordada (2026-03-27)**: capa de observabilidad transversal.
> Ni el Engine ni el Intérprete producen debug activamente. Una capa abstracta separada
> captura inputs/outputs de cada layer sin que estas lo sepan ni lo gestionen.
> El debug no pertenece al dominio de ninguna capa — es una responsabilidad cruzada.
>
> **Prerequisito crítico**: los contratos de Engine e Intérprete deben ser suficientemente
> expresivos en sus interfaces públicas para que la capa de observabilidad pueda reconstruir
> la traza solo desde inputs/outputs — sin exponer internals.
> Esto convierte el diseño de contratos en prerequisito del diseño de debug, no al revés.
>
> **Estado**: pendiente hasta Pasos 12-13. No diseñar la capa de observabilidad antes de
> que los contratos de Engine e Intérprete estén formalizados.

`EngineOutput` expone solo `final` (puro). El shape de debug es responsabilidad de la
capa de observabilidad y se define cuando los contratos de las capas estén cerrados.

---

### RV-4 — Orden de mecánicas al Engine ✓ CERRADO (2026-03-28)

> **Auditoría tripartita ejecutada en Paso 12.**
>
> **Resultado:**
> - 12 fórmulas auditadas (CAT 4). Wiki alineada en todos los puntos principales.
> - Orden de operaciones confirmado: damage base → multishot → crit → status → CO (multiplicador separado)
>
> **Puntos calientes — resolución:**
> - Conversión de daño (IPS → elemento): `resolveElementalCombination` en `status-base.ts`.
>   Ocurre sobre el breakdown de daño ANTES del cálculo de proc weights. Wiki confirma.
> - CO timing: después de la suma aditiva de mods de daño, como multiplicador separado.
>   Tres behaviors: `adding` (pool único con daño), `multiplying` (pool propio), `none` (AoE excluido). Wiki confirma.
>
> **Anomalías detectadas (relevantes para diseño del Engine nuevo):**
> - A1: `|| true` en `weapon-core.ts` — siempre usa `totalDamage`, nunca `attacks[]`. Deuda técnica documentada. Afecta granularidad por tipo de ataque.
> - A2: `criticalChance` calculado dos veces si se usa tanto `weapon-core` como `weapon-crit`. Señal de que el Engine nuevo no debe delegar a `weapon-core` para esas stats.
> - A4: `arcane-core.ts` completamente bloqueado — necesita `arcane-stats.override.json`.
>
> **Registrado como C34.**

---

### RV-5 — Gaps del Builder — revisados (2026-03-27)

**Gap 1 — Cobertura numérica de mods** ✓
El número 639/739 (86.47%) corresponde al schema CAT 3 (eliminado). No extrapolable al nuevo schema.
→ Se mide en el piloto del Paso 11. No es un número fijo a mantener.

**Gap 2 — Arcanes** ✓
*Nota: Archon Shards ≠ Arcanes. Son entidades distintas.*
- **Archon Shards**: documentados en `archon-shards-integration.md` pero sin schema formal todavía.
- **Arcanes**: datos extraídos de wiki pero sin schema ni contrato. Posiblemente compartan
  shape similar a mods (`stats[]`, `condition`). Se revisa cuando el schema de mods esté cerrado.
→ Pendiente de schema. No bloquea v1 core — se retoma después del piloto de mods.

**Gap 3 — Augmentos de habilidad** → colapsado en RV-6.
Comportamiento no definido. Schema separado, posiblemente más elaborado que mods normales.
Ver RV-6 para el debate completo.

**Gap 4 — Companions** ✓
Fuera de v1 completamente. Posible integración mínima no calculada discutible en el futuro,
pero no es objetivo de v1. No bloquea ningún paso del order de trabajo actual.

---

### RV-6 — Augmentos y efectos UNIQUE

¿Cuándo modelar augmentos de habilidad o efectos sin `upgradeTypes[]` como parte real del builder?

> **Dirección acordada (2026-03-27)**: schema propio separado de mods normales.
> Los augmentos afectan habilidades y armas de formas múltiples y complejas — no encajan
> en el shape de mods estándar sin forzar el modelo. Schema similar a mods pero más elaborado.
> El diseño parte de cobertura contrastada con la wiki (mismo criterio que RV-4: C22).
>
> **Prerequisitos para debate formal**:
> - Schema de mods cerrado y piloto completado (Paso 11)
> - C1 formalizado (capas definidas)
> - Barrido wiki de augmentos con casos representativos clasificados
>
> **Estado**: pendiente Paso 14. No asumir compatibilidad con el shape de mods antes de auditar casos.

---

### RV-7 — Integración con tipado nuevo ✓ PROCESADO (2026-03-27)

> Contexto hallado: arcanes y mods ya están separados estructuralmente en el Layout actual
> (`mods: EquippedMod[]` vs `arcanes?: EquippedArcane[]`). El campo `entity` en `arcanes.json`
> mapea cada arcane a su slot de layout (warframe/primary/secondary/melee). Tipo `Arcane`
> formalizado en `lib/types/arcane.ts`. No era una pregunta abierta — estaba documentado.
>
> **Lo que sí está abierto (debate pendiente)**:
> 1. **Schema numérico de arcanes**: `levelStats` actuales son strings textuales (igual que
>    `ability-stats` antes del override). Necesitan un override numérico similar al de mods
>    (PA-2/3/4) para que el Engine pueda calcularlos. Se retoma después del piloto de mods.
> 2. **Source of truth: schema de datos vs tipos TS**: los tipos en `lib/types/` fueron creados
>    antes de cerrar los schemas nuevos. ¿Quién lidera? Ver punto abierto abajo.
> 3. **Archwing weapons, vehicles, operator**: fuera de v1 confirmado (Gap 4 + Dimensión 2).
>
> **Decisión (C23 — 2026-03-27)**: la documentación es siempre el punto de entrada.
> Schema JSON y tipos TS son artefactos derivados — no fuentes de verdad.
> Ambos son evolutivos: cambian cuando la documentación cierra un debate, no antes.
> Fijar un schema o un tipo como definitivo mientras el dominio sigue en construcción
> reproduce exactamente el patrón de drift que llevó al estado actual.
> Ver C23 en tabla de decisiones.


