---
Estado: "referencia"
Rol: "Decisiones arquitectónicas críticas del motor de simulación v2 — Sim-v2"
Version: "v0.2.7"
Impacto_ID: "E-01-Decisions"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-07-04"
Dependencias:
  - "docs/domains/engine/design/simulation-architecture.md"
  - "docs/domains/engine/engine-audit.md"
---

# Sim-v2 — Decisiones arquitectónicas críticas

Recoge las **invariantes arquitectónicas vigentes** del motor de simulación v2. Decisiones tomadas durante la fase pre-implementación (abril 2026) que se respetaron en el código actual. Para verificar qué parte se implementó vs sigue en deuda: ver [`../engine-audit.md`](../engine-audit.md).

---

## 1. Weapon como nodo canónico principal

**Decisión:** El nodo canónico de `Weapon` es **el arma completa**, no cada entrada de `attacks[]`.

**Justificación:**
- La mayoría de ataques dependen del ADN base del arma (`damage`, `criticalChance`, `criticalMultiplier`, `procChance`, `fireRate`, `multishot`)
- `attacks[]` funciona como colección de **canales derivados** o **subestructuras internas** de `Weapon`
- Reduce complejidad de propagación: los modifiers aplican primero al arma, luego se proyectan a sus ataques

**Excepciones reconocidas:**
- Armas con modos radicalmente distintos
- Variantes especiales
- Incarnon con comportamiento alterno fuerte

Aún así, esos casos se mantienen como **subnodos del arma**, no cambio del nodo canónico.

**Regla provisional:**
- `Weapon` = entidad persistente canónica
- `attacks[]` = subestructura resoluble dentro de `Weapon`
- Si un caso futuro rompe esa regla de forma sistemática, se reabre como excepción arquitectónica.

---

## 2. Ability no tiene un único modelo ontológico

**Decisión:** `Ability` no se modela con una regla rígida. Su naturaleza depende del tipo de habilidad y de lo que materializa.

### Casos base

- **Habilidad como behavior resoluble:** buffs, debuffs, escalados internos, efectos sobre stats o contexto.
- **Habilidad como origen de sub-entidad:** exaltadas, invocaciones, objetos persistentes de combate creados por la habilidad.

### Regla provisional para habilidades

| Tipo | Modelado |
|---|---|
| **Ability simple** | behavior resoluble |
| **Ability que crea objeto persistente** | behavior que materializa sub-entidad |
| **Ability exalted** | behavior que materializa una entidad derivada con shape de `Weapon` |

---

## 3. Caso especial: Exalted

Las exaltadas son el ejemplo más claro de por qué `Ability` no puede reducirse solo a buff o fórmula.

**Lectura:**
- Una exaltada es, funcionalmente, una **Weapon** para el simulador.
- Su existencia depende de una habilidad del Warframe.
- Modelo:
  - La habilidad es un `behavior`
  - La exaltada es una **entidad derivada** de tipo `Weapon`
  - La relación entre ambas queda explícita en hidratación y snapshot

**Consecuencia arquitectónica:** el motor permite entidades creadas por behaviors sin obligar a que todas las habilidades sean entidades persistentes por defecto. Evita forzar la misma ontología sobre buffs simples y armas exaltadas.

---

## 4. Resoluciones Críticas de Rigidez Arquitectónica

Las 6 decisiones que blindan el motor contra colapso por composición de modificadores.

> **Estado de implementación:** consultar [`../engine-audit.md`](../engine-audit.md) §1-3. Resumen rápido: §4.1 ✅ §4.2 ✅ §4.4 ✅ implementadas; §4.3 (Delta Stream — array plano en su lugar) ❌ §4.5 (Decorator Layers) ❌ §4.6 (Casting Snapshot) ❌ diseñadas pero no implementadas.

### 4.1 Stat Accumulator v3

Se desglosa la suma en `BaseFlat`, `BaseAddPct`, `ModsAddPct`, `TotalFlat` y `Multiplicative`.

