---
Estado: "activo"
Rol: "Inventario y mapa de navegación del corpus documental — construido iterativamente"
Version: "v0.7.0"
Impacto_ID: "N/A"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-06-01"
Fecha_de_actualizacion: "2026-06-01"
---

# Doc Map — Inventario del corpus documental

Mapa de referencia permanente del corpus `docs/`. Se actualiza al cierre de cada sesión que modifique decisiones documentadas (ver `docs/CLAUDE.md` §Post-flight).

**Estado de este documento:** v0.2 — árbol + nomenclaturas + engine (5 capas) + gobernanza (OQs, decisiones cerradas, deuda taxonomy, estado físico). Docs marcados `[pendiente leer]` en el árbol quedan para lectura bajo demanda.

---

## Árbol de docs/

Etiquetas de naturaleza:
- `← Entrada` — README.md o CLAUDE.md (navegación e instrucciones de agente)
- `← SSoT Datos` — contratos, schemas, reglas, pipeline de datos
- `← SSoT Semántico` — vocabulario y taxonomía canónicos
- `← Dominio Engine` — documentación del dominio funcional del motor
- `← Dominio Integration` — capa entre estado usuario y motor
- `← Dominio UI/UX` — capa de presentación
- `← Gobernanza` — contratos de proceso, estado real, OQs, decisiones
- `← Decisiones` — debates activos y plantillas
- `← Overview` — mapas globales y registros históricos
- `← [pendiente]` — naturaleza no leída todavía

