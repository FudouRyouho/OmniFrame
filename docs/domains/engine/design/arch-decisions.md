---
Estado: "referencia"
Rol: "Decisiones arquitectónicas críticas del motor de simulación v2 — Sim-v2"
Impacto_ID: "E-01-Decisions"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-07-24"
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

El motor resuelve **por atributo**, no por entidad, en **un pass topológico** (Kahn). El acoplamiento
inter-nodo viaja por `.final` (persiste; los acumuladores se resetean cada pass): un read cross-nodo
(source-scaling, factores de pool) exige su **arista gemela** en `rebuildGraph`, o lee stale **en silencio**
(clase de bug recurrente). En la práctica el grafo es un **DAG puro** → un pass ya es el punto fijo; un
**guard de convergencia solo-test** (`test-setup.ts`) lo blinda: tras cada `resolve()` corre un pass de
confirmación, exige `Δ=0` y nombra el nodo si falta una arista.

Un ciclo real (`cycle_detected`: Kahn no ordena todos los nodos) hoy **corta con alerta** (throw) — el DAG
no los produce, y un ciclo dejaría nodos leyendo `base` en silencio. Resolverlo bien es un loop
*always-converge* —que volvería irrelevante el orden de aristas— **diferido** (Opción B) hasta que aparezca
el primer ciclo; mientras tanto el guard cubre la fragilidad del orden.

**Propósito:** evita cuelgues por recursión infinita **y** el orden-stale silencioso.

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

**Decisión:** `consume()` es un módulo real dentro de `@core/engine` (fuera de `__tests__/`): vive en `@core/engine/output/consume.ts`. Es el **punto de salida de C** — la superficie de consumo del dominio engine. **No es la Capa D.** El directorio se nombra `output/` (salida-de-C); se vetó `projection/` porque "Proyección" es el nombre propio de la Capa D — ver `DC-OQ-ENGINE-8` (sobrecarga del término, resuelta: las métricas salen como `CombatMetrics`, neutro).

**Distinción:**
- `consume()` = acceso a la salida resuelta de C (`snapshot(): SimulationEntity[]`; el tipo `ProjectionSnapshot` original se purgó; las métricas de combate salen aparte como `CombatMetrics`, `DC-OQ-ENGINE-8`). Vive en `@core/engine/output/`. Lo consumen **scripts y tests (no-dominios)** directamente.
- **Capa D** = consumo derivado (`ViewModelContract` v0 + su mapping `project()`). Vive **fuera** de `@core` y cruza por `@shared`; se cablea vía `useViewModel` (`@providers`).

**Consecuencia:** el CLI y la futura UI son **adaptadores hermanos** (Ports & Adapters) sobre el mismo puerto `consume()`: el CLI es la instancia **no-reactiva** (lee la salida de C directo, por ser script), la UI la **reactiva** (cruza por `@shared`). El módulo **no** se nombra `api/` (arrastra la connotación del diseño WebSocket muerto) ni `projection/` (projection = D, fuera de `@core`).

---

## 7. Frontera de dominios: `@core` no importable por dominios

**Decisión:** Los dominios (`domains/*`) **no importan `@core`**. Reafirma la Restricción 1 de `Project/CLAUDE.md` (lista permitida: `@shared`, `@lib`, `./internal` — `@core` excluido). `@core` es el dominio de lógica fuera de UI/consumo-derivado (capas **A, B, C**); el alias es solo empaquetado (podría ser `engine`).

**Consecuencia:**
- La UI cruza al motor **solo por `@shared`** (inversión de dependencias): la salida vía `ViewModelContract`, y por **simetría** la entrada (intención) también debe cruzar por `@shared` ↔ `EnsembleStore` (A) en `@core`.
- `UpgradeView` consume el `ViewModelContract` vía `useViewModel` (`@providers/Ensemble`, binding z3); ningún dominio importa `@core`.
- **`@providers` (capa de composición / adapter) SÍ importa `@core`**. `@providers` **no es un dominio de feature**; esta frontera y la Restricción 1 aplican a `domains/*`, no a la capa que compone adapters. `EnsembleProvider → @core/intention/ensemble-store` es válido (adapter→core, dirección correcta de Ports&Adapters). Ver `closed-decisions.md` DC-OQ-ENGINE-9.
- `ViewModelContract` debe ser **consumer-shaped** (un ViewModel de MVVM, alimentado por `lib/*` como ingredientes), nunca *producer-laundered* (la salida cruda re-exportada por `@shared` solo para legalizar el import).

**Estado:** `C→D→UI` es **prototipo en revisión**. `A→B→C` es coherente. La **simetría de entrada está realizada**: `ensemble.types` → `@shared/types/ensemble.ts`, `ensembleStore` (A1) → `@core/intention/`; `@core` reestructurado (Stage 0+1, DC-OQ-ENGINE-9). Ver `OQ-ENGINE-FUTURE`/`OQ-ENGINE-9` en [`../../../governance/open-questions.md`](../../../governance/open-questions.md).

---

## 8. Modelado incremental: input asumido → simulado (C1 es suelo de C2)

**Decisión:** El motor crece **mecanismo por mecanismo**, y cada mecanismo se modela primero en su forma de **estado asumido** (los valores se dan como input: "N status activos", "todos los buffs de equipo activos", "combo en X") y solo después —cuando el suelo lo justifique— en su forma **simulada** (el valor **emerge** de la timeline + RNG). El número bajo estado asumido (C1-honesto) **no es una alternativa a C2 ni lo pospone: es el suelo necesario de C2.** No se simula el status-dependent damage de un arma cuyo status/condition base está a medias.