**Propósito:** blinda el motor contra el "Spaghetti de Arcanos" y garantiza que el escalado de mods sea siempre sobre la base real modificada.

### 4.2 Attribute-Level Resolve (Graph Convergence)

El motor resuelve **por atributo**, no por entidad. Para dependencias circulares, aplica un ciclo de 3 iteraciones (Fixed-Point). Si no converge, congela y emite alerta.

**Propósito:** evita cuelgues por recursión infinita.

### 4.3 Differential Timeline Stream

Sustituye el envío de snapshots masivos por un flujo de **deltas + Keyframes opcionales**.

**Propósito:** reduce el payload de megabytes a kilobytes, eliminando el lag en la UI durante el scrubbing del timeline.

### 4.4 Hybrid Simulation (Expected Value Mode)

El motor conmuta a un modelo estadístico de agregación cuando la densidad de eventos (ej: escopetas con multishot extremo) supera el umbral de energía.

**Propósito:** mantiene la precisión del DPS sin sacrificar el hilo principal.

### 4.5 Layered Logic Decorators

Se establecen **6 capas de ejecución fijas** (desde `INITIAL_OVERRIDE` hasta `FINAL_CLIP`).

**Propósito:** elimina condiciones de carrera y garantiza que los "Caps" se apliquen siempre después de los multiplicadores.

### 4.6 Casting Snapshots (Injected DNA)

Las habilidades "capturan" el estado del padre al momento del casteo. Este snapshot se inyecta como ADN a la nueva entidad.

**Propósito:** mantiene la inmutabilidad y la unidireccionalidad de datos.

---

## 5. Oráculo del motor = CLI, no MCP

**Decisión:** El consumidor del motor para asistencia de agente (verificar outputs on-demand) es un **CLI** (node, vía Docker/tsx), no un servidor MCP. MCP queda **diferido, no descartado**: cuando llegue será transporte fino sobre la misma lógica, por lo que construir el CLI ahora lo de-riesga.

**Justificación:**
- El dataset (>12 MB) no entra en el contexto del agente, y el motor TS no se puede "leer" para simular outputs a mano de forma fiable.
- CLI gana a MCP por portabilidad dual-boot: el spawn diverge por OS y el CLI absorbe esa divergencia en runtime.
- Cierra el loop "verificar contra el motor antes de asertar" (ver [`../test/test-workflow.md`](../test/test-workflow.md)).

**Consecuencia:** El CLI es el primer **cliente real consumiendo el motor** que `OQ-ENGINE-FUTURE` pone como condición para materializar la Capa D — aunque no-UI.

---

## 6. `consume()` = salida de C, no Capa D

**Decisión:** `consume()` se promovió a un módulo real dentro de `@core/engine` (fuera de `__tests__/`): vive en `@core/engine/output/consume.ts` (2026-06-10). Es el **punto de salida de C** — la superficie de consumo del dominio engine. **No es la Capa D.** El directorio se nombra `output/` (salida-de-C); se vetó `projection/` porque "Proyección" es el nombre propio de la Capa D — ver `OQ-ENGINE-8` (sobrecarga del término).

**Distinción:**
- `consume()` = acceso a la salida resuelta de C (`snapshot(): SimulationEntity[]`; el tipo `ProjectionSnapshot` original se purgó, rename en `OQ-ENGINE-8`). Vive en `@core/engine/output/`. Lo consumen **scripts y tests (no-dominios)** directamente.
- **Capa D** = consumo derivado (`ViewModelContract` v0 + su mapping `project()`). Vive **fuera** de `@core` y cruza por `@shared`; se cablea vía `useViewModel` (`@providers`). (El `useSimulation` co-ubicado en `@core/engine/hooks` que cumplía este rol parcial fue **purgado** 2026-06-16, no reubicado.)