```
docs/
├── CLAUDE.md                                         ← Entrada · reglas de agente para docs/
├── README.md                                         ← Entrada · punto de entrada y mapa de navegación
│
├── overview/
│   ├── README.md                                     ← Entrada
│   ├── impact-matrix.md                              ← Overview · SSoT global de backlog y dependencias físicas
│   └── doc-map.md                                    ← Overview · este archivo
│   ~~audit-context-reduction-2026-05-25.md~~         ← ⚠️ DRIFT: listado en overview/README pero eliminado del repo
│
├── governance/
│   ├── README.md                                     ← Entrada
│   ├── current-state.md                              ← Gobernanza · estado físico real del repo (código, no intención)
│   ├── open-questions.md                             ← Gobernanza · OQ-N — preguntas abiertas sin respuesta
│   ├── closed-decisions.md                           ← Gobernanza · decisiones cerradas (no reabrir sin evidencia)
│   ├── decision-frontier.md                          ← Gobernanza · frontera entre lo decidido y lo en debate
│   ├── naming-conventions.md                         ← Gobernanza · convenciones de nombres por boundary
│   ├── jsdoc-standard.md                             ← Gobernanza · vocabulario JSDoc en Project/src/
│   ├── semantic-layers.md                            ← Gobernanza · frontera de transformación e interpretación
│   ├── type-system-boundaries.md                    ← Gobernanza · rol y límites de src/shared/types/
│   ├── known-risks.md                                ← Gobernanza · riesgos técnicos conocidos (decisión de no actuar)
│   └── deuda-taxonomy.md                             ← Gobernanza · etiquetas de deuda (eje [EVD] + gramática DOMINIO:ROL)
│
├── decisions/
│   ├── README.md                                     ← Entrada
│   ├── ui-unification.md                             ← Decisiones · D-16 debate UI unification
│   └── oq-iterative-closure-template.md             ← Decisiones · plantilla para cerrar OQs iterativamente
│
├── semantic/
│   ├── README.md                                     ← Entrada
│   ├── damage-types.md                               ← SSoT Semántico · taxonomía de tipos de daño (<DT_*>)
│   ├── factions.md                                   ← SSoT Semántico · vocabulario de facciones
│   ├── polarity.md                                   ← SSoT Semántico · polaridades de mods y warframes
│   ├── conditions.md                                 ← SSoT Semántico · condition tokens (consolidador, D-19)
│   └── upgrade-tokens.md                             ← SSoT Semántico · UpgradeType tokens (D-6)
│
├── data/
│   ├── README.md                                     ← Entrada
│   ├── status.md                                     ← SSoT Datos · estado operativo global + categorías data:class:cat/a–E
│   ├── decisions.md                                  ← SSoT Datos · decisiones D-series del dominio data
│   │
│   ├── rules/
│   │   ├── ssot.md                                   ← SSoT Datos · qué es fuente de verdad para qué
│   │   ├── overrides.md                              ← SSoT Datos · reglas de overrides + criterio [engine] / ⚠️
│   │   ├── roles.md                                  ← SSoT Datos · roles de los datos [pendiente leer]
│   │   ├── dependencies.md                           ← SSoT Datos · dependencias entre datos [pendiente leer]
│   │   ├── kind-vs-category.md                       ← SSoT Datos · distinción kind vs category [pendiente leer]
│   │   └── schema-pilot-criteria.md                  ← SSoT Datos · criterios para schema pilot [pendiente leer]
│   │
│   ├── schemas/
│   │   ├── abilities/
│   │   │   ├── schema.md                             ← SSoT Datos · contrato JSON abilities
│   │   │   ├── annotation-status.md                  ← SSoT Datos · estado de anotaciones abilities [pendiente leer]
│   │   │   ├── formula-patterns.md                   ← SSoT Datos · patrones de fórmula en abilities [pendiente leer]
│   │   │   ├── preflight-checklist.md                ← SSoT Datos · checklist preflight abilities [pendiente leer]
│   │   │   ├── source-gaps.md                        ← SSoT Datos · gaps de fuente abilities [pendiente leer]
│   │   │   └── workflow.md                           ← SSoT Datos · flujo de trabajo abilities [pendiente leer]
│   │   ├── arcane/
│   │   │   └── schema.md                             ← SSoT Datos · contrato JSON arcanos
│   │   ├── archon-shards/
│   │   │   ├── schema.md                             ← SSoT Datos · contrato JSON archon shards
│   │   │   ├── concept.md                            ← SSoT Datos · concepto archon shards [pendiente leer]
│   │   │   └── upgrade-mapping.md                    ← SSoT Datos · mapeo de upgrades archon shards [pendiente leer]
│   │   ├── incarnon/
│   │   │   ├── schema.md                             ← SSoT Datos · contrato JSON incarnon
│   │   │   └── gaps.md                               ← SSoT Datos · gaps conocidos incarnon [pendiente leer]
│   │   ├── mods/
│   │   │   ├── mods-schema.md                        ← SSoT Datos · contrato JSON mods
│   │   │   └── mod-category-normalization.md         ← SSoT Datos · normalización categorías mods [pendiente leer]
│   │   └── weapons/
│   │       ├── source-model.md                       ← SSoT Datos · modelo de fuente weapons [pendiente leer]
│   │       ├── weapons-attack-structure.md           ← SSoT Datos · estructura de ataque weapons [pendiente leer]
│   │       └── weapons-known-gaps.md                 ← SSoT Datos · gaps conocidos weapons
│   │
│   ├── pipeline/
│   │   ├── architecture.md                           ← SSoT Datos · arquitectura del pipeline [pendiente leer]
│   │   ├── ability-pipeline.md                       ← SSoT Datos · pipeline de abilities [pendiente leer]
│   │   ├── companion-compatibility.md                ← SSoT Datos · compatibilidad companions [pendiente leer]
│   │   ├── mods-triage.md                            ← SSoT Datos · triage de mods [pendiente leer]
│   │   └── audits/
│   │       └── source-change-report.json             ← SSoT Datos · reporte de cambios de fuente (JSON) [pendiente leer]
│   │
│   ├── references/
│   │   ├── canonical-sources.md                      ← SSoT Datos · fuentes canónicas upstream [pendiente leer]
│   │   ├── status-chance-mechanics.md                ← SSoT Datos · mecánicas de status chance [pendiente leer]
│   │   └── warframe-items-source.md                  ← SSoT Datos · fuente de items Warframe [pendiente leer]
│   │
│   └── reports/
│       └── multishot-profiles.md                     ← SSoT Datos · perfiles de multishot [pendiente leer]
│
└── domains/
    ├── README.md                                     ← Entrada
    │
    ├── engine/
    │   ├── status.md                                 ← Dominio Engine · estado operativo + drift confirmado vs código
    │   ├── engine-audit.md                           ← Dominio Engine · inventario de drift docs vs código
    │   ├── formula-overview.md                       ← Dominio Engine · vista general de fórmulas [pendiente leer]
    │   ├── attribute-node-contract.md                ← Dominio Engine · contrato nodos de atributo [pendiente leer]
    │   ├── transition-residues.md                    ← Dominio Engine · residuos de transición [pendiente leer]
    │   │
    │   └── design/
    │       ├── README.md                             ← Entrada · ⚠️ docs escritos antes de implementación, asumir drift
    │       ├── simulation-blueprint.md               ← Dominio Engine Design · índice maestro
    │       ├── simulation-architecture.md            ← Dominio Engine Design · macro/micro arquitectura
    │       ├── simulation-contracts.md               ← Dominio Engine Design · contratos técnicos base [pendiente leer]
    │       ├── arch-decisions.md                     ← Dominio Engine Design · decisiones arquitectónicas invariantes
    │       ├── simulation-roadmap.md                 ← Dominio Engine Design · hoja de ruta
    │       ├── integration-status.md                 ← Dominio Engine Design · estado integración Arsenal
    │       └── formulas-integration.md               ← Dominio Engine Design · [pendiente leer]
    │
    ├── integration/
    │   └── README.md                                 ← Dominio Integration · (README es el único doc operativo)
    │
    └── ui-ux/
        ├── presentation-layer.md                     ← Dominio UI/UX · [pendiente leer]
        ├── shell-principles.md                       ← Dominio UI/UX · [pendiente leer]
        ├── shell-status.md                           ← Dominio UI/UX · [pendiente leer]
        ├── slot-reference.md                         ← Dominio UI/UX · [pendiente leer]
        ├── views-architecture.md                     ← Dominio UI/UX · [pendiente leer]
        └── virtualization.md                         ← Dominio UI/UX · [pendiente leer]
```

---

## Nomenclaturas activas