**Justificación:**
- El eje de corte **no es ontológico** ("¿esto es C1 o C2?", resbaladizo) sino **operativo**: ¿el valor es *asumido como input* o *emergente de la simulación*? Es el mismo mecanismo en dos escalones — ej. Condition Overload / Galvanized con **N procs asumidos** (C1 con pasos extra, calculable hoy) vs. **uptime real** (C2, necesita `TimelineSimulator`/`EffectBehavior`/`RngProvider`).
- **`overframe.gg` no es techo ni referencia conceptual.** No calcula habilidades (muestra su descripción), EHP solo con stats base (sin mods/habilidades), sin selección de perks Incarnon ni habilidades duales. El `ability override` + el schema de habilidad del proyecto **ya lo exceden**. Sirve como oráculo **parcial** de validación solo para el subconjunto que sí calcula (stats de arma ideal). El objetivo es honestidad de simulación, no replicar un calculador ideal.
- **Gate de honestidad por mecanismo** (`entra` / `difiere` / `descarta`): *entra* si es abstraible con margen aritmético aceptable (con su caveat documentado como trazabilidad, no disfrazado de exactitud); *difiere* si el suelo aún no existe; *descarta* si no es abstraible de forma honesta hoy (ej. un arcano cuyo efecto depende de un externo que el motor no representa).
- La **abstracción de conjuntos emerge de acumular casos concretos**, no se diseña primero. Precedente: el análisis de damage types **destiló** el primitivo stack-tracker de los 16 tipos (`design/damage-status-model.md`) — no se partió de la abstracción. Buscar "la primitiva de las 10 habilidades" con 3 casos en la mano es el filo del over-engineering (el motor ya se reescribió 3×).

**Consecuencia:**
- **Anti-pozo operativo:** modo-input antes que modo-simulado, un mecanismo por vez. **Nunca "el sistema temporal completo de una".** Cada base C1 honesta es un pedazo de suelo simulable.
- **C2-temporal sigue siendo el destino, no un lujo diferible:** es la diferencia entre un *calculador* (miente al alza asumiendo 100% de uptime / combo máximo) y un *simulador* honesto ("este hit no proqueó → Galvanized pegó menos"). La brecha viva está en `EnemyState.processDots()` (decay lineal vs. N-timers, ver `../status.md` §C2 y `damage-status-model.md`).
- **Trazabilidad:** cada veredicto `entra`/`difiere`/`descarta` se registra (por conjunto). El registro acumulado **es** el insumo del que emerge la primitiva; no es papeleo, es el material de la abstracción.
- Enlaza con **§2** (Ability no tiene un único modelo ontológico — el veredicto por mecanismo es la instancia práctica de esa apertura) y con la doctrina de `test/gap-map.md` (mecánico-genérico por default, ability-like → fórmula dedicada como fallback).

### 8.1 La escalera de madurez (lente, no capa nueva)

Toda mecánica que "se siente C2" factoriza en `contribución = f(estado)`, ruteada a un bucket (`add`/`mult`/tabla), donde `estado ∈ {count, level, stacks, duration, ...}`. El invariante que decide el escalón **no es `f` ni el bucket** (esos varían libremente) — es **de dónde sale `estado`**:

- **Asumido (C1):** `estado` es un **input declarado** (asumo 10 stacks de Viral, combo máximo, N stacks de Galvanized). `f(estado)` es función pura → resuelve en el grafo hoy.
- **Emergente (C2):** `estado` **emerge** de una línea de tiempo (stacks se acumulan, combo decae, duración corre).

No hace falta una capa intermedia ni renombrar C2: cada mecanismo sube una **escalera ortogonal** al eje C1/C2, sin capa nueva —

```
(0) sin modelar → (1) número display → (2) fórmula de input declarado → (3) dinámica parcial → (4) timeline pleno
        └──────────────── C1 ────────────────┘        └──────────────── C2 ────────────────┘
```

**Corolario — clasificación de la superficie "que se siente sin atacar":**
- **(a) ya-hecho-no-catalogado** — ej. el *número* de `AVATAR_ADD_ABILITY_DURATION` ya lo resuelve Rhino; solo el *efecto que decae* es C2.
- **(b) decidido-no-implementado** — ej. Galvanized/CO/Cedo → familia `CONDITION_OVERLOAD` + variables (§9/§10). Con count declarado, `val × N` es C1.
- **(c) genuinamente pendiente** — ej. el peso de cada stack de status en el daño asumido: sin eso, `f(estado)` no tiene tabla honesta. Único de los tres que exige modelado nuevo (ver OQ-ENGINE-16).

### 8.2 Principio: "la fórmula lógica alcanza"

**Parar en el peldaño 2 salvo que un consumidor real fuerce subir.** El input declarado no es una maqueta provisional a reemplazar por el timeline — es el suelo honesto que cubre la mayoría de los usos (arsenal, comparación de builds — el número que overframe.gg/la UI clásica muestran). Subir a (3)/(4) es **decisión por consumidor**, no default.

Antídoto contra la trampa gemela: declarar-input **no es** bakear el producto (mata el reuso estático→dinámico, ver §9), ni un scaler genérico (el `CONTEXT_SCALE` que §9 ya mató). Familia **nombrada** con factores nombrados, siempre.

---

## 9. Condition Overload / GunCO: `co_behavior` (topología) + `CONDITION_OVERLOAD` (mecánica)

**Decisión:** Primer caso destilado de §8 (veredicto **ENTRA** en modo estático). La familia CO/GunCO — "+coefBase% daño directo por tipo de status en el target" (Condition Overload melee, Galvanized Aptitude/Savvy/Shot, perks incarnon) — se modela con **dos piezas ortogonales**:

1. **`co_behavior` — topología, agnóstica al modo.** Metadata cualitativa POR ATAQUE (no por arma, no por mod): a qué bucket compone el bonus. `'adding'` (junto a Serration, `mods_add_pct`), `'multiplying'` (multiplicador final aparte) o `'none'` (no aplica, ej. AoE radial). El dato normalizado vive en `MutatedDNA.co_behavior: Record<profile, CoBehavior>` (mapa por perfil); StaticHydrator lo **baja resuelto al perfil activo** de cada entidad en `SimulationEntity.co_behavior` — el motor lo consume directo, sin mirar un `active_profile_id` global (que es único para toda la sim y no modela el perfil por-arma). Resolución en `ItemRepository`: override (`weapon-stats.override.json`, campo `co_behavior`) **terminal** → **`kind=melee` → adding SIEMPRE** (el CO melee es aditivo pase lo que pase — comunidad: "con CO, Pressure Point está de más"; va ANTES del switch: el `AoE→none` es regla de guns, el heavy slam melee es AoE pero NO gun-radial — el slam ya no cae en `AoE→none`) → default por `shot_type` para guns (Hit-Scan→adding, Projectile→multiplying, AoE→none) → **ausente = gap** (no se asume). La tabla `shot_type` es señal, no ley: un override corrige la excepción (ej. Paris Charged Shot). `CoBehavior` es SSoT única en `@shared/types/modifier`. Reemplaza el muerto `behaviors: string[]` (engine v1, purgado — granularidad y tipo inversos).

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
- **Abstracción B — dispatch por tabla.** `resolveNode` mezclaba dos clases: **ops de acumulador** (`value` ES el efecto — el `switch`) vs **mecánicas de familia** (el efecto lo COMPUTA una fórmula desde el contexto + rutea a bucket(s) — CO, melee-combo, sniper-combo). El ruteo inline crecía O(n) por mecánica (doble `if` → triple). Se reemplazó por el **registro** `FAMILY_RESOLVERS` (`SimulationEngine.ts`). Generaliza solo el **dispatch**, NO el *qué*: cada op mapea a SU resolver; un no-familia no está en la tabla → cae al switch, no hereda ruteo (no resucita `CONTEXT_SCALE`, §9). Prueba: la 3ra mecánica (sniper) entró como **1 entrada + 1 resolver, cero cambios a `resolveNode`**.
- **Abstracción A — cierre en el TIPO (con la 3ra mecánica).** La 3ra mecánica (sniper combo) **disparó el trigger**: con 3 casos reales la forma de la unión se estabilizó y su divergencia quedó clara — los 3 factores no comparten shape (`CoFactors {2 vars}` / `MeleeComboFactors {1 var}` / `SniperComboFactors {1 var + 1 literal min_combo}`), `Modifier` era una bolsa de 3 campos opcionales mutuamente excluyentes, y `value` tenía 3 significados (efecto / coefBase / muerto). Se subió la distinción al TIPO: **`Modifier` = discriminated union por `operation`** (`contracts/primitives.ts`) con variantes `AccumulatorModifier | CoModifier | MeleeComboModifier | SniperComboModifier` sobre un `ModifierBase` común. El compilador ahora **exige los factores correctos por variante y prohíbe el `value` muerto** (los combos ya no lo llevan). Los productores dinámicos (Mod/Incarnon/Arcane/Shard — la `operation` viene del dato) construyen vía el factory `makeModifier` (centraliza el mapeo op→variante); las mecánicas intrínsecas sintetizan su variante directa. La tabla de B se reusó tal cual (los resolvers pasaron a recibir su variante). **Agregar una mecánica ahora**: 1 op + 1 factors + 1 variante + 1 resolver + 1 entrada en la tabla, todo compiler-enforced.
- **Cedo pasiva** prueba que la operation `CONDITION_OVERLOAD` debe poder originarse en **hidratación del arma** (unique trait), no solo en `ModRepository` — igual que un combo intrínseco. Andamiaje para fuente-pasiva sí; **poblar instancias pasivas no**, hasta tener el dato en pipeline (gate §8: falta dato ⇒ `difiere` la instancia, no la mecánica).
- Enlaza con **§9** (es su profundización: CO vista contra el corpus completo) y con la doctrina `condition` = vocabulario emergente (`../../../semantic/conditions.md`).

---

## 11. `STACK_DECAY_BUFF`: familia hermana de CO para buff-on-event con cap, C1-declarado

**Decisión:** Primer caso **no-CO** que entra por el mismo patrón de familia (§9/§10) — mecánica
distinta, mismo mecanismo de dispatch. El corpus real: 8 arcanos (Primary/Secondary Merciless,
Deadhead, Dexterity, Exhilarate, Cascadia Flare — barrido `docs/data/reports/audit-arcane-ability-like.md`)
**más 7 mods "Galvanized [Arma]"** (Chamber/Diffusion/Hell/Crosshairs/Scope/Elementalist/
Steel — ver evidencia abajo) con la forma `evento discreto → +val por stack, cap Nx`. Distinto de CO
en el eje que importa: **no lee status del target** (no hay `co_behavior`/bucket-routing ambiguo) —
el bonus aplica directo al `target_attribute` que el mod/arcano ya declara (daño%, crit%, energy
regen/s, etc.).