**Consecuencia:** el CLI y la futura UI son **adaptadores hermanos** (Ports & Adapters) sobre el mismo puerto `consume()`: el CLI es la instancia **no-reactiva** (lee la salida de C directo, por ser script), la UI la **reactiva** (cruza por `@shared`). El módulo **no** se nombra `api/` (arrastra la connotación del diseño WebSocket muerto) ni `projection/` (projection = D, fuera de `@core`).

---

## 7. Frontera de dominios: `@core` no importable por dominios

**Decisión:** Los dominios (`domains/*`) **no importan `@core`**. Reafirma la Restricción 1 de `Project/CLAUDE.md` (lista permitida: `@shared`, `@lib`, `./internal` — `@core` excluido). `@core` es el dominio de lógica fuera de UI/consumo-derivado (capas **A, B, C**); el alias es solo empaquetado (podría ser `engine`).

**Consecuencia:**
- La UI cruza al motor **solo por `@shared`** (inversión de dependencias): la salida vía `ViewModelContract`, y por **simetría** la entrada (intención) también debe cruzar por `@shared` ↔ `EnsembleStore` (A) en `@core`.
- `domains/arsenal/view/UpgradeView.tsx` importando `@core/engine/hooks/useSimulation` fue una **violación/drift** (stub conectado antes de existir D). **RESUELTO 2026-06-12:** consume el `ViewModelContract` vía `useViewModel` (`@providers/Ensemble`, binding z3); ningún dominio importa `@core`.
- **`@providers` (capa de composición / adapter) SÍ importa `@core`** — ruling 2026-06-12. `@providers` **no es un dominio de feature**; esta frontera y la Restricción 1 aplican a `domains/*`, no a la capa que compone adapters. `EnsembleProvider → @core/intention/ensemble-store` es válido (adapter→core, dirección correcta de Ports&Adapters). Ver `closed-decisions.md` DC-OQ-ENGINE-9.
- `ViewModelContract` debe ser **consumer-shaped** (un ViewModel de MVVM, alimentado por `lib/*` como ingredientes), nunca *producer-laundered* (la salida cruda re-exportada por `@shared` solo para legalizar el import).

**Estado:** `C→D→UI` es **prototipo en revisión**. `A→B→C` es coherente. La **simetría de entrada quedó realizada (2026-06-12)**: `ensemble.types` → `@shared/types/ensemble.ts`, `ensembleStore` (A1) → `@core/intention/`; `@core` reestructurado (Stage 0+1, DC-OQ-ENGINE-9). Ver `OQ-ENGINE-FUTURE`/`OQ-ENGINE-9` en [`../../../governance/open-questions.md`](../../../governance/open-questions.md).

---

## 8. Modelado incremental: input asumido → simulado (C1 es suelo de C2)

**Decisión:** El motor crece **mecanismo por mecanismo**, y cada mecanismo se modela primero en su forma de **estado asumido** (los valores se dan como input: "N status activos", "todos los buffs de equipo activos", "combo en X") y solo después —cuando el suelo lo justifique— en su forma **simulada** (el valor **emerge** de la timeline + RNG). El número bajo estado asumido (C1-honesto) **no es una alternativa a C2 ni lo pospone: es el suelo necesario de C2.** No se simula el status-dependent damage de un arma cuyo status/condition base está a medias.