**SSoT:** [`docs/governance/nomenclature-grammar.md`](../governance/nomenclature-grammar.md) — gramática `DOMINIO:ROL[:ESQUEMA/ID]`, vocabulario cerrado, tabla de migración completa. Migración completada 2026-06-01.

Tags migrados (forma vieja → nueva):

| Antes | Ahora |
|---|---|
| `[engine]` (nota JSON) / `[ENGINE]` (deuda docs) | `engine:note` / `engine:debt` |
| `[SEM]` / `[DATA]` / `[PIPE]` / `[SCHEMA]` | `semantic:debt` / `data:debt` / `pipeline:debt` / `data:debt:schema` |
| `C2:BINARY` / `C2:DERIVED` / `C2:EVENT` / `C2:STACK` | `engine:class:c2/binary` … `engine:class:c2/stack` |
| `Cat A` / `Cat B` / `Cat D` / `Cat E` / `Cat F` | `data:class:cat/a` … `data:class:cat/f` |
| `Gate 1` / `Gate 2` (items bloqueantes) | `semantic:gate:g1/verify` / `semantic:gate:g2/verify` |

> Eje `[EVD]` (`[ref:]`, `[empirical]`, `[inferred]`, `[needs-verification]`) — **no migrado**, sobrevive en `deuda-taxonomy.md` como dimensión ortogonal.

---

### Vocabulario de registro y diseño (fuera de la gramática)

IDs y nombres de artefactos estables que no usan tags inline — no aplica la gramática `DOMINIO:ROL`.

**Conditions / tokens del juego**
- `WEAPON_ADD_*` / `WEAPON_BASE_*` / `AVATAR_ADD_*` etc. — tokens canónicos D-6. SSoT: `modifier.ts` + `upgrade-tokens.md`.

**Registro de decisiones y OQs**
- `D-N` — decisiones del dominio data (VIGENTE/DEFINITIVA). SSoT: `decisions.md`.
- `OQ-{DOMINIO}-N` — preguntas abiertas. Prefijos (W, DATA, ENGINE, STATE) inferidos del uso — **pendiente documentar** en `open-questions.md`.

**Nomenclaturas internas del engine**
- `AttributeNode` fields: `base`, `base_flat`, `base_add_pct`, `mods_add_pct`, `total_flat`, `multiplicative`, `final`. SSoT: `attribute-node-contract.md`.
- `Modifier.operation`: `ADD`, `BASE_FLAT`, `BASE_ADD_PCT`, `ADD_FLAT`, `MULTIPLICATIVE`. SSoT: `modifier.ts`.
- Nodos sintéticos: `WEAPON_DAMAGE` ✅ · `faction_damage_bonus` ⚠️ casing inconsistente (pendiente: renombrar a `FACTION_DAMAGE_BONUS`).

**Código JSDoc**
- `@status` — sin vocabulario canónico. 5+ valores libres. Pendiente normalizar en `jsdoc-standard.md`.
- `B1-B4` — **deprecado**. 2 referencias en `useSimulation.ts:15` y `UpgradeView.tsx:22`. Eliminar sin migrar.

**Pipeline de datos**
- `domain`, `kind`, `family`, `stats` — 4 pillars del pipeline. SSoT: `pipeline/architecture.md`.

---

### Resumen de problemas por severidad

| Severidad | Problema | Acción pendiente |
|---|---|---|
| ✅ Resuelto | `[engine]` vs `[ENGINE]` — colisión resuelta por gramática | Migración completada 2026-06-01 |
| ✅ Resuelto | Nomenclaturas opacas sin SSoT unificado | Gramática `nomenclature-grammar.md` |
| ✅ Resuelto | Modelo de 5 capas A+B+C1+C2+D | Confirmado en `simulation-architecture.md` |
| 🟡 Medio | `faction_damage_bonus` snake_case vs `WEAPON_DAMAGE` SCREAMING_SNAKE — casing inconsistente | Renombrar a `FACTION_DAMAGE_BONUS` |
| 🟡 Medio | `@status` JSDoc — 5+ valores sin estándar | Normalizar en `jsdoc-standard.md` |
| 🟡 Medio | Prefijos `OQ-{DOMINIO}` (W, DATA, ENGINE, STATE) — no documentados, inferidos del uso | Documentar en `open-questions.md` |
| 🟢 Bajo | D-6 duplicada en `decisions.md` y `upgrade-tokens.md` | Establecer referencia primaria |
| 🟢 Bajo | `B1-B4` deprecado — 2 refs en `useSimulation.ts:15` / `UpgradeView.tsx:22` | Eliminar sin migrar |

---

## Drift detectado

| Drift | Ubicación | Evidencia | Impacto |
|---|---|---|---|
| `audit-context-reduction-2026-05-25.md` listado en `overview/README.md` pero eliminado del repo | `docs/overview/README.md` | git status: `D` | bajo — actualizar README |
| Docs de `engine/design/` escritos antes de implementación | `docs/domains/engine/design/README.md` | nota explícita en README | medio — no asumir que reflejan código actual |
| `[engine]` y `⚠️` sin SSoT declarado | Usadas en `*.override.json`, `overrides.md` no las menciona | lectura de `overrides.md` 2026-06-01 | 🔴 crítico — añadir definición a `overrides.md` |