**✅ EJECUTADO (ladrillo #4 roadmap C1).** Vehículo real: Galvanized Chamber sobre Boltor
(`galvanized-stack-decay.test.ts`). Primer código de la familia — no había código para ninguno de
los dos schemas (ni arcanos ni mods).

**`ModifierOperation`: `STACK_DECAY_BUFF`.** Fórmula pura en `formulas/common/scaling-base.ts`
(co-locada con `clamp`, NO en `formulas/arcane/` — ese directorio nunca tuvo código; el primer
consumidor real resultó ser un mod, no un arcano, así que la promoción que este mismo párrafo
anticipaba ocurrió desde el día 1, sin migración):

```ts
stackDecayBonusPct(perStackPct: number, stacks: number, cap: number): number {
  return perStackPct * clamp(stacks, 0, cap); // clamp ya vive en common/scaling-base.ts
}
```

`stacks` es **C1-declarado** — misma altitud que `activeStacks` de CO hoy (§9: "el motor usa el
default 1" si no se declara, sin ningún tracker real detrás; acá el default es 0 — no hay stacks sin
kills, distinto de `meleeComboMult(0)=1` de `COMBO_SCALED_ADD`, cuyo tier base NO es cero). Este
resolver **no intenta modelar decay real** — esa brecha es explícitamente de `OQ-ENGINE-16`, no de
esta decisión.

**El hallazgo que reencuadró la ejecución: el dato NO estaba roto.** `D-15 §2` (VIGENTE)
ya documenta `base_value` = total-a-máximo-stacks como diseño **deliberado**, con el
desglose per-stack en `notes[]` como texto libre — verificado exacto en los 7 mods reales (ej.
Galvanized Chamber: `150/5=30`, coincide con la nota "per_stack: 30% at rank 10"). Lo que faltaba era
**estructurar** el cap: nuevo campo `max_stacks: number` en el stat (D-15 evolución, `ModStatRaw`),
sibling de `condition`/`base_value`/`upgrade_type`. `base_value` **no se re-autoriza** — el motor
deriva `perStackPct = base_value/max_stacks` en hidratación. Ausencia de `max_stacks` = stat normal
(camino genérico sin cambios, ej. `+80% Multishot` plano de Chamber, mismo mod).

**Galvanized Reflex queda fuera de esta pasada** (target `WEAPON_BASE_COMBO_INITIAL`, valor flat no
%, op `BASE_FLAT`) — el resolver rutea FIJO a `ADD` (los 7 casos reales son todos `%`); no se
construye bucket-routing genérico para 1 caso sin un 2do que lo fuerce (mismo principio anti-
`CONTEXT_SCALE` de §9).

**Trigger de hidratación: `stat.max_stacks` presente, NO `condition === 'on_kill'`.** El token
`on_kill`/`on_headshot_kill`/`on_melee_kill` es legítimo y se reusa en stats NO-stacking del MISMO
mod (ej. Galvanized Crosshairs mezcla `on_headshot` simple + `on_headshot_kill` stacking) —
condicionar por el token colgaría la familia de casos ajenos. Al detectar `max_stacks`, `condition`
se **descarta** (no pasa por `evalCondition`) — mismo tratamiento que `COMBO_SCALED_ADD` le dio a
`per_melee_combo_multiplier`: C1-declarado, no gate.

**`stacks_var` se deriva de `unique_name`, NO un nombre genérico compartido.** A diferencia de
`melee_combo_count` (un solo contador melee real) o `active_stacks` de CO, cada Galvanized/arcano de
esta familia es un buff **independiente** con su propio contador — dos equipados a la vez (slots
distintos) no deben colisionar en `context.variables`. Convención: `stack_decay:<unique_name>`.

**Justificación:**
- **Reutiliza el principio de §9, no la operación.** "Un futuro valor que emerge del contexto no-CO
  no hereda el ruteo ni se dropea" — `STACK_DECAY_BUFF` es exactamente ese caso: comparte la forma
  matemática de base (`valor × clamp(N, 0, cap)`) pero **no** comparte el bucket-routing de
  `co_behavior` (que es específico de cómo CO compone con el daño de arma). La primitiva compartida
  real (`clamp`) ya vivía en `formulas/common/` desde antes de CO — no hubo que extraer nada de
  `weapon-condition-overload.ts`, que nunca tuvo la primitiva genérica adentro.
- **Gate D-20 satisfecho — 2do schema real, no solo teórico.** `OQ-DATA-4` nombraba la divergencia
  mods-vs-arcanos como su ejemplo motivador (bridge de schema stacking/duration). Con los 7
  Galvanized reales cableados, el gate `≥2 casos misma forma` ya no depende de que los arcanos se
  pueblen — **ambos caminos coexisten**, mods ejecutado, arcanos arquitectura cerrada pendiente de
  dato.
- **Caso de estrés de `OQ-ENGINE-16`.** Esta familia es el caso concreto que esa OQ pedía como
  condición de resolución (T1: "elegir un caso concreto... y estresarlo con dato real antes de
  generalizar"). El resolver de esta decisión se queda deliberadamente en modo C1/declarado — no
  resuelve la fidelidad N-declarado-vs-timers-reales, la deja abierta y trazada ahí.
- **Regresión de honestidad detectada y corregida.** 3 tests preexistentes (`cedo-prime`, `felarx`,
  `laetum`) asumían que el modo "estático/techo" (`deriveStaticFlags`) activaba el bonus de
  Galvanized Hell/Diffusion al **valor máximo aplanado** con solo el flag `on_kill` derivado — un
  supuesto MÁS optimista que el que CO ya se auto-impone (`activeStacks` sin declarar → default 1,
  no max). Corregido: los 3 tests ahora declaran el cap explícito (`variables:
  {'stack_decay:<uid>': 4}`), igual que los tests de CO declaran `status_type_count` cuando quieren
  un N específico — mismos números finales, mecanismo honesto.

**Consecuencia:**
- Contratos: nueva variante discriminada en `Modifier` (patrón ya compiler-enforced desde §10:
  1 op + 1 factors + 1 variante + 1 resolver + 1 entrada en `FAMILY_RESOLVERS`) —
  `StackDecayBuffModifier {value: perStackPct, stack_decay_factors: {stacks_var, cap}}`.
- **Pendiente (arcanos, sin tocar esta sesión):** los 8 arcanos de esta familia siguen con
  `base_value: null` en `arcane-stats.override.json` — mismo prerequisito de dato que ya existía,
  ahora con el molde de `max_stacks` ya probado en mods como precedente directo a seguir.
- **Diferido explícitamente:** decay/duration real (C2) — el resolver consume `stacks` como
  input puro. Ver `OQ-ENGINE-16`.
- Enlaza con **§9/§10** (mismo mecanismo de familia, mecánica hermana no reuso) y **§8** (modo
  asumido primero). Cita cruzada: `OQ-DATA-4`, `OQ-ENGINE-16`, `data/decisions.md` D-15.

---

## 12. `linearThresholdScale`: primitivo compartido para cross-attribute-read (source_attribute)

**Decisión:** el campo `source_attribute` (`ModifierBase`, ya existente) + el orden topológico del
grafo (`SimulationEngine.rebuildGraph`, ya existente) son infraestructura **real y reusable** para
que un modifier lea el valor ya resuelto de OTRO atributo de la misma entidad. Pero el único
consumidor de `source_attribute` hoy (`SimulationEngine.ts:284-292`, `scaleFactor =
sourceNode.final / (sourceNode.base || 1)`) está **hardcodeado a un solo shape** ("ratio contra la
propia base" — el caso de Roar, `it.todo` en `rhino.test.ts:70`, **cero casos construidos hoy**) y
no sirve para el shape que necesitan 5 arcanos reales (Bulwark, Battery, Bellicose, Doughty,
Expertise — `docs/data/reports/audit-arcane-ability-like.md`, Familia D corregida).

**Evidencia — los 6 casos reales candidatos reducen algebraicamente a la misma forma:**

| Caso | Fuente | Fórmula real | Forma reducida |
|---|---|---|---|
| Roar (Rhino, no construido) | Ability Strength | `50% × (final/base)` | `perUnit(50) × (source−0) / unitSize(base dinámico)` |
| Primary Bulwark | Armor | `+1%/unidad sobre 1000, cap%` | `perUnit(1) × max(0, source−1000) / unitSize(1)` |
| Arcane Battery | Armor | `+1 Energy/punto, cap 1000` | `perUnit(1) × source / unitSize(1)` |
| Arcane Bellicose | Max Health | `+X%/250 HP, cap%` | `perUnit(X) × source / unitSize(250)` |
| Melee Doughty | Puncture Status Chance | `round(chance × 0.1 × val1)` | `perUnit(val1) × source / unitSize(10)` |
| Arcane Expertise | Ability Strength | `(source−100%) × rate` — **sin `max(0,...)`, puede ir negativo** | `perUnit(rate) × (source−100) / unitSize(1)` |

Los 6 son `perUnit × (source − threshold) / unitSize`, con `cap` y `max(0,...)` **opcionales por
consumidor** (Expertise deliberadamente no clampea en 0).

**Corte de responsabilidad (por qué esto NO es el error de `CONTEXT_SCALE`, §9):**
`CONTEXT_SCALE` murió por generalizar el **ruteo/disparador** — un valor no-CO se colaba y heredaba
comportamiento no pedido. `linearThresholdScale` es una **función pura, invocada explícitamente**
por cada consumidor con sus propios parámetros — no hay ruteo implícito que un caso ajeno pueda
heredar sin que alguien escriba la línea que la llama. Mismo estatus que `clamp()` (ya en
`common/scaling-base.ts` desde antes de CO): extraída temprano, sin riesgo, porque no rutea nada.

**Decisión de split:**
- **Se reusa el grafo** (`source_attribute` + orden topológico) — sirve a cualquier fórmula que
  necesite leer un atributo hermano ya resuelto, Roar incluido.
- **NO se generaliza el `scaleFactor` hardcodeado del switch genérico** — se queda dedicado a Roar
  (single case, sin construir, no se toca hasta que exista). Los 5 casos de Familia D **no pasan
  por ese switch**: cada uno es una fórmula dedicada propia (mismo enganche genérico per-arcano de
  §11), que internamente compone `linearThresholdScale` de `formulas/common/scaling-base.ts`.
- Gate D-20 (≥2 casos misma forma) superado de sobra: 6 casos reales, no 2.

**Consecuencia:**
- Nuevo export en `formulas/common/scaling-base.ts`: `linearThresholdScale(source, threshold,
  unitSize, perUnit): number` — sin cap, sin floor-en-cero (decisión del consumidor).
- Cada arcano de Familia D (`formulas/arcane/*`) importa el primitivo, fija sus 4 parámetros,
  compone `clamp()` si necesita cap, decide si clampea en 0 antes de capar.
- Roar (`formulas/ability/` cuando se construya) es un consumidor más del mismo primitivo, no un
  caso especial en el motor — pero su construcción es un ticket propio, separado en dos partes ya
  marcadas en `rhino.test.ts`: `fixture_03` (escalado atómico, self-contained) y `fixture_04`
  (ruteo cross-entity del bonus al arma equipada) — no confundir alcance.
- Enlaza con **§11** (mismo criterio de split: reusar la infraestructura de dependencia, no la
  fórmula específica) y **§9** (el principio "derivación no selección" aplicado por 3ra vez).
  Cita cruzada: `OQ-W-6` (Inaros, cross-stat composición — **fuera de este primitivo**, es fórmula
  dedicada de habilidad per `rhino.test.ts:72`, no `source_attribute` simple).

---

## 13. `EnemySnapshot`: primer pull-read C1-declarado sobre el estado del target

**Decisión:** primer primitivo para `condition` cuyo **sujeto** (§8-adyacente, eje "quién" de
`.working/c1-simulation-doctrine.md` §4-T5) es el **target**, no el jugador/loadout. Un objeto
congelado de dos campos — `EnemySnapshot { max_health, current_health }` — derivado de
`EnemyRepository.scale()` (pipeline "0", ya existente) contra un `health_pct` que el **consumidor
declara explícitamente** (C1-declarado, §8.1 escalón 2 — sin timeline, sin RNG). `deriveEnemyFlags(snapshot)`
proyecta el snapshot a los flags de `condition` que activa (hoy: `while_enemy_below_half_health`).

**Justificación:**
- **No inventa infraestructura — la extiende.** El motor ya evalúa `condition` genéricamente contra
  `context.flags` (`evalCondition`, `SimulationEngine.resolveNode`) y el modo estático ya declara
  flags a mano (`{flags:{...}}`, precedente CO estático). `EnemySnapshot` es solo la función que
  DERIVA esos flags de un estado real en vez de declararlos arbitrariamente — **cero cambios** a
  `SimulationContext`/`SimulationEngine`/`MutatorBridge`.
- **Deliberadamente mínimo.** Dos campos, uno declarado (`health_pct`). No se generaliza a
  armor/shields/status hasta que OTRO caso real lo fuerce (mismo principio anti-pozo de §8) — el
  candidato inmediato son los `while_enemy_*` restantes de `conditions.md` G3
  (`while_enemy_undamaged`, `while_enemy_status_count_below_3`), sin construirlos por anticipación.
- **Separado de `EnemyState` a propósito.** `EnemyState` es maquinaria C2 (estado por-efecto
  `Map<StatusEffect,S>`: stacks/pools, timeline). `EnemySnapshot` vive en el mismo directorio (`simulate/enemies/`) pero es C1 puro —
  mezclar los dos types haría parecer C2-listo algo que es solo un input declarado.
- **Vehículo real, no sintético.** El corpus trajo el gap: `while_enemy_below_half_health` existe en
  3 armas (Dread/Kunai/Sicarus, perks incarnon tier 2) pero solo Sicarus (Feigned Retreat) tiene
  semántica simple ("additive a mods, como Hornet Strike" — su propio `note`); Dread es
  multiplicador aislado y Kunai es dual-mode (normal/incarnon), ambos exigen fórmula dedicada
  propia. Se pobló el `upgrade_type: WEAPON_ADD_DAMAGE` que faltaba en Sicarus (dato — `resolveToken`
  ya deriva `op:ADD` genérico, cero código de motor); Dread/Kunai quedan gap trazado
  (`conditions.md` G3), sin tocar.

**Consecuencia:**
- Nuevo módulo `simulate/enemies/EnemySnapshot.ts`: `snapshotEnemy(scaled, healthPct)` +
  `deriveEnemyFlags(snapshot)`.
- Test end-to-end real (`enemy-snapshot.test.ts`): Arid Butcher escalado (pipeline "0") + Sicarus
  Prime/Feigned Retreat, `health_pct` declarado en 0.3/0.5/0.8 — confirma que el flag responde al
  snapshot derivado, no a un valor a mano.
- Cierra la primera instancia concreta de `.working/c1-simulation-doctrine.md` §5 (concepto
  `snapshot`, antes "no formalizado, pendiente de casos") y resuelve `while_enemy_below_half_health`
  en `conditions.md` G3 (perfil Sicarus únicamente).
- Enlaza con **§8** (modo asumido primero, C1 como suelo de C2) y **§9/§10/§11/§12** (mismo patrón:
  primitivo mínimo, consumido explícitamente, sin ruteo implícito heredado). Cita cruzada:
  `OQ-DATA-4` (T5, evidencia de un caso concreto del eje "quién").

---

## 14. Modelo de flujo del daño: propiedad y flujo (instancia→daño→estado), tres capas LEY/ESTADO/RESOLUCIÓN

**Decisión (RATIFICADO, marco; extracción de Familia A EJECUTADA).** El daño **no
pertenece** a weapon ni a enemy — **viaja**. El eje: `instancia (source) → daño → tipo de daño → estado
del daño (target)`. Algo *instancia* el daño (disparo, habilidad, tick de proc) cargando sus propiedades
(valor por tipo, crit, buckets ②, spec de aplicación de status); el paquete emanado es extensión de la
instancia; el **estado** (stacks de status) se acumula en el **target**. Source y target son **agnósticos
entre sí hasta el punto de resolución** — se encuentran recién cuando el paquete se resuelve contra
defensas + estado (`simulateAttack(entity, targetState)` → `resolveHit`).

**Corolario que corrige el error de ubicación:** como cualquier entidad instancia Y recibe daño, la **LEY**
de qué hace un status es **agnóstica al eje source/target** — no es "fórmula de enemigo", es ley del juego.

**Tres capas que antes estaban fundidas en `EnemyState`:**

| Capa | Qué es | Naturaleza | Dónde vive (post-extracción) |
|---|---|---|---|
| **LEY** | qué hace N stacks (función pura) | atemporal, C1-able | `formulas/status/` |
| **ESTADO** | este target tiene N stacks ahora | acumulativo (C2) / declarado (C1) | portador = la entidad-target (`EnemyState.stacks`) |
| **RESOLUCIÓN** | este hit contra este estado + defensas | puntual, instante congelado | el *pairing* source×target (`resolveHit`) |

**El vínculo tipo↔efecto se parte en dos aristas** (colapsarlas es el error):
- **Arista 1 — identidad (1:1, vocabulario):** `tipo-de-daño → proc-que-PUEDE-disparar` (heat→Ignite, nunca
  Corrosion). Fija → `docs/semantic/damage-types.md` (solo el nombre) + runtime `EFFECT_BY_DAMAGE_TYPE`/
  `EFFECT_BY_DOT_KEY` en `formulas/status/`.
- **Arista 2 — aplicación (NO 1:1, propiedad del INSTANCE):** `{forced_procs, status_chance}` (2a, spec
  C1-declarable, source-agnóstica) + el ROLL (2b, C2). **Gated** — ver frontera abajo.

**Consecuencia — Familia A extraída (esta sesión, el paso §6-SÍ que 3 casos reales fuerzan):**
- LEY de **Familia A** ("primer stack especial + incremento lineal con techo": `f(n) = first + perAdd ×
  max(0, n−1)`, clamp opcional) → `formulas/status/stack-debuff.ts`, función pura citada contra
  `status-effects.md`. Instancia Infection (Viral, ×2→×4.25) y Corrosion (strip 0.26→0.80 cap) con valores
  verificados; Disruption (Magnetic) **provisional = Infection** hasta cerrar la frontera O4.
- **LEY + ESTADO keyeados por EFECTO, no por tipo de daño.** `EnemyStatusState` renombrado
  `damage_corrosive→corrosion`, `damage_viral→infection`, `damage_heat→ignite`, `damage_magnetic→disruption`
  (snake_case). Esto resuelve la confusión de vocabulario del marco §1 (una habilidad que aplica Corrosion
  sin daño corrosivo ahora cae limpio) — mismo cambio, dos problemas.
- `EnemyState.getDamageMultiplier`/`getEffectiveArmor` → **orquestadores** (leen stacks, llaman la LEY;
  ya no la contienen). Coeficientes de `GameLaws` (configurables, override vía `MutatorBridge`) → parámetros
  de las fórmulas per-efecto. El armor-strip por tiempo de Heat (Ignite) NO es Familia A (rampa temporal) —
  se queda inline como excepción documentada.
- `procWeightByType` (ley de SELECCIÓN de proc) migrada `common/status-base.ts → formulas/status/proc-selection.ts`.
  `ELEMENT_COMBINATIONS` (ley de TIPO de daño) se queda en `common/` — eje ortogonal.
- **Partición por composición (damage-flow-model §5):** Familia A (extraída), Familia B (`stackDecayBonusPct`,
  §11, ya existía), Familia C (DoT-tick dependiente del daño del arma) = `damage-status-model.md §Checkpoint 3`,
  fuera de esta extracción.

**Lo que NO se construyó (norte, no obra a levantar de una — el motor ya se reescribió 3×):** el tipo
`DamageInstance` de primera clase, el contenedor de ESTADO entidad-neutral, la Arista 2, Familia C, las
facetas-LEY de Heat, y la resolución de Magnetic ×3.25 vs ×4.25 — todo trazado en
[`../../../governance/decision-frontier.md`](../../../governance/decision-frontier.md).

**Enlaza con §8** (modo asumido primero, la LEY es C1 puro), **§13** (`EnemySnapshot` es el pairing del lado
entrada; el estado del daño es su espejo del lado salida — mismo concepto `snapshot`), **§4** (double-dip:
pool② viaja con la instancia, matriz③ es del encuentro — prueba dura de que las capas son separadas), y
**§9/§10/§11/§12** (mismo patrón de primitivo mínimo consumido explícitamente). Cita cruzada:
`damage-status-model.md`, `references/wiki/mechanics/status-effects.md`.

---

## 15. El nodo-source: qué HACE una fuente (la regla es por verbo, no por habilidad) — HIPÓTESIS

> **Estado: HIPÓTESIS DE TRABAJO / prototipo — NO invariante ratificada** (a diferencia del resto de este
> doc). El **concepto general sigue sin construir**, pero **el verbo muta-state ya está construido end-to-end**:
> la CAPACIDAD (derive cross-entity `source_entity`) y el ADAPTADOR (`AbilityRepository` lee la ability activa
> del `ability-stats.override` — verbo = `upgrade_type` poblado — y emite el buff cross-entity). Roar por
> hidratación real: warframe strength → pool de facción del arma (`rhino.test.ts` `rhino_roar`,
> `GAMEPLAY_MULT_FACTION_DAMAGE` +127% = 50×2.54, al decimal vs `Roar.md`). Esto responde **"¿el motor consume habilidades?"** (sí, el
> primer verbo). El resto (simetría ②/③, sub-source, key-por-verbo, source-state VIVO con duración) se
> **refuerza o cae** con el corpus (Fase 2 — primero procesar datos) y el emite-instancia (Fase 3). Origen:
> debate (`.working/ability-model-debate.md`, gitignored). **No colgar más código que el eslabón ya sostenido por un test.**

**Planteo (refina §2).** "Ability no tiene modelo ontológico único" (§2) se precisaría así: no hay modelo
único de *efecto*, pero sí **anatomía única de source**. Toda fuente —arma, habilidad, minion, objeto— sería
un **nodo-source** que hace **dos verbos + un nulo**:

1. **Emite instancia** — paquete de daño target-agnóstico (§14, §2.0.1) con su Delivery (proyectil/hitscan/
   beam/AoE). Caso especial: la instancia puede **materializar una sub-source** (minion/objeto/exaltada §3)
   = nuevo nodo-source con su propio state que emite sus propias instancias (recursión).
2. **Muta un state** — el propio source-state, el de un aliado, o el del target (buff/debuff/heal/CC). Las
   instancias **derivan contra el state**. El "emit Modifier" (C1, `upgrade_type`) es la **proyección
   estática** de esto: sin duración → source-state = la entity estática de C1. `AbilityRepository` produce
   ese modifier desde `upgrade_type` (construido); el source-state VIVO (con duración) = G-a.
3. **(nulo)** valor display / fuera-de-sim (radius, duration, movilidad).

**La simetría (teoría, aún NO código).** ② y ③ del trazado (§2.0) serían la MISMA operación en nodos
distintos: **derivar-contra-un-state**. ② deriva la instancia contra el **source-state** (Roar viviría acá);
③ la resuelve contra el **target-state** (Viral/DR viven acá). Ambos serían `NeutralState`
(`../../../governance/decision-frontier.md` §4). El ciclo sería **simétrico alrededor de la instancia**.

**Consecuencia operativa — la regla del corpus (key-por-verbo).** Al catalogar el vocabulario de
habilidades, se ordena **por verbo** (emite/muta/sub-source), **nunca por identidad de habilidad ni por
grupo**. "Exaltada" no es una categoría — resuelve a sub-source (§3). "Chroma/Equinox" no son un grupo — son
un warframe cuyos stats mutan varios source-states exclusivos. Key = verbo disuelve el sesgo de identidad y
prohíbe grupos arbitrarios por construcción. (Esta regla vale para el trabajo de corpus **aunque la hipótesis
general aún no esté probada** — es disciplina de clasificación, no una afirmación de arquitectura.)

**Gates (nombrados, no construidos):** source-state vivo (G-a, 1er buff con duración = Rhino+Roar) ·
`NeutralState` base (G-b, 2ª columna) · recursión/sub-source (G-c). Ver `decision-frontier §4`.

**Enlaza con §2** (lo refinaría), **§3** (exaltada = sub-source), **§14** (el daño que la instancia emite
viaja), **§2.0/§2.0.1** (el trazado y el seam C1→C2).

---

## 16. Modelo de pools de daño (aditivo/facción, suman-dentro·multiplican-afuera) + facción C2·F

**Decisión (P2b).** La composición de daño se lee de `calculating-bonuses.md` (SSoT wiki), NO
del código (que estaba parcial/inline — reconciliación code↔`formulas/` en [`formulas-integration.md`](formulas-integration.md) §2/§5):

```
Total = base × (1 + Σ_aditivo) × (1 + Σ_facción) × ∏(independientes)
              [Serration+CO-add]  [Roar/Bane]      [CO-mult, combo, crit]
```

- **Dos pools GLOBALES que SUMAN dentro y se aplican como FACTOR (multiplican afuera):** el aditivo
  (Serration, `WEAPON_ADD_DAMAGE`) y el de facción (`GAMEPLAY_MULT_FACTION_DAMAGE`). Estructura idéntica:
  nodo global, miembros op `ADD` (suman en `mods_add_pct`), factor `= final/base = 1+Σ`. **Reusan la misma
  primitiva `globalDamageBucketFactor`** (`formulas/weapon/stat-accumulator.ts`, P2a) — NO son 2 primitivas,
  es una aplicada a dos nodos. La compositora (`calculateCurrentValue`) las multiplica.
- **El pool se distingue por ATTR (qué nodo), NO por op.** Serration y facción ambos usan op `ADD`; nodos
  distintos → pools distintos → multiplican. ⚠️ **El `_MULT_` de `GAMEPLAY_MULT_FACTION_DAMAGE` es un
  error de nombre, no una señal.** Por D-6 (`upgrade-tokens.md` §OPERATION, mapeo 1:1) `MULT` ⇒ op
  `MULTIPLICATIVE`; la op real es `ADD` (`UPGRADE_MAP` la pisa). **No leerlo como "su pool se aplica
  multiplicativamente"**: eso vale para **todo** pool global — el de Serration multiplica igual, con la
  misma `globalDamageBucketFactor`, y se llama `_ADD_`. Si `_MULT_` significara eso, Serration estaría
  mal nombrado. Rename diferido tras el shim C2·F (`vocabulary.md` L-8).
- **CO y Combo NO son upgrade tokens** — se autorutean por su mecánica (CO por `co_behavior`: adding→pool
  aditivo, multiplying→multiplicador independiente `×(1+co)`; Combo por su fórmula heavy `×mult`). Son
  multiplicadores **independientes** que multiplican, NO entran al pool de facción. (§9/§10.)
- **Facción NO alimenta el DoT** (`dotModdedBase` lee solo `WEAPON_ADD_DAMAGE`). El double-dip ×²
  **steady-state** es build-debt decidido (`DC-OQ-ENGINE-13`; `status.md §Deudas`), gated por poblar el
  pool②; el **transitorio** (buff mid-DoT) = `OQ-ENGINE-20`.

**Facción es C2·F — su gate vive en RESOLUCIÓN, no en C1 (hallazgo Felarx/Primed Cleanse).** El bonus de
facción (Bane/Cleanse) solo aplica si el target es de esa facción, y **`targetFaction` NO está en el
`SimulationContext`** — vive en `EnemyState`, se usa en ③ (`targetFactionMult`). Por eso NO se puede gatear
en el grafo C1. Aplicarlo incondicional sobre-cuenta (Felarx: ×1.55 sin target faction).

**Shim FLAGGED (temporal, `ModRepository.C2F_FACTION_TOKENS_DEFERRED`):** los tokens de facción C2·F **no
se emiten como modifier C1** hasta normalizar la semántica del token (que codifique facción + gate) y
migrar el bonus a resolución. El **pool C1 de facción queda para bonos INCONDICIONALES** (Roar, §15 —
Roar no gatea por facción). **Borrar el set al normalizar.**

**Estado P2b:** mecanismo del pool + shim construidos, suite verde; el pool C1 **ya tiene su primer miembro
real** — Roar, *wired* vía `AbilityRepository`: el buff incondicional del warframe entra al
`GAMEPLAY_MULT_FACTION_DAMAGE` del arma por hidratación, cross-entity, sin pasar por el shim C2·F.
**Enlaza con §9/§10** (CO/Combo, multiplicadores
independientes), **§14** (facción-en-DoT = ③; double-dip steady-state = build-debt, transitorio = OQ-20), **§15** (Roar = miembro incondicional del
pool). Cita: `calculating-bonuses.md`, `faction-damage.md`, `condition-overload.md`, `melee-combo.md`.