**Justificación:**
- El eje de corte **no es ontológico** ("¿esto es C1 o C2?", resbaladizo) sino **operativo**: ¿el valor es *asumido como input* o *emergente de la simulación*? Es el mismo mecanismo en dos escalones — ej. Condition Overload / Galvanized con **N procs asumidos** (C1 con pasos extra, calculable hoy) vs. **uptime real** (C2, necesita `TimelineSimulator`/`StatusEngine`/`RngProvider`).
- **`overframe.gg` no es techo ni referencia conceptual.** No calcula habilidades (muestra su descripción), EHP solo con stats base (sin mods/habilidades), sin selección de perks Incarnon ni habilidades duales. El `ability override` + el schema de habilidad del proyecto **ya lo exceden**. Sirve como oráculo **parcial** de validación solo para el subconjunto que sí calcula (stats de arma ideal). El objetivo es honestidad de simulación, no replicar un calculador ideal.
- **Gate de honestidad por mecanismo** (`entra` / `difiere` / `descarta`): *entra* si es abstraible con margen aritmético aceptable (con su caveat documentado como trazabilidad, no disfrazado de exactitud); *difiere* si el suelo aún no existe; *descarta* si no es abstraible de forma honesta hoy (ej. un arcano cuyo efecto depende de un externo que el motor no representa).
- La **abstracción de conjuntos emerge de acumular casos concretos**, no se diseña primero. Precedente: el análisis de damage types **destiló** el primitivo stack-tracker de los 16 tipos (`design/damage-status-model.md`) — no se partió de la abstracción. Buscar "la primitiva de las 10 habilidades" con 3 casos en la mano es el filo del over-engineering (el motor ya se reescribió 3×).

**Consecuencia:**
- **Anti-pozo operativo:** modo-input antes que modo-simulado, un mecanismo por vez. **Nunca "el sistema temporal completo de una".** Cada base C1 honesta es un pedazo de suelo simulable.
- **C2-temporal sigue siendo el destino, no un lujo diferible:** es la diferencia entre un *calculador* (miente al alza asumiendo 100% de uptime / combo máximo) y un *simulador* honesto ("este hit no proqueó → Galvanized pegó menos"). La brecha viva está en `EnemyState.processDots()` (decay lineal vs. N-timers, ver `../status.md` §C2 y `damage-status-model.md`).
- **Trazabilidad:** cada veredicto `entra`/`difiere`/`descarta` se registra (por conjunto). El registro acumulado **es** el insumo del que emerge la primitiva; no es papeleo, es el material de la abstracción.
- Enlaza con **§2** (Ability no tiene un único modelo ontológico — el veredicto por mecanismo es la instancia práctica de esa apertura) y con la doctrina de `test/gap-map.md` (mecánico-genérico por default, ability-like → fórmula dedicada como fallback).

---

## 9. Condition Overload / GunCO: `co_behavior` (topología) + `CONDITION_OVERLOAD` (mecánica)

**Decisión:** Primer caso destilado de §8 (veredicto **ENTRA** en modo estático). La familia CO/GunCO — "+coefBase% daño directo por tipo de status en el target" (Condition Overload melee, Galvanized Aptitude/Savvy/Shot, perks incarnon) — se modela con **dos piezas ortogonales**:

1. **`co_behavior` — topología, agnóstica al modo.** Metadata cualitativa POR ATAQUE (no por arma, no por mod): a qué bucket compone el bonus. `'adding'` (junto a Serration, `mods_add_pct`), `'multiplying'` (multiplicador final aparte) o `'none'` (no aplica, ej. AoE radial). El dato normalizado vive en `MutatedDNA.co_behavior: Record<profile, CoBehavior>` (mapa por perfil); StaticHydrator lo **baja resuelto al perfil activo** de cada entidad en `SimulationEntity.co_behavior` — el motor lo consume directo, sin mirar un `active_profile_id` global (que es único para toda la sim y no modela el perfil por-arma). Resolución en `ItemRepository`: override (`weapon-stats.override.json`, campo `co_behavior`) **terminal** → default por `shot_type` (Hit-Scan→adding, Projectile→multiplying, AoE→none; **`kind=melee` + shot_type None → adding**, el CO clásico melee es aditivo) → **ausente = gap** (no se asume). La tabla `shot_type` es señal, no ley: un override corrige la excepción (ej. Paris Charged Shot). `CoBehavior` es SSoT única en `@shared/types/modifier`. Reemplaza el muerto `behaviors: string[]` (engine v1, purgado — granularidad y tipo inversos).