---

## Engine — Capas reales (post-lectura)

Leídos: `engine/status.md`, `engine/engine-audit.md`, `engine/design/simulation-blueprint.md`, `engine/design/simulation-architecture.md`, `engine/design/arch-decisions.md`.

### Modelo de 5 capas — definición canónica

Definido en `simulation-architecture.md`. La referencia al "modelo de 5 capas" en `integration/README` es correcta: A + B + C1 + C2 + D = 5. La "E" que no aparecía en ningún doc no existe.

| Capa | Nombre | Responsabilidad | Pregunta que responde | Físico |
|---|---|---|---|---|
| **A** | Intención | Almacenar la intención del usuario como datos puros | ¿Qué tengo equipado? | `providers/Ensemble/` |
| **B** | Comunicación | Traducir intención → contrato del engine. DNA Mutation Step (shards, Helminth). Positional Mapping de slots. | — | `engine/bridge/MutatorBridge.ts` |
| **C1** | Engine — Fórmulas puras | Construir grafo de atributos y resolver valores. Determinista, sin estado mutable. | ¿Qué vale cada atributo? | `SimulationEngine`, `StaticHydrator`, Repositories, `DamageCombiner` |
| **C2** | Simulation — Entorno reproducible | Aplicar valores de C1 en un escenario de combate. Daño final, procs, DoT, TTK. | ¿Qué pasa en el juego con esos valores? | `CombatCalculator`, `CombatSimulator`, `StatusEngine`, `TimelineSimulator` |
| **D** | Proyección — Reactive View Bridge | Transformar `ProjectionSnapshot` → estructura consumible por UI. Diff reactivo. | ¿Cómo se presenta el resultado? | `useSimulation` (mínimo actual). `ViewModelContract` **pendiente de definición** |

**Regla de comunicación:** A→B→C1→C2→D. Unidireccional, vertical, sin saltos. El engine (C1+C2) no sabe que React existe.

**`SimulationContext`:** construido por B (MutatorBridge) desde la intención + estado del Arsenal. Contiene los `flags` de condiciones ya derivadas. B lo pasa a C1 y C2 — el engine no infiere condiciones, las recibe formadas.

---

### Resolución del conflicto C1/C2 en nomenclatura

El problema identificado antes (`engine:class:c2/stack` vs `C2` como capa) es **real pero parcialmente derivado por diseño**:

- `C2` en `engine/status.md` y `simulation-architecture.md` = **Capa C2 de Simulation** (CombatCalculator, etc.)
- `engine:class:c2/stack`, `engine:class:c2/binary` etc. en `conditions.md` = modelo que describe **cómo C2 evalúa una condition** — el prefijo `C2` intenta comunicar "evaluado por la capa C2"

**Intención original de `C2:*`** (clarificada en sesión 2026-06-01): el prefijo no dice "construido en C2" sino **"responsabilidad de modelado de C2"**. La lógica: si C2 no tiene un modelo para `engine:class:c2/stack`, cualquier mechanic con stacks es invisible para la simulación. `engine:class:c2/binary` no describe dónde se construye el flag — describe que C2 debe saber modelar ese tipo de condition. El prefijo es una declaración de *ownership*, no de *timing*.

El problema concreto: un lector sin ese contexto lee `engine:class:c2/binary` como "este flag se evalúa en C2", cuando el `SimulationContext` que lo contiene se construye en el boundary B→C1. La ambigüedad es en lectura, no en intención.

`C1-A candidatos` en `conditions.md`: se refiere a conditions L1+L2 "candidatas a integrarse en C1/SimContext", no a una sub-capa de C1. Usa "C1" como referencia a la capa, no como nombre propio.

**Confirmación de `conditions.md` (leído 2026-06-01):** el doc define la columna `Modelo` como "qué necesita el engine para evaluar la condición" — confirma textualmente la intención de ownership, no timing. El `engine:class:c2/binary` de `while_shields_active` literalmente dice "flag booleano en SimContext que se activa desde el loadout **antes** de simular". La nomenclatura es coherente con lo que el doc ya dice. La corrección pendiente es solo añadir una nota explícita al header de la columna.

**Conclusión:** la notación `C2:*` tiene intención coherente y ya documentada en `conditions.md`. La corrección pendiente se reduce a añadir una línea al header de la columna "Modelo" que diga explícitamente: "ownership de modelado, no punto de construcción en el flujo".

---

### Estado real del engine (de `engine-audit.md`)