2. **`CONDITION_OVERLOAD` — mecánica, disparador del ruteo.** Es una `ModifierOperation` de **familia** (no una composición genérica): el valor lo calcula `coBonusPct` (SSoT en `formulas/weapon/weapon-condition-overload.ts`) = `coefBase × activeStacks × N`; el **bucket lo decide `co_behavior`, no la operación**. Las dos dimensiones viajan **nombradas** en `Modifier.co_factors` (`{stacks_var, status_count_var}`), resueltas del contexto. **No se bakea el producto** — la separación es lo que permite que §8 opere: en **modo estático/techo** el consumidor las declara (perfect-clic, replica el número de overframe.gg como *input*, no como ley); en **modo dinámico** emergen (stacks de kills en el tiempo, N del `EnemyState`) — misma mecánica, misma topología, distinta fuente. El motor es idéntico en ambos modos.

**Justificación:**
- El eje estático/dinámico (§8, ≡ asumido/emergente) **no es una fase de desarrollo sino una propiedad de la consulta**: el mismo motor responde techo o esperado según lo que A2 pide. `co_behavior` es agnóstico a ese eje (el bucket no cambia); solo la *fuente* de los factores cambia. Modelar el estático hoy **no cierra ninguna puerta** — construye el andamiaje (operation `CONDITION_OVERLOAD` + `coBonusPct` + ruteo) que el dinámico hereda intacto.
- **Techo ≠ mentira.** El estático (perfect-clic) es una métrica honesta *si se etiqueta como techo*, no si se disfraza de esperado. La deshonestidad está en confundirlos, no en calcular el techo.
- **Disparador de familia, no operación genérica.** El ruteo por `co_behavior` se dispara por `operation === 'CONDITION_OVERLOAD'` (mecánica CO explícita), no por una operación reutilizable. Así un futuro "valor que emerge del contexto" no-CO no hereda el ruteo ni se dropea. (Rediseño A: la primera versión usó un `CONTEXT_SCALE` genérico + `context_variables: string[]` posicional; corregidos.)

**Consecuencia:**
- Contratos: `MutatedDNA.co_behavior` (mapa por perfil) + `SimulationEntity.co_behavior` (resuelto al perfil) + `Modifier.co_factors` (dos dimensiones nombradas) + operation `CONDITION_OVERLOAD`. `CoBehavior` **SSoT única** en `@shared/types/modifier`, consumida por el contrato del engine y por la fórmula pura sin violar la pureza de `formulas/` (que ya importa `@shared/types`).
- Cálculo: el motor **consume `coBonusPct`** (`formulas/weapon`), no lo duplica. `applyConditionOverload` (fórmula terminal escalar-cerrada) queda reservada para C2 (daño final), no la llama el grafo de buckets. Cierra la deuda de reconciliación con `formulas/` (ver [`formulas-integration.md`](formulas-integration.md)).
- Primer arma: Cedo Prime (`cedo-co-static.test.ts`) — sus 3 `shot_type` en un arma validan los 3 buckets **end-to-end**: `adding` (Normal Attack, techo N=3/stacks=2: `84.8 → 161.6`, +240%), `multiplying` (Alt-Fire Glaive → `multiplicative`, **fidelidad confirmada en juego**), `none` (Radial AoE, no aplica).
- **Diferido (modo dinámico):** `activeStacks` y `N` reales requieren `EnemyState`/timeline (misma brecha `processDots` de §8). El `maxStacks` por mod y la abstracción del contador aún **no** se diseñan — emergen con más casos (rifle/secondary/melee/incarnon: solo verificar datos, no re-map — ver `../../../data/decisions.md` D-17).
- Enlaza con **§8** (es su primer caso concreto) y **§1** (el `co_behavior` por perfil respeta "el arma es el nodo canónico, `attacks[]` sus subestructuras").

---

## 10. Familia `condition-scaled`: partición por composición, no por tema

**Decisión:** El corpus real de "bonus por condición transiente en el target" (wiki *Condition Overload-Style Bonuses*: CO melee, Galvanized ×3, Cedo pasiva, Secondary Shiver, ~8 perks incarnon, Kunai/Dread, Shattering Frost, Catalyze) **no es una mecánica**: es un **eje de vocabulario** que se parte en **tres formas por CÓMO computan el valor**, no por el tema que comparten. El modelo particiona por composición; la agrupación de la wiki ("additively stack in the list") es una observación de *resultado* (todas caen en el bucket aditivo), no el criterio de modelado.

| Forma | Fuentes | Cómo computa | Resuelto por |
|---|---|---|---|
| **Gate aditivo** (booleano) | Kunai/Dread (+100% vs <50% HP), Shattering Frost (vs Frozen) | `condition ? value : 0` | **`condition` + `ADD` — ya existe** (`evalCondition` contra `context.flags`) |
| **Escalado aditivo per-N** | CO, Galvanized ×3, Cedo, Shiver (per freeze stack), mayoría de perks | `coef × stacks × N` | **`CONDITION_OVERLOAD` + `co_factors`** (§9) — la mecánica CO |
| **Escalado exponencial** | Catalyze (Lavos) | `base × 2^N` | **fórmula dedicada** + es **habilidad** (§2/§3), fuera del grafo de buckets |

**Justificación:**
- **La partición la firma la propia wiki:** agrupa lo que "stackea aditivo" y **excluye Catalyze** por "exponential per condition". Aditivo (`1 + coef·N`) vs exponencial (`2^N`) es composición **opuesta**, no "similar en esencia" — colapsarlos mentiría sobre la composición (el mismo criterio que hizo honestos a los buckets §4.1: se colapsa lo que compone igual, no lo que se parece).
- **Kunai/Dread NO son CO:** "+100% vs <50% HP" es un **gate** (flag), no un escalado (no hay N). Caen en el bucket aditivo al final, pero se computan con `condition`+`ADD` — el motor ya los resuelve, no tocan la maquinaria CO. La distinción viaja en el contrato: **gate → `context.flags`; escala → `context.variables`**.
- **Generalización segura = fuente del factor, NO el ruteo.** Dentro del escalado aditivo, el "N" deja de ser "unique status count" y pasa a ser "el valor de la variable de condición que sea" (`unique_status_count`, `freeze_stacks`, …). Se generaliza **la fuente** del factor manteniendo fijo **el CÓMO** (aditivo, bucket de mods, disparador `operation === 'CONDITION_OVERLOAD'`). Esto **no reabre** el `CONTEXT_SCALE` genérico que §9 mató: aquella muerte fue por generalizar el *ruteo/disparador* (un no-CO se colaba); generalizar solo la variable, con disparador de familia explícito, es cerrado.

**Consecuencia:**
- **CO se encapsula fuera de `resolveNode` (Abstracción B, no A).** El ruteo inline (doble `if (operation === 'CONDITION_OVERLOAD')` en `SimulationEngine.resolveNode`) es **deuda de coherencia hoy**, no diseño anticipado: CO ya es multi-fuente (mod/galvanized/perk/pasiva). Se extrae a una **unidad cohesiva nombrada** disparada por la operation de familia — se saca el *cómo* del hot loop **sin genericizar el *qué***. La regla "esperar más casos" (§8) **no aplica** a esto: los casos ya existen. Sí aplica a construir la capa genérica de mecánicas (Abstracción A: combo/heavy/slam aún no existen en código) — eso sigue diferido hasta que su forma común emerja de ≥2 mecánicas encapsuladas reales.
- **Cedo pasiva** prueba que la operation `CONDITION_OVERLOAD` debe poder originarse en **hidratación del arma** (unique trait), no solo en `ModRepository` — igual que un combo intrínseco. Andamiaje para fuente-pasiva sí; **poblar instancias pasivas no**, hasta tener el dato en pipeline (gate §8: falta dato ⇒ `difiere` la instancia, no la mecánica).
- Enlaza con **§9** (es su profundización: CO vista contra el corpus completo) y con la doctrina `condition` = vocabulario emergente (`../../../semantic/conditions.md`).