| Estado | Qué significa |
|---|---|
| ✅ Implementado y alineado | Grafo reactivo (Kahn's), fórmula Stat Accumulator v3, Elemental System, MutatorBridge, GameLaws, Hybrid Simulation, SimulationContext, Falloff, ProjectionSnapshot (estructura), TraceNode/AuditResponse |
| ⚠️ Implementado con desviación | Convergence Check ausente, ProjectionSnapshot sin datos de combate, Timeline flat array (no delta stream), Profile switching solo en hidratación (no en runtime), PE/TE tagging incorrecto en Warframe, Focus hardcodeado |
| ❌ Diseñado pero no implementado | Casting Snapshot, Transient Entity Queue, Logic Decorator Layers (6 capas), AuditQuery con filtros, Hit Location, Companion channel, Double Dipping |
| ⚙️ Implementado sin especificación | `WEAPON_DAMAGE` como multiplicador global (arquitectura canónica, validada), infraestructura de repositories, all-operations siempre ADD en ModRepository |

**Nota sobre Logic Decorator Layers:** el diseño especifica 6 capas ordenadas (`INITIAL_OVERRIDE` → `FINAL_CLIP`). No existen en el código — todos los modificadores se resuelven en un solo bloque sin orden garantizado. Esto implica que caps, floors y overrides no tienen comportamiento determinista en edge cases.

---

## Gobernanza — Estado real

Leídos: `governance/open-questions.md`, `governance/closed-decisions.md`, `governance/current-state.md`, `governance/deuda-taxonomy.md`.

---

### Preguntas abiertas (OQ-N)

| ID | Dominio | Estado | Bloquea |
|---|---|---|---|
| **OQ-ENGINE-2** | engine / simulation-context | ABIERTO | Profile switching: re-hidratar ensemble vs. conmutar `active_profile_id` en `resolve()` |
| **OQ-W-5** | data / ability → engine | ABIERTO | Semántica de `ENERGY_COST`/`ENERGY_DRAIN` con caps y efficiency. No bloquea pipeline ni schema. |
| **OQ-DATA-1** | data / arsenal / engine | ABIERTO | Materialización de slots por entidad. Bloquea diseño de `UpgradeView` y casos edge (Jade, Sevagoth Shadow, exaltadas). |
| **OQ-ENGINE-FUTURE** | engine / simulation-v2 | ABIERTO (backlog) | Web Worker + Rewind/Time Travel. Sin prioridad — activa cuando haya cliente real de Layer D. |
| **OQ-DATA-2** | data / semantic | ABIERTO | Ubicación de vocabularios que son simultáneamente semantic + data materializada (polarity, damage-types, factions). |
| **OQ-W-6** | data / ability-stats | ABIERTO | Extensión de `upgrade_by` para stats base del warframe (health, armor). Solo 1 caso confirmado (Inaros). |
| **OQ-SEM-1** | data / semantic / ability-stats | ABIERTO | Conditions de abilities y augments — cuándo y cómo reintroducir `condition` en ability-stats. |
| **OQ-W-7** | data / ability-stats → engine | ABIERTO | Double-scaling (Gara, Harrow) + tokens válidos en contexto no-estándar (Lavos, Grendel, Nidus). |
| **OQ-DATA-3** | data / pipeline / engine / UI | DIRECCIÓN ELEGIDA | DataLoader singleton unificado. `generate-data.ts` ya no toca overrides (2026-05-29). Implementación pendiente. |

**Sistema de prefijos OQ:** declarado implícitamente por uso en el doc. `ENGINE`, `W` (weapons), `DATA`, `SEM`, `STATE`. STATE cerradas: ver `closed-decisions.md §DC-OQ-STATE-*`.

**Tercer estado de OQ:** además de ABIERTO/CERRADO existe **DIRECCIÓN ELEGIDA** — tiene path decidido pero implementación pendiente. Solo aplicado a OQ-DATA-3.

---

### Decisiones cerradas destacadas

Fuente: `governance/closed-decisions.md`.

| ID | Título | Decisión |
|---|---|---|
| **DC-1** | No hay soporte i18n | Inglés exclusivo. `src/lib/i18n/` = label lookups, no internacionalización real. No reabrir. |
| **DC-OQ-STATE-1/2/3/4** | Contrato de estado | `EnsembleStore` es el SSoT. `LoadoutContext`/`LoadoutState`/`EnsembleAdapter` eliminados (2026-05-19/21). |
| **DC-OQ-ENGINE-1** | `WEAPON_DAMAGE` global | `base = damage_sum` del perfil activo. Validado en 33 tests gold standard. |
| **DC-OQ-ENGINE-3** | Label parsing en `ModRepository` | Consumir `upgrade_type` directamente vía `isUpgrade()` + `UPGRADE_MAP`. |
| **DC-OQ-10** | Naming conventions | `PascalCase` (Tipos), `camelCase` (Funciones), `snake_case` (Raw). |
| **DC-OQ-12** | Contrato de Proyección | `ProjectionSnapshot` inmutable y serializable. Reactividad vía Selective UI Reactive Bridge externo. |

---

### Taxonomía de deuda (`deuda-taxonomy.md` + `nomenclature-grammar.md`)

Dos ejes para cualquier ítem de deuda. **Eje 1** usa la gramática `DOMINIO:debt` de [`nomenclature-grammar.md`](../governance/nomenclature-grammar.md). **Eje 2** ([EVD]) es independiente.

**Eje 1 — Capa del fix (gramática `DOMINIO:debt`):**

| Tag | Dónde va el fix | Cadena |
|---|---|---|
| `semantic:debt` | `docs/semantic/` + `modifier.ts` | → desbloquea DATA + ENGINE |
| `data:debt` | `*.override.json` | → desbloquea ENGINE |
| `pipeline:debt` | `scripts/pipeline/` | → mejora calidad de DATA |
| `engine:debt` | `Project/src/core/engine/` | → feature real |
| `data:debt:schema` | `docs/data/schemas/` + tipos TS | → desbloquea DATA + ENGINE |

**Eje 2 — Calidad de evidencia:**

| Tag | Qué respalda | ¿Válido para implementar engine? |
|---|---|---|
| `[ref: ruta]` | Documento interno | ✅ |
| `[empirical]` | Testeado en el juego | ✅ (requiere doc antes del merge si es complejo) |
| `[inferred]` | Inferencia lógica | ❌ — elevar a [ref] o [empirical] primero |
| `[needs-verification]` | Dudoso / sin respaldo | ❌ |

**Regla anti-trust-me-bro:** sin etiqueta de evidencia = `[needs-verification]` por defecto.

---

### Estado físico del repo (`current-state.md` v0.1.3, 2026-05-27)

| Área | Estado real |
|---|---|
| `EnsembleStore` | SSoT de intención activo. Sistema legacy (Loadout) eliminado. |
| `MutatorBridge` | Capa B activa. Absorbió `EnsembleAdapter`. |
| Arsenal / `UpgradeView` | `use-arsenal-stub-state.ts` activo. Diseño no definido. |
| Tests Incarnon | 5 tests **fallan** — `IncarnonRepository` aún lee `upgrades[]` pero override migró a `stats[]` (D-18). |
| `ViewModelContract` | Pendiente — Layer D mínima existe como `useSimulation`. |
| `DataRegistry.ts` | SSoT UI activo. Candidato a evolucionar hacia DataLoader singleton (OQ-DATA-3). |
| `src/lib/i18n/` | Label lookups (stat, damage, faction, category). **No es i18n real** (DC-1). |
| OQ-ENGINE-2 | Única OQ crítica activa en el engine — profile switching pendiente. |

---

## Semántica — Vocabulario activo

Leídos: `semantic/conditions.md` (v1.4), `semantic/upgrade-tokens.md` (v0.5.1).

---

### Condition tokens — resumen

SSoT de los tokens: los override JSON (`mod-stats`, `arcane-stats`, `incarnon-evolutions`). `semantic/conditions.md` es el consolidador posterior que documenta la forma canónica (D-19), no un portero previo.

| Capa | Tokens definidos | Modelo en SimContext | Integración engine |
|---|---|---|---|
| **L1** — `while_*` (estado) | 19 | `engine:class:c2/binary` — flag booleano pre-calculado antes de simular | C1-A candidatos ✅ — solo `context.flags` |
| **L2** — `with_*_over/below_N` (umbral) | 9 | `engine:class:c2/derived` — comparar stat de C1 contra threshold | C1-A candidatos ✅ — solo `context.stats` |
| **L3** — `on_*` (evento) | ~76 | `engine:class:c2/event` o `engine:class:c2/stack` | Requiere sistema de eventos en C2 |
| **L4** — Operator scope | 9 | `—` | Fuera del scope de weapon sim |

**C1-A candidatos inmediatos:** L1+L2 = 28 tokens — no requieren sistema de eventos, solo `SimContext` con `flags` y `stats` pre-calculados.

**Schema blockers activos (Gate 1):**
- `while_sliding_or_aim_gliding` — condición OR; `condition: string` no la expresa. Pendiente `string[]`.
- `on_shield_or_overguard_break` — segundo caso OR. Mismo bloqueo.

**Taxonomía `condition` vigente (D-18):** ausente = sin condición · `null` = gap de datos · token = mapeado. Incarnon 100% normalizado (2026-05-30).

---

### Upgrade tokens — resumen

Fuente: `semantic/upgrade-tokens.md`. Fidelidad física: `Project/src/shared/types/modifier.ts`.

| Estado | Cantidad |
|---|---|
| Tokens en `UPGRADES[]` | **78** (sincronizado con `modifier.ts` 2026-05-31) |
| Documentados en el doc | 100% — delta code-vs-doc = 0 |
| En `UPGRADE_MAP` (excepciones explícitas) | 35 entradas |
| Auto-derivados por `resolveToken()` | elementales + sub-familia |

**Modelo de atributo en upgrade-tokens.md:**

| Tag | Significado |
|---|---|
| `C1` | Bucket estándar ADD/FLAT/BASE/MULT — resuelto con fórmula general |
| `C1·F` | C1 con fórmula específica (e.g., `WEAPON_FLAT_STATUS_CHANCE`) |
| `C2·F` | Requiere SimContext o fórmula de C2 (e.g., `GAMEPLAY_MULT_FACTION_DAMAGE`) |
| `—` | No modelado — stat informativo (manejo, economía, etc.) |

**Gate 1 pendientes — no usar en engine hasta resolver:**

| Token | Problema |
|---|---|
| `WEAPON_ADD_HEADSHOT_MULT` | "headshot" = cualquier weak point en DE moderno, no solo cabeza |
| `WEAPON_FLAT_STATUS_CHANCE` | Modelado multi-pellet complejo sin resolver |
| `WEAPON_ADD_ACCURACY` | ¿Mismo stat que `WEAPON_SPREAD` (DE legacy)? |
| `AVATAR_ADD_ABILITY_DAMAGE` | Defer — engine de habilidades no diseñado |
| `AVATAR_ADD_HEALTH_REGEN` | Hipótesis: duplicado de `AVATAR_FLAT_HEALTH_REGEN` — verificar |
| `AVATAR_FLAT_ENERGY_REGEN` | Energy Nexus puede tener ramp-up — verificar |

**D-7 Fase 2 pendiente:** renombrar attrs de daño (`damage_*` → `WEAPON_ADD_*_DAMAGE`). Afecta `DamageCombiner`, `StaticHydrator`, `StatusEngine`.

**Tipos DE deprecated:** ~24 aliases aún presentes en overrides — fallo silencioso en engine (no emite modificador). Auditoría Fase 2c en curso.

---

## Schemas de datos — Contratos activos

Leídos: `data/schemas/arcane/schema.md` (v1.1), `data/schemas/mods/mods-schema.md` (v0.1.0), `data/schemas/incarnon/gaps.md` (v1.2).

---

### Estructura compartida (mods = base; arcanes = idéntico con diferencias menores)

Todos los schemas de stats (`mods`, `arcanes`, `incarnon`) convergen en el mismo patrón:

```
entry
  ├── name: string
  └── stats[]
        ├── label: string          // texto con |val1|, |val2|
        ├── values[] → { base_value, upgrade_type }
        ├── condition?: string | null   // D-18 monosemántico
        └── note?: string | null        // semántica de diseño D-14
```

| Aspecto | Mods | Arcanes | Incarnon |
|---|---|---|---|
| `base_value` | escalar o array | array length = max_rank+1 (6 para rank5) | escalar o dict por alias |
| Fuente de `upgrade_type` | `upgradeTypes[]` de @wfcd/items | keyword matching en texto libre | auditoría manual |
| `condition` | capturado manual/script | capturado de prefijos "On X:" / "While X:" | D-18 (patch purgado; git history) |
| Repository | `ModRepository` ✅ | `ArcaneRepository` ❌ pendiente | `IncarnonRepository` ⚠️ lee formato viejo |

---

### Arcanes — gaps y prioridades

164 arcanes, 83 mapeados (43%). Pipeline: `generate-arcane-override.py` sobre `@wfcd/items`.

**Categorías de `upgrade_type: null` (~110 stats):**

| Categoría | ~N | Razón semántica |
|---|---|---|
| Status resistances | 11 | Necesita `AVATAR_CHANCE_RESIST_*` — token inexistente |
| HP/armor/shield on-event | 10 | Buffs temporales — modelado runtime, no snapshot estático |
| Economía HP/energía | 8 | "Restaurar energía" no es un stat del frame modelado |
| Ammo efficiency | 4 | `WEAPON_ADD_AMMO_EFFICIENCY` token faltante |
| Fórmulas per-stat | 7 | Requieren stat de runtime (HP actual, armor actual…) |
| Operator/Kitgun scope | 18 | Fuera del scope de weapon sim |
| Primary/Secondary stacking | 14 | On-kill stacking — runtime state requerido |

**Prioridades:**
- P1: Implementar `ArcaneRepository` (análogo a `IncarnonRepository`)
- P1: ~15 arcanes siempre activos (sin `condition`, `upgrade_type` mapeado)
- C1-A: ~45 arcanes con `condition` + `upgrade_type` — listos cuando `context.flags` exista

---

### Incarnon — gaps conocidos

87 weapons únicas (48 genesis), 727 efectos. P1 completo: 23 tokens activos.

**Pendientes de datos (no de diseño):**
- 5 weapons con perk set incompleto: Burston Prime, MK1-Braton, Gorgon Wraith, Dex Sybaris, Latron Wraith — completar con wiki
- ~30 efectos con placeholder `+X`/`+Y` — valor real requiere wiki

**Gaps de diseño (requieren C1):**
- C1-A: ~40 perks condicionales `context.flags` (`with_armor_over_N`, `with_melee_equipped`, etc.)
- C1-B: ~25+ perks on-event/stacking (`on_kill`, `on_headshot`, etc.) — requiere sistema de eventos
- `BASE_SET` operation: 2 perks (Atomos, Boar `mercenary_chamber`) establecen valor absoluto en lugar de sumar

---

## Dominio Data — Estado y decisiones

Leídos: `data/status.md`, `data/decisions.md`.

---

### Cobertura por sector (D-16 target ≥70%)

Fuente: `data/status.md` (v0.2.0, 2026-06-01). Fase 0 activa — conditions son tracking-only, default siempre activo (D-15).

| Sector | Cobertura actual | Estado |
|---|---|---|
| `conditions/L1` (estado `while_*`) | ~100% (10/10) | ✅ |
| `conditions/L2` (umbral `with_*`) | ~90% | ✅ (completar galvanizados/exilus) |
| `conditions/L3` (eventos `on_*`) | ~52% (~62/120 est.) | ⚠️ — **blocker principal** |
| `arcanes/condition` | ~70% (122/175) | ⚠️ (normalizar tokens inconsistentes) |
| `arcanes/upgrade_type` | ~43% (83/193) | ❌ |
| `mods/condition` | ~5% (43/669) | ❌ — **muy bajo** |
| `mods/upgrade_type` | ~18% (119/669 verificadas) | ❌ |
| `incarnon/condition` | ~17.9% (125/699) | ⚠️ |
| `incarnon/upgrade_type` | ~49.8% (348/699) | ⚠️ |
| `archon/upgrade_type` | ~74% (20/27) | ⚠️ |

**Condición de integración al engine:** ≥70% en el sector afectado antes de proceder (D-16). Actualmente ningún sector de datos masivos supera 70%.

**Orden de trabajo sugerido:** conditions/L3 → mods/condition → mods/upgrade_type → incarnon/condition → arcanes/upgrade_type.

---

### Categorías data:class:cat/a/B/D/E/F — definición canónica

Definidas en `data/status.md §Incarnon`. **Sin doc propio.** Aplicables a todos los schemas aunque solo estén documentadas en la sección de Incarnon.

| Cat | Condición | `upgrade_type` | `condition` | Estado |
|---|---|---|---|---|
| **A** | Sin condición | ✅ mapeado | ausente | Engine-ready directo |
| **B** | Con condición token | ✅ mapeado | token canónico | Engine-ready (depende de condition evaluation) |
| **D** | Sin condición | ❌ null | ausente | Display-only — sin path al engine |
| **E** | Con condición sin token | ❌ null | `null` | Display-only — tiene semántica, sin token |
| **F** | Variante null en base_value | — | — | Caso especial de variantes |

Distribución actual en incarnon: A=333 (47.6%), B=15 (2.1%), D=240 (34.3%), E=110 (15.7%), F=1.

**Deuda:** extraer esta definición a un doc global (`docs/data/rules/`) para que aplique a mods, arcanes, y cualquier schema futuro.

---

### D-series — decisiones clave activas

Fuente: `data/decisions.md` (v0.1.0, D-1 → D-18).

| ID | Título | Impacto directo |
|---|---|---|
| **D-1** | Override = capa de inteligencia manual, no deuda | Pipeline no toca overrides; DataLoader singleton (OQ-DATA-3) pendiente |
| **D-4** | `UPGRADE_MAP` en `@shared/types/modifier.ts` | Contrato compartido entre datos y engine, no interno del engine |
| **D-6** | `{FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}` + sub-familia cross-entity | Naming canónico de tokens. Sub-familia (`PRIMARY/SECONDARY/MELEE`) solo cuando el modificador no reside en el mismo nodo que su target |
| **D-7** | Token D-6 = futuro ID de atributo del engine | `UPGRADE_MAP` = puente temporal. Fase 1 (attrs no-daño) ✅ completada. Fase 2 (attrs de daño) pendiente |
| **D-9** | Tests usan datos reales del pipeline | Sin fixtures sintéticos — override + `console.warn` si token falta |
| **D-13** | Incarnon SSoT manual + patrón repository | Mismo patrón que archon-shards. Variantes con entradas separadas. Evolucionado en D-18. |
| **D-14** | `condition?` y `note?` como campos de diseño | Todos los schemas de stats. `note` = orientado a implementación futura, no a sesión actual. Evolucionado en D-18. |
| **D-15** | Fase 0 — conditions tracking-only, default activo | Engine aplica TODOS los modificadores sin evaluar `condition`. Stacking = valor máximo total. Evoluciona a Fase 1 cuando ≥70% coverage + SimContext con `context.flags`. |
| **D-16** | Target ≥70% por sector antes de engine integration | Cobertura por sector, no acumulado. Ningún sector de datos masivos supera 70% actualmente. |
| **D-17** | 3 tokens galvanizados pendientes de resolución | `WEAPON_FIRE_ITERATIONS` (alias de pipeline), `WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE` (sin D-6), beam range (sin token). Solo el primero funcional en Fase 0 vía UPGRADE_MAP. |
| **D-18** | Incarnon migra a `stats[]` + taxonomía monosemántica de `condition` | Shape de incarnon evolucionado. `condition`: ausente = sin condición, `null` = gap de datos, token = mapeado. Causa de los 5 tests fallando (IncarnonRepository aún lee `upgrades[]`). |

**Deuda heredada en D-6:** ~26 entradas en `mod-stats.override.json` con tokens `WEAPON_MELEE_*` intra-entity (sub-familia indebida). Silenciadas por engine en Fase 0. Cleanup pendiente.

---

## Lecturas pendientes

Docs marcados `[pendiente leer]` en el árbol. Prioridad sugerida por relevancia al trabajo activo:

**Referencia bajo demanda (no afectan nomenclaturas activas):**
- Todo `docs/domains/ui-ux/`
- `docs/data/pipeline/`
- `docs/data/references/`
- `docs/data/rules/roles.md`, `dependencies.md`, `kind-vs-category.md`, `schema-pilot-criteria.md`
- `docs/governance/decision-frontier.md`, `naming-conventions.md`, `jsdoc-standard.md`, `semantic-layers.md`, `type-system-boundaries.md`, `known-risks.md`
