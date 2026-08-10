---
Estado: "referencia"
Rol: "Decisiones arquitectónicas críticas del motor de simulación v2 — Sim-v2"
Impacto_ID: "E-01-Decisions"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-08-08"
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
- **C2-temporal sigue siendo el destino, no un lujo diferible:** es la diferencia entre un *calculador* (miente al alza asumiendo 100% de uptime / combo máximo) y un *simulador* honesto ("este hit no proqueó → Galvanized pegó menos"). La brecha viva está en el **decay escalar** de `behaviors.ts` (declara 6 s lineales, implementa una exponencial que no termina — ver `../status.md §Deudas` y `damage-status-model.md`).
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

1. **`co_behavior` — topología, agnóstica al modo.** Metadata cualitativa POR ATAQUE (no por arma, no por mod): a qué bucket compone el bonus. `'adding'` (junto a Serration, `mods_add_pct`), `'multiplying'` (multiplicador final aparte) o `'none'` (no aplica, ej. AoE radial). El dato normalizado vive en `MutatedDNA.co_behavior: Record<profile, CoBehavior>` (mapa por perfil); StaticHydrator lo **baja resuelto al perfil activo** de cada entidad en `SimulationEntity.co_behavior` — el motor lo consume directo, sin mirar un `active_profile_id` global (que es único para toda la sim y no modela el perfil por-arma). Resolución en `ItemRepository`: override (`weapon-stats.override.json`, campo `co_behavior`) **terminal** → **`kind=melee` → adding SIEMPRE** (el CO melee es aditivo pase lo que pase — comunidad: "con CO, Pressure Point está de más"; va ANTES del switch: el `AoE→none` es regla de guns, el heavy slam melee es AoE pero NO gun-radial — el slam ya no cae en `AoE→none`) → default por `shot_type` para guns (Hit-Scan→adding, Projectile→multiplying, AoE→none) → **ausente = gap** (no se asume). La tabla `shot_type` es señal, no ley: un override corrige la excepción. Lo que ese override **no** corrige es la base de cálculo (pieza 3): Paris Charged Shot necesita las dos piezas, y con sólo el bucket el bonus queda al doble del real. `CoBehavior` es SSoT única en `@shared/types/modifier`. Reemplaza el muerto `behaviors: string[]` (engine v1, purgado — granularidad y tipo inversos).

2. **`CONDITION_OVERLOAD` — mecánica, disparador del ruteo.** Es una `ModifierOperation` de **familia** (no una composición genérica): el valor lo calcula `coBonusPct` (SSoT en `formulas/weapon/weapon-condition-overload.ts`) = `coefBase × activeStacks × N`; el **bucket lo decide `co_behavior`, no la operación**. Las dos dimensiones viajan **nombradas** en `Modifier.co_factors` (`{stacks_var, status_count_var}`), resueltas del contexto. **No se bakea el producto** — la separación es lo que permite que §8 opere: en **modo estático/techo** el consumidor las declara (perfect-clic, replica el número de overframe.gg como *input*, no como ley); en **modo dinámico** emergen (stacks de kills en el tiempo, N del `EnemyState`) — misma mecánica, misma topología, distinta fuente. El motor es idéntico en ambos modos.

3. **`co_base` — base de cálculo, ortogonal al bucket. DECLARADO EN EL SCHEMA, SIN CÓDIGO.** Metadata por ataque: **sobre qué base** se computa el `+X%` que `coBonusPct` produce. Default = la base del propio ataque. Los ataques que **derivan** de otro lo computan sobre la base del **padre**: el radial sobre el impacto directo que lo genera, el disparo cargado sobre el sin cargar, el proyectil hijo sobre el proyectil que lo escupe. El bonus resultante queda por encima o por debajo del `X%` listado según cuál de las dos bases sea mayor — no es otro bucket, es otra base. Como el CO aterriza en el pool porcentual `WEAPON_ADD_DAMAGE`, la corrección se expresa como un **factor sobre el valor** (`mods_add_pct += coBonusPct × base_padre / base_propia`) y la aritmética de `resolveStatValue` no cambia. El ratio **se deriva, no se declara**: las dos bases ya viven en `innate_dna.profiles`, que `StaticHydrator` baja entero a la entity — el override sólo lleva el **puntero** al ataque padre. `co_base` **no** hereda el `co_behavior` del padre: los dos ejes son independientes (la bomba hija de la Kuva Bramma es `adding` con padre `multiplying`).

**El campo vive hoy en el schema del override y en ningún contrato TS ni resolver** (`../../../data/schemas/weapons/weapons-attack-structure.md`). La regla padre→hijo reproduce el ratio medido por la wiki al decimal en 6 armas (Ferrox 350%, Opticor Vandal 200%, Trumna 164%, Ambassador 75%, Paris Prime 50%, Lanka 38%) y **corrige** a la fuente en una séptima (Kulstar: la wiki mide bonus 200 sobre base 75 y publica 257%, cuando `200/75 = 266.7%`), pero **discrepa en dos** (Braton Prime, Zylok Prime — la wiki usa bases que el dataset no tiene). Poblar punteros sobre una regla que todavía falla en dos casos afirmaría más de lo medido: la investigación es `OQ-ENGINE-27`.

**Justificación:**
- El eje estático/dinámico (§8, ≡ asumido/emergente) **no es una fase de desarrollo sino una propiedad de la consulta**: el mismo motor responde techo o esperado según lo que A2 pide. `co_behavior` es agnóstico a ese eje (el bucket no cambia); solo la *fuente* de los factores cambia. Modelar el estático hoy **no cierra ninguna puerta** — construye el andamiaje (operation `CONDITION_OVERLOAD` + `coBonusPct` + ruteo) que el dinámico hereda intacto.
- **Techo ≠ mentira.** El estático (perfect-clic) es una métrica honesta *si se etiqueta como techo*, no si se disfraza de esperado. La deshonestidad está en confundirlos, no en calcular el techo.
- **Disparador de familia, no operación genérica.** El ruteo por `co_behavior` se dispara por `operation === 'CONDITION_OVERLOAD'` (mecánica CO explícita), no por una operación reutilizable. Así un futuro "valor que emerge del contexto" no-CO no hereda el ruteo ni se dropea. (Rediseño A: la primera versión usó un `CONTEXT_SCALE` genérico + `context_variables: string[]` posicional; corregidos.)
- **Los dos ejes de la wiki no son ortogonales entre sí: el segundo vive dentro del primero.** La fuente clasifica el CO en *stacking* (multiplicativo/aditivo) × *application* (por encima/exacto/por debajo). Medido sobre su propia tabla ítem-por-ítem (174 filas), **88 de las 90 filas `Multiplying` tienen ratio 100%** — la fila #1 dice "por encima del X%" en la columna *Player's Metagame Perspective*, que describe que multiplicar rinde más que sumar frente a Serration, no otra base. El eje de *application* se concentra casi enteramente en `adding` (**56 de 68** filas con ratio ≠ 100%, contra **2 de 90** en `multiplying` — Tenet Agendus `Heavy Attack Wave 1/2`, misma arma y misma forma), y `none` es su caso degenerado (las 16 filas `N/A` son ratio 0%). Por eso `co_base` es una pieza de esta decisión y no una familia hermana: refina la magnitud de un bucket que `co_behavior` ya eligió.
- **Puntero derivado antes que escalar medido.** La alternativa —transcribir el ratio por ataque— exige medición: 56 números de una fuente marcada `{{UpdateMe}}`, o tests in-game. Un puntero al ataque padre no lleva número, se recalcula solo cuando el arma se rebalancea, generaliza a los ataques que la wiki nunca midió (su tabla lista **sólo discrepancias conocidas**) y deja a la fuente en el rol que le corresponde: **oráculo de contraste, no poblador**. Para arcos ni siquiera es dato por-arma sino una regla mecánica única (*el cargado usa el sin cargar*).

**Consecuencia:**
- Contratos: `MutatedDNA.co_behavior` (mapa por perfil) + `SimulationEntity.co_behavior` (resuelto al perfil) + `Modifier.co_factors` (dos dimensiones nombradas) + operation `CONDITION_OVERLOAD`. `CoBehavior` **SSoT única** en `@shared/types/modifier`, consumida por el contrato del engine y por la fórmula pura sin violar la pureza de `formulas/` (que ya importa `@shared/types`).
- Cálculo: el motor **consume `coBonusPct`** (`formulas/weapon`), no lo duplica. `applyConditionOverload` (fórmula terminal escalar-cerrada) queda reservada para C2 (daño final), no la llama el grafo de buckets. Cierra la deuda de reconciliación con `formulas/` (ver [`formulas-integration.md`](formulas-integration.md)).
- Primer arma: Cedo Prime (`cedo-co-static.test.ts`) — sus 3 `shot_type` en un arma validan los 3 buckets **end-to-end**: `adding` (Normal Attack, techo N=3/stacks=2: `84.8 → 161.6`, +240%), `multiplying` (Alt-Fire Glaive → `multiplicative`, **fidelidad confirmada en juego**), `none` (Radial AoE, no aplica).
- **Diferido (base de cálculo):** el motor computa el CO sobre la base del propio ataque **siempre** — el eje `co_base` no tiene resolver, así que los ataques derivados quedan sobre- o sub-estimados (los arcos cargados, al doble). Es error conocido y acotado, no gap silencioso: la magnitud por arma está medida en `OQ-ENGINE-27`. Complemento diferido con su propio gate: **`co_ratio`** —escalar medido por ataque— para lo que un puntero no puede expresar, que son los casos sin ataque padre al que apuntar (11 incarnon de secundarias donde el CO ignora el aumento de base damage de una Evolution, con ratio condicional a la build: `100% or 81%`). Se llama `co_ratio` y no `co_rate` porque es un cociente entre dos bases, no una tasa.
- **Diferido (modo dinámico):** `activeStacks` y `N` reales requieren `EnemyState`/timeline (misma brecha del decay escalar de §8). El `maxStacks` por mod y la abstracción del contador aún **no** se diseñan — emergen con más casos (rifle/secondary/melee/incarnon: solo verificar datos, no re-map — ver `../../../data/decisions.md` D-17).
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

**Decisión:** primer primitivo para `condition` cuyo **sujeto** (§8-adyacente, el eje "quién":
self / target / ally) es el **target**, no el jugador/loadout. Un objeto
congelado de dos campos — `EnemySnapshot { max_health, current_health }` — derivado del **nodo resuelto
del participante** (`hostileVitals`, la misma lectura que usa el estado) contra un `health_pct` que el
**consumidor declara explícitamente** (C1-declarado, §8.1 escalón 2 — sin timeline, sin RNG). `deriveEnemyFlags(snapshot)`
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
- Cierra la primera instancia concreta del concepto `snapshot` (antes "no formalizado, pendiente
  de casos") y resuelve `while_enemy_below_half_health`
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
  ya no la contienen). Los coeficientes que las fórmulas per-efecto reciben son **parámetros**, y su
  dueño lo fija **§17**: el default vive con la fórmula, el desvío en el portador. `GameLaws` como tabla
  global —y su override vía `MutatorBridge.extractLaws`— **no sobrevive a esa partición**: un valor plano
  no tiene dónde poner su procedencia. El armor-strip por tiempo de Heat (Ignite) NO es Familia A (rampa
  temporal) — se queda inline como excepción documentada.
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
  pool②. El **transitorio** (buff mid-DoT) no es pregunta: el pool② es contexto que el tick evalúa al
  emitir, así que cae entero. Lo que `OQ-ENGINE-20` pregunta hoy es **dónde cae la frontera de
  congelación** (qué le pertenece a la base que el proc fija).

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

---

## 17. Ley ⊥ parámetro: `GameLaws` no es una ley, y su forma no admite la respuesta

**La definición, falsable.**

> **Ley = la forma de la mecánica.** Qué existe, qué compone con qué, en qué orden. Es la fórmula: no
> se configura, se escribe.
> **Parámetro = un número de esa forma.** Tiene un default y puede desviarse desde el emisor o desde
> el receptor.

**Test:** cambialo. ¿Sigue siendo la misma mecánica? *Corrosive con 12 stacks en vez de 10* → sí →
**parámetro**. *Corrosive que no reduce armadura* → no → **ley**. Las leyes pertenecen al **concepto**:
*"la toxina ignora escudos"* no es propiedad del enemigo, es lo que la toxina **es**. Por eso ya viven
donde deben — `formulas/status/stack-debuff.ts` lo declara textual: *"constantes de ley fija"*.

**Por qué `GameLaws` se cae — estructural, no por casos.** Es una tabla plana de valores, y **un valor
plano no tiene dónde poner su procedencia**. `corrosive_initial_strip: 0.26` no puede expresar *"0,26
por defecto · 0,50 si el receptor lleva la marca de Hydroid · +2 al cap si el emisor tiene esmeralda ·
salvo que el receptor sea un boss"*. `MutatorBridge.extractLaws` escanea entidades buscando
`law_corrosive_*` — **el escaneo era correcto; aplanar la procedencia era lo que había que no hacer.**

**Dos dueños, no tres.** El escenario **no lleva parámetros de mecánica** (§18 de
[`simulation-architecture.md`](simulation-architecture.md) — decide qué participantes existen y con
qué forma):

| Qué | Dueño |
|---|---|
| **Ley** — la forma | el **concepto**, con su fórmula |
| **Default del parámetro** | el **concepto**, junto a su fórmula |
| **Desvío del parámetro** | **quien lo declara** — emisor *o* receptor, y no son el mismo parámetro |

⚠️ **"Portador" no alcanza para nombrar al dueño del desvío**, porque en el resto del corpus portador es
quien porta el *estado* — o sea el receptor — y el desvío mejor medido que tenemos es del **emisor**: el
cap `19` de `../../../references/ingame-tests/status-stack-caps.md` sale de `3 × Tauforged Emerald` del
jugador que aplica (`+9` sobre el default 10), y ese jugador no porta el contador. Los dos orígenes están
en la cadena de abajo desde el principio; lo que faltaba era que la tabla no los colapsara.

Los ocho números de configuración de status —los seis de `GameLaws` más `WEAKENED_MAX_STACKS` /
`FREEZE_MAX_STACKS`— pertenecen al mismo lugar donde `WEAKENED_CRIT_LAW` ya vive. **`GameLaws` baja a
`formulas/`, no al revés.**

### La cadena de resolución — cuatro eslabones de entidad, y no es aritmética

```
default                              ← del concepto, con la fórmula
  → ¿el EMISOR modifica la salida?      desvío del source de la instancia
  → ¿el RECEPTOR modifica la entrada?   marca portada por el target
  → ¿el RECEPTOR fuerza?                cap — límite, no valor
```

**`modifica` ⊥ `fuerza` — dos verbos.** `modifica` cambia el **valor** (pasiva de Hydroid: `26% → 50%`);
`fuerza` pone un **límite** sin tocar la fórmula (Acolyte: `N ≤ 4`). Son parámetros distintos del mismo
efecto: un receptor puede forzar el cap sin tocar el coeficiente — de ahí que cinco fragmentos esmeralda
(`+10` al cap) no rindan nada contra un Acolyte.

**No compiten y por eso el orden es indiferente:** cada desvío conocido toca un parámetro **distinto**.
Cuando el receptor declara sobre uno, el desvío del emisor sobre **ese mismo** no llega. La regla no es
*"el receptor gana"* —si lo fuera el esmeralda no funcionaría nunca—: es **precedencia, no dominancia**.
El receptor gana **cuando habla**; si calla, rige el emisor.

**No hay circularidad.** Las dos declaraciones son independientes (el shard dice `+2` sin mirar nada; el
Acolyte dice `4` sin mirar nada) y la instancia las compara: **función de dos argumentos, no recursión**.
La cadena `receptor → cap → N → strip → armor → DR → daño` es acíclica.

**El parámetro resuelto es de la INSTANCIA, no del receptor.** Con dos emisores de cap distinto, el
enemigo tiene **un** contador pero el cap efectivo difiere por jugador. Mismo patrón que
`elegible(m, instancia)` en la resolución de `Damage Vulnerability`.

### La aplicación de un proc sobre-cap: **suma o reemplaza; nunca se rechaza**

```
count <  cap_del_que_aplica  →  count++                      (SUMA)
count ≥  cap_del_que_aplica  →  refresca el stack más viejo   (REEMPLAZA — count no cambia)
```

Es el *"sobre-cap: reemplaza al stack más viejo"* del primitivo de stack tracker
([`damage-status-model.md`](damage-status-model.md)), redactado para un emisor y **válido sin cambios
para dos**. Medido con dos jugadores de caps 19 y 10 en
`references/ingame-tests/status-stack-caps.md`: *mantener es refrescar, subir es sumar* — el cap sólo
bloquea lo segundo.

🔴 **`min(cap, count + 1)` no implementa esta regla.** Colapsa el contador hacia abajo (`count=19`,
`cap=10` → da 10; el juego da 19) y coincide con la regla real sólo mientras haya **un** emisor. Es el
`applyProc` vigente de los stack-debuff en `formulas/status/behaviors.ts` — bug latente, no activo.

⚠️ **Y arrastra el estado:** `StackState { count: number }` es escalar, y *"reemplaza el más viejo"*
opera sobre **instancias**. Es el caso real que `OQ-ENGINE-16` pedía estresar con dato.

### Tres regímenes de composición, y la línea los separa por naturaleza

| Régimen | Qué | Ejemplo |
|---|---|---|
| **componen** | cantidades del daño | `Damage Vulnerability`, buckets — `∏(1 + Σ)` |
| **se resuelven** | parámetros de la forma | caps, coeficientes — precedencia |
| **recencia** | instancias de la misma fuente | Sonar: *"gana el cast más reciente, aunque sea menor"* |

**No hay test *a priori* que prediga si un desvío reemplaza o compone** — Hydroid dice *"50% **rather
than** 26%"* (reemplaza) y `Damage Vulnerability` dice *"**multiply** the damage"* (compone), y ambos son
"el receptor modifica un número". Se lee de la fuente, no se deduce. Correlación útil: página de
mecánica propia con reglas declaradas → compone; *"X rather than Y"* / *"does not increase"* / *"can
only receive up to N"* → reemplaza o fuerza.

### Un portador puede traer una **tabla**, no sólo un desvío

Tres receptores no desvían un cap: **overridean parcialmente la tabla entera de caps**
([`damage-status-model.md`](damage-status-model.md) §*El cap no siempre es "por tipo"*). `Impact` lo
prueba — toma **tres valores para el mismo parámetro**: default `5`, Acolyte `3`, Lich `6`.

**Consecuencia para el canal de desvío:** su unidad no puede ser *"un número con su override"*. El
portador declara **sobre qué parámetros habla**, y para los que no nombra rige el default del concepto.
Es la misma precedencia de arriba aplicada a un conjunto en vez de a un escalar — *gana cuando habla*
sigue valiendo, sólo que ahora "hablar" es tener fila en su tabla.

### La fórmula **pregunta**; el portador no trae fórmula propia

Que un efecto rinda distinto según quién lo recibe **no multiplica las leyes**. Hay una sola que
ramifica:

| Caso | Qué cambia |
|---|---|
| DoT de Heat en jugador vs enemigo | los números, no la ley |
| `Radiation` en Acolyte (*"sólo amplifica el daño de unidades aliadas"*) vs en Lich (*"no cambia la facción; aumenta el daño recibido de los que se volvieron contra él"*) | la rama, no la ley |

`resolutionModifier(state, t, …)` **ya ramifica** — lo que hoy no puede es preguntarle nada útil al
portador, porque sólo recibe un objeto plano de números.

> **Y de ahí sale un prerequisito, no un desbloqueo:** si la fórmula ramifica por tipo de portador,
> **el tipo tiene que ser legible**. El canal de desvío *necesita* que la entidad tenga clase — no
> alcanza con que se la habilite después.

### El escenario **no** es un quinto eslabón de la cadena

El único candidato —*"Bosses are immune to Hydroid's passive, **except in the Simulacrum**"*— no es el
escenario resolviendo un parámetro: en Simulacrum el boss **se instancia sin su marca de boss**. El
escenario actúa **antes** de la cadena, decidiendo qué participantes existen y con qué forma (§1 del
modelo de capas), no dentro de ella. La cadena queda en cuatro eslabones.

### Este canal es el gate común de cuatro pendientes

Cuatro ítems de `open-questions.md` están parados **por la misma razón**, y ninguno lo declara: todos
esperan que el portador pueda llevar datos propios y resolverlos al ser consultado.

| Ítem | Cómo lo dice hoy |
|---|---|
| `OQ-ENGINE-12` | *"falta el flag `boss`/`overguard` en el DNA del enemigo"* |
| **Overguard como capa de entidad** | *"se retoman si un consumidor las pide"* |
| `OQ-ENGINE-22` (EHP/DR `enemy/`→`entity/`) | *"sin consumidor real hoy"* |
| `OQ-ENGINE-28` (resistencias por entidad) | *"sin consumidor"* |

**No son cuatro gates: es uno.** Y el dato ya está esperando en el contrato — `eximus_health?` se emite
hoy *"sin consumidor todavía"*.

### Estado de ejecución — la mitad de arriba está hecha; la cadena no

Esta sección era prescriptiva entera. Hoy se parte en dos, y sólo una está construida:

| Qué | Estado |
|---|---|
| **`GameLaws` baja a `formulas/`** | ✅ **EJECUTADO.** Los seis parámetros viven en `formulas/status/stack-debuff.ts` como constantes con su fórmula, y las firmas de los behaviors ya no reciben `laws`. |
| **La tabla plana se retira** | ✅ **EJECUTADO.** `GameLaws`, `BASELINE_GAME_LAWS`, `SimulationContext.laws`, `EnemyState.laws` y `MutatorBridge.extractLaws` no existen más. |
| **La cadena de cuatro eslabones** (default → emisor → receptor → cap) | ❌ **NO EXISTE.** Es `CV-3`. |

⚠️ **El sunset no removió una capacidad — removió su apariencia.** Al mover los parámetros junto a su
fórmula, el pase de `laws` quedó sin lectores: pasar un `laws` custom ya **no cambiaba nada**, en
silencio. La tabla siguió viajando cuatro saltos hasta un campo que nadie leía. Lo que se retiró fue ese
transporte, no un canal de override funcionando.

**Los tres tokens quedan RESERVADOS, no descartados.** `law_corrosive_max_stacks`,
`law_corrosive_initial_strip` y `law_corrosive_stack_strip` no los produce ningún dataset ni override
(verificado). El escaneo era la mitad correcta —§17 lo dice arriba— así que el vocabulario es el material
de entrada de `CV-3`, y su revisión token por token está pendiente ahí: cada uno tiene que declarar **de
quién** es el desvío antes de volver, y al menos uno (`max_stacks`) ya sabe la respuesta — es del
**emisor** (el cap 19 por `3 × Tauforged Emerald`), que es justamente lo que la tabla plana no podía decir.

**Enlaza con** §14 (LEY/ESTADO/RESOLUCIÓN), §16 (pools), §18 (el ruteo decide **a quién** llega el
desvío), §20 (la entidad se lee como `f(estado en t)` — este canal es lo que hace legible su clase).
Cita: `references/ingame-tests/status-stack-caps.md`,
`references/wiki/mechanics/{damage-corrosive-damage,acolytes,bosses,overguard}.wikitext`,
`references/wiki/archon-shards/emerald-archon-shard.wikitext`.

---

## 18. El ruteo: una regla, no tres — el token declara el nodo, el alcance declara a quién

**El estado que reemplaza:** tres reglas para una sola pregunta, ninguna declarada como principal —
**contención** (el efecto se queda en quien porta el mod, default silencioso, `ModRepository`),
**taxonomía** (el token declara la familia destino, `channel-routing.ts`) y **excepción**
(`portador === arma && token.startsWith('AVATAR_')`, `StaticHydrator`). El drift es medible: Corrosive
Projection —portador warframe, token `ENEMY_*`— no matchea ninguna excepción y cae a contención, o sea
**muere en quien lo porta**; el motor lo grita (`Token conocido sin nodo: ENEMY_ADD_ARMOUR`), que es lo
correcto pero no lo arregla. **Ese caso ya está cerrado** por §*La familia del token resuelve el cruce de
bando* (abajo), y el examen que lo fija es `enemy.test.ts` — *−18% de armadura al enemigo: 2700 → 2214*.
El resto de la partición sigue en pie.

**Tres ejes, no dos.** Un solo modifier involucra tres entidades que pueden diferir, y confundirlas es
de donde nacen las excepciones:

| Eje | Pregunta | Ejemplo donde difiere |
|---|---|---|
| **Portador** | ¿dónde está montado? | Amalgam Serration, en el rifle |
| **Sujeto leído** | ¿de quién se lee el estado que evalúa su condición? | un mod de arma cuya condición lee la armadura del warframe |
| **Alcance** | ¿a quién le aterriza el efecto? | al warframe |

El eje del medio **no lo ve un barrido de tokens** — un token declara el atributo, no la condición. Su
descomposición (**QUIÉN** self/target/ally ⊥ **QUÉ** status-type/stat/count) vive en
[`../../../semantic/condition-nature.md`](../../../semantic/condition-nature.md) §Eje 2.

### La regla

> **El token declara qué nodo toca. El alcance declara a quién.**
> Si el portador no materializa el token, se rutea **dentro del alcance**; si dentro del alcance no hay
> destino, **se descarta y se reporta** — nunca se va al vecino.

**Su forma precisa, y cómo se rompe:**

> **El `{dónde}` del token se resuelve relativo al portador, subiendo por el árbol de propiedad hasta la
> primera entidad de esa clase.**
> **Restricción:** el destino se decide por el token **relativo al portador**, nunca por *ausencia de
> nodo*. Donde el destino llega y el nodo no existe, no pasa nada **y se reporta**.
> Se rompe con: un token que necesite un `if` en el engine para llegar a donde va.

**El árbol es `Jugador → {warframe · compañeros · armas} → instancias`.** El warframe **no** es padre
del compañero — cuelgan del mismo nodo, y por eso la ambigüedad *"warframe o compañero"* desaparece sin
necesidad de un eje de rol. La propiedad **se deriva del poblador**, que ya la conoce y hoy la descarta.

**El alcance tiene tres niveles**, y se deriva del **bando** (una marca), no de qué nodos porta la
entidad:

| Alcance | Qué alcanza | Casos |
|---|---|---|
| **propio** | el conjunto del dueño | Amalgam Serration → mi warframe · Bite → mis garras |
| **aliado** | el squad y todo lo que lo compone | Roar, Warcry, las auras (*"Squad receives…"*) |
| **hostil** | el otro bando | Corrosive Projection |

El nivel *aliado* lo fuerzan las auras y Warcry: alcanzan *"otros Warframes, compañeros, rehenes,
objetivos de Defense, Shadows y Specters"*. Un objetivo de Defense recibe Warcry y **no es el avatar de
nadie** — así que el alcance no puede derivarse de la clase de nodos de la entidad.

⚠️ Las `routes` vigentes (`avatar`, `weapon`, `melee`, `enemy`) **son taxonomía disfrazada**: describen
qué nodos porta la entidad, no de qué lado está. Funcionan por la misma razón que funcionaba
`!isWarframe` — con la población actual, coinciden.

**Verificación — los tres corpus, sin truncar:** mods 887 pares / 45 desalineados · arcanos 100 / 21 +
13 de operador-amp · fragmentos de arconte 27 / 6 + 7 sin token. **Ningún caso refuta la regla**; uno la
acota, por dos caminos independientes. La regla resuelve ~37 (`warframe → WEAPON_`, `warframe →
ENEMY_`); la **propiedad** resuelve ~19 (`arma → AVATAR_`, `melee → AVATAR_` — sin ella serían ambiguos
entre warframe y compañero, que llevan la misma marca).

**La cláusula de descarte es regla, no parche.** La fuerzan **dos familias independientes** con el mismo
defecto —*el portador pertenece a un conjunto cuya entidad-destino no existe en el motor*—: garras de
Kavat/Kubrow (7 mods, 12 tokens) y amp/arcanos de operador (13). Que aparezca dos veces por separado es
lo que la vuelve regla.

⚠️ **Precisión: la cláusula es preventiva, no correctiva.** Hoy esos mods **no llegan al rifle** — la
excepción de `StaticHydrator` exige `holder.domain === 'weapon'`, el compañero no lo es, así que
Bite/Maul/Frost Jaw mueren montados en el gato (lo reporta el tripwire). Irían al rifle **si se aplicara
ruteo por familia sin la cláusula**.

**Lo que queda fuera de la regla: los set mods no tienen emisor individual.** 58 mods en 19 sets, con las
piezas repartidas en dos o tres entidades y magnitud dependiente del loadout completo. No es ruteo mal
resuelto — **es un emisor que no existe**. `OQ-DATA-6`.

### El drift a reconciliar — no es diseño abierto

El contrato ya está escrito en
[`../../../semantic/upgrade-tokens.md`](../../../semantic/upgrade-tokens.md) §Frontera negativa, y el
código lo cumple **a medias**. **El criterio de aceptación es externo:**

| `upgrade-tokens.md` declara | El código hace | Estado |
|---|---|---|
| el token declara tres cosas y sólo tres | el **cruce de bando** lo declara la familia del token, sin `if` ni campo nuevo | ✅ |
| `AVATAR_*` = el avatar del portador (**relativo**) | `FAMILY_ROUTE: { AVATAR: 'avatar' }` — clase **absoluta** | ⚠️ abierto |
| *"un `if` … convierte un error detectable en uno invisible"* | `if (holder?.domain === 'weapon' && token.startsWith('AVATAR_'))` | ⚠️ abierto |
| **el portador que no materializa el token rutea dentro del alcance** (`warframe → WEAPON_*`) | **rutea**: si el portador no porta la marca de la familia del token, el modifier baja por familia, acotado a las entidades del mismo `owner` | ✅ |
| *"si dentro del alcance no hay destino, se descarta **y se reporta**"* | los cuatro caminos reportan con un mensaje común que nombra el alcance que faltó | ✅ |

**Cómo baja, en una línea:** *si el portador no porta la marca que exige la familia del token, el
modifier baja por familia, acotado a las entidades del mismo dueño.* La pregunta es por la **marca**,
no por si el nodo existe — un warframe porta `avatar`, así que `Vitality` cae a contención y no se va
al compañero, que porta la misma marca.

**El forcing-case, y por qué se parte en TRES.** Medido sobre los datasets: **15 fuentes vivas
montadas en el warframe emiten token de arma** — 8 arcanos y 7 mods, tres de ellos auras. Son un
subconjunto de los ~37 que el censo de arriba contaba como *resueltos por la regla*. El destino real
lo declara el `label` de cada fuente, y por eso el reparto no se deriva del token:

| Destino real | Fuentes | Cómo se resuelve | Estado |
|---|---|---|---|
| **una clase que ES un slot** | Arcane Fury · Ready Steel · Steel Charge · Reflex Guard (melee) · Arcane Pistoleer · Pistol Amp (secundaria) | **el dato**: el token declara la sub-familia y el ruteo por canal que ya existía los aterriza | ✅ D-6 aplicado, sin tocar el motor |
| **todas las armas** | Arcane Avenger · Crepuscular · Hot Shot · Theorem Demulcent · Provoked | **la regla**: baja por familia, acotada por `owner` | ✅ |
| **una clase que NO es un slot** | Rifle Amp (rifle) · Dead Eye (sniper) · Arcane Arachne y Vigorous Swap (primaria **+** secundaria) | **el schema**: el eje es la clase de compatibilidad, y hoy no existe sano | ⏸️ `upgrade_type: null` — gap declarado, `OQ-DATA-16` |

⚠️ **Por qué el tercer grupo se declara nulo en vez de aproximarse.** `Rifle` no es `primary`: una
escopeta es primaria y no recibe `Rifle Amp` — `Shotgun Amp` existe aparte en el dataset, y los
cuatro `Scavenger` (Rifle/Shotgun/Sniper/Pistol) repiten el mismo eje. Con la regla activa, un token
liso los baja a **las tres armas**: pasan de morir gritando a componer mal en silencio, que es
estrictamente peor — *"medir de más es peor que no medir"*. El campo que los expresaría,
`compat_name`, trae **236 valores** mezclando clase (`Rifle`, `Assault Rifle`, `Bow`), entidad
(`WARFRAME`, `AURA`) y warframe individual; del lado del arma, `kind`/`category`/`type`/`family` se
solapan (`category` ≈ `kind` + `Misc`; `family` mezcla clase con linaje). **El diferimiento es del
schema, no del vocabulario.**

⚠️ **El eje de propiedad es lo que hace que la regla no sea un fan-out bruto.** El arma de compañero
porta `routes: ['weapon']` (warrant: Roar la alcanza), así que sin él `Provoked` —alcance **propio**—
aterriza en el arma del sentinel. `EntityIntent.owner` lo declara: ausente = cuelga del Jugador, que
es la raíz y no se materializa. Lo sabía el poblador y lo descartaba — `companionIntents` construye
el arma **adentro** del compañero.

⚠️ **Y la guarda por portador es lo que preserva la cláusula de descarte.** Los 7 mods de garras
emiten `WEAPON_*` montados en el compañero; con ruteo por familia sin esa guarda irían al rifle del
jugador. Se cumple por omisión: la baja exige `holder.domain === 'warframe'`, así que caen a
contención y el tripwire los reporta montados donde están.

⚠️ **Un token mal acuñado se ve igual que un hueco de ruteo.** `Arcane Strike` emitía
`WEAPON_ADD_FIRE_RATE` para un efecto que la fuente llama *"Attack Speed to Melee Weapons"*: el nodo
correcto es `MELEE_ADD_ATTACK_SPEED`, que la melee sí materializa. Sólo el `label` de la fuente
distingue los dos diagnósticos.

⚠️ Por qué el hueco es difícil de ver: **las habilidades sí bajan**, y no por el ruteo —
`AbilityRepository` resuelve el destino él mismo (`resolveFamilyEntities`) y emite el modifier ya
apuntando al arma. Mod y arcano estampan al portador y delegan al canal. Roar baja porque su
repositorio lo baja. Examen escrito: `unlanded-modifiers.test.ts` §*Ruteo warframe → arma*.

**Lo que cerró y lo que queda son dos tramos distintos, no medio problema cada uno** (ver abajo): el
cruce entre bandos ya se resuelve por regla; elegir **dentro** del bando sigue con la excepción por
dominio. Y hoy el compañero **es** una entidad del espacio, así que el caso que esa excepción evitaba
puede darse — sale bien por la guarda (`domain === 'companion'` no matchea `'weapon'`, cae a contención
y se queda donde debe), no por decisión. Su eje es `OQ-ENGINE-31`.

### La familia del token resuelve **el cruce de bando, y sólo eso**

La regla de arriba se ejecuta en dos tramos con dueños distintos, y confundirlos es lo que hace parecer
que hace falta una tabla `alcance × bando`:

| Tramo | Pregunta | Quién la contesta |
|---|---|---|
| **cruzar el bando** | ¿el efecto sale del squad hacia el otro lado? | **la familia del token** — `ENEMY_*` cruza, ninguna otra |
| **elegir dentro del bando** | ¿el warframe o el compañero? ¿cuál de las tres armas? | **el portador**, por el árbol de propiedad |

**Por qué la familia alcanza para el primero, y no es un atajo.** El vocabulario ya hizo ese trabajo: el
raw de DE tokeniza como `AVATAR_ARMOUR` lo que nosotros acuñamos `ENEMY_ADD_ARMOUR`, porque para el juego
el enemigo también es un avatar. **Acuñar `ENEMY_*` fue declarar el bando destino**, y volver a
declararlo en un campo del modifier sería guardar el mismo dato dos veces. Se sostiene además porque en
este modelo **emite un solo bando** — ningún participante hostil porta fuentes propias, así que el bando
del emisor es constante y no hay nada que cruzar contra él. Ese piso no sale de que el hostil declare
menos que el Squad (declara tanto, con otra forma) sino de que **no modelamos el daño hacia el jugador**:
[`simulation-architecture.md`](simulation-architecture.md) §*Los dos pobladores no son espejos* lleva el
alcance y su fecha de caducidad.

⚠️ **Y no alcanza para el segundo, deliberadamente.** Rutear por familia *siempre* rompería la
contención: `Vitality` (mod de warframe, `AVATAR_ADD_HEALTH_MAX`) aterrizaría también en el compañero,
que porta la misma marca `avatar`. Adentro del bando sigue mandando el portador, y el `if` de
`StaticHydrator` sobrevive **a propósito** hasta que ese caso tenga forcing-case propio — el eje es
`OQ-ENGINE-31`, que ya lo plantea mejor: *"el eje es la propagación de efectos, no el origen de la
entidad"*.

**Enlaza con** §19 (el ruteo lleva el token; el nodo lo compone — el mismo test los exige a los dos),
§17 (el ruteo decide a quién llega un desvío).

---

## 19. La frontera nodo ↔ ley: el nodo lleva el frame-0, la ley lleva el tiempo

**El riesgo que cierra:** el **doble camino** — que un armor strip entre por el nodo *y* por la ley de
stacks sin que nadie sepa cuál manda.

**La cadena vigente, verificada en código:**

```
enemies.json → EnemyRepository.load()  → EnemyDNA (armor crudo)      ← cargar y buscar, nada más
                    ↓ ItemRepository.normalizeEnemy(raw, level)      ← f(nivel), curva-S, EN EL MOLDE
             perfil base { ENEMY_ADD_ARMOUR: 2700, … }
                    ↓ C1 compone (mods, auras, cruce de bando §18)
             nodo ENEMY_ADD_ARMOUR.final = 2214                      ← el frame-0
                    ↓ new EnemyState(entidad, laws)
             getEffectiveArmor(t) = base_armor × Π armorMult(t)      ← f(t), multiplicativo
```

Dos hechos que fija el código: `getEffectiveArmor(currentTime)` **es f(t) por construcción** y
multiplicativo entre efectos (Corrosive, rampa de Heat); y la curva-S **es una transformación
pre-grafo**, igual que el `rank` de un warframe — se ejecuta en el molde, no en el grafo.

**Los tres tramos:**

| # | Tramo | Ejemplo | Dueño | ¿Existe? |
|---|---|---|---|---|
| 1 | Dato al nivel declarado | curva-S de `scaleArmor` | molde de normalización (pre-grafo) | sí |
| 2 | Composición estática declarada | Corrosive Projection −18%, Abating Link | **nodo C1** `ENEMY_ADD_ARMOUR` | sí |
| 3 | Evolución temporal emergente | N stacks de Corrosive, rampa de Heat | **ley C2** `getEffectiveArmor(t)` | sí |

> **El nodo lleva el frame-0. La ley lleva el tiempo.**
> El piso de `getEffectiveArmor(t)` es el `final` del nodo, no un objeto paralelo; se congela en el
> constructor y no se relee. La ley no conoce la composición y la composición no conoce el reloj.

Es *"C1 compone, C2 realiza"* aplicado al target — la mitad que faltaba mientras el enemigo no era
entidad de C1, y que hoy existe porque lo es.

**El test de la frontera — se aplica por VALOR, no por fuente.** Ante un valor nuevo: **¿depende de
`t`?** No → nodo. Sí → ley. Lo que la frontera prohíbe es que **un mismo valor** se resuelva por los dos
caminos — ése es el doble camino, y ahí sigue sin haber tercer caso.

**Lo que NO prohíbe: que una fuente aporte a los dos tramos.** Es lo normal, no la excepción, y la tabla
de arriba ya lo parte así. Abating Link declara un `−60%` (tramo 2, nodo) y está vigente mientras el
link dure (tramo 3, ley): son dos preguntas distintas sobre el mismo efecto — *cuánto vale* y *cuándo
cuenta*—, y cada una vive en su tramo una sola vez.

**El caso que lo fuerza a decirse: `Damage Vulnerability`** (§21). Su vigencia depende de `t` —es el
único de los cinco slots receptores que varía en el tiempo—, y su magnitud compone como bucket:
`(1 + Σ bucket_add) × ∏(1 + magnitud)`, con los 8 miembros aditivos enumerados por la fuente y el resto
multiplicativo (medido: Paralysis × MP = `×1.5 × 2.0` → 1001 contra 1002 predicho). Leerlo como
contradicción —*"tiene duración luego es ley, pero compone como buckets luego es nodo"*— es aplicar el
test a la fuente en vez de al valor. **La composición no es un tramo: es ortogonal a los tres.** Una ley
también compone; `getEffectiveArmor(t)` lo hace con `Π`, `Damage Vulnerability` con `(1+Σ) × ∏`.

**Lo que desbloquea:** hoy no hay respuesta para *"¿cómo compone Abating Link (−60%, declarado) con 8
stacks de Corrosive (emergente)?"*. Con la frontera, el nodo resuelve el `final` con el strip adentro y
la ley aplica sus multiplicadores sobre ese `final` — cada uno en su tramo, una sola vez. Vale igual
para `ENEMY_ADD_HEALTH_MAX` y `ENEMY_ADD_SHIELD_MAX` (Magnetic sobre escudos).

**Examen ejecutable — ✅ EN VERDE:** `__tests__/enemy.test.ts` — *−18% de armadura al enemigo: 2700 → 2214*.
Exige **tres** cosas y ninguna lo pasa sola: que el nivel componga el frame-0 (`2700`, no el `500` del
catálogo), que §18 lleve el token al enemigo (el cruce de bando por familia) y que el nodo lo componga
(el tramo 2 de esta tabla). Pasa **sin excepciones hardcodeadas** — el `if` que sobrevive resuelve el
destino *dentro* del bando y no participa de este caso.

**Y el nivel es el caso que fija de qué lado cae qué.** Un enemigo de nivel 215 tiene el mismo EHP en
`t=0` y en `t=100`: no sube con el reloj, así que **el nivel es frame-0 y no ley**, por más que su
maquinaria haya vivido en C2. La curva se ejecuta al nacer, en el molde (`ItemRepository.normalizeEnemy`),
y el nodo arranca ya escalado. Lo que la ley lleva es lo que cambia *durante*: procs, decay, strip temporal.
⚠️ **Esto NO significa que el escalado deje de ser una fórmula pura** — `scaleHealth`/`scaleArmor`
siguen en `formulas/enemy/`; lo que se movió es **quién las orquesta y cuándo**.

**La frontera está construida para el armor.** Lo que queda es extenderla a `ENEMY_ADD_HEALTH_MAX` y
`ENEMY_ADD_SHIELD_MAX`, que no tienen fuente declarada todavía: el corpus da **un solo** mod con token
`ENEMY_*` en todo el override (Corrosive Projection), así que el segundo caso llega con el modelado de
habilidades, no con más mods.

**Enlaza con** §18 (la otra mitad del mismo examen), §14 (LEY/ESTADO/RESOLUCIÓN), §16 (pools).

---

## 20. Cómo se lee una entidad: `f(estado en t)`, sin lectura privilegiada

> **Todo lo que una entidad tiene se lee igual: como función de su estado en `t`.** La entidad guarda
> **marcas** (dato puro) y **capas** (números). **Nada derivado.** Marca, armadura, vida y overguard
> son la misma clase de cosa al componer.

Hoy no es así: cada parte del proyecto lee la entidad a su manera, y el enemigo tiene maquinaria
temporal que el jugador no tiene (§2 de la Capa A no distingue bandos; el código sí).

### La prueba de que es muestreo y no eventos

`references/wiki/mechanics/damage-heat-damage.wikitext:73` —

> *"the effect will also trigger **as soon as an enemy's Overguard breaks**, even if new Heat procs are
> not being actively applied"*

La marca entró entera (cuenta CO, corre el DoT); una parte de su efecto queda suprimida mientras
Overguard vive; al caer Overguard, se expresa **sin instancia nueva**. **No hay evento que detectar —
hay muestreo**, igual que `armadura@t`. El precedente ya está construido: el armor strip de
Ignite/Corrosion se evalúa así.

### No hay circularidad

`marca` (dato) y `portador` (capas) **no se consultan entre sí**; sólo la **expresión** los consulta a
los dos. El ciclo aparece únicamente si la expresión **se materializa** — porque entonces hay que
invalidarla, y la invalidación es lo que cierra el lazo. Mientras la expresión sea una lectura, la
dependencia es un árbol.

### Los tres verbos del portador

Cierran como **forma**, no como vocabulario — son los tres modos en que un portador desvía lo que
recibe, y los tres son del **lado receptor** de §17:

| Verbo | Ejemplo | Forma | Momento |
|---|---|---|---|
| **ignora** | Overguard vs los efectos CC | conjunto ∩ conjunto | continuo |
| **topea** | Overguard: *"maximum of 4 Cold procs"* | cap sobre cantidad | continuo |
| **escala** | `Damage Vulnerability` | multiplicador con filtros | continuo |

El régimen **difiere por portador**, y eso es fidelidad, no caso especial: en jugadores Overguard
*"will negate **all** Status Effects, including Stagger and Knockdown"* (la marca entera); en enemigos
filtra sólo el CC (la marca entra, una parte de su efecto no).

**No hay un cuarto verbo, y el candidato obvio se descompone.** `Radiation` en un Kuva Lich *"no cambia
la facción; aumenta el daño recibido de los que se volvieron contra él"* — parece que el portador
**sustituyera** el efecto por otro. No lo hace: es `ignora` (la primitiva *cambio de facción* no se
expresa) más `modifica` (la primitiva de daño lee otro sujeto), **encadenados**. Es la misma forma que
Overguard apagando el panic de Heat sin tocar su DoT.

> **Por qué no hace falta más:** la resolución **no es una tabla estática que el portador reescriba** —
> es una **cadena de preguntas que la instancia evalúa** (§17). La tabla es el *default*; el receptor
> declara sobre ella, y quien compara es la instancia. Un verbo `sustituye` sólo haría falta si el
> portador trajera fórmula propia, y §17 ya cerró que **la fórmula pregunta, el portador no la trae**.

Esto es lo mismo que midió el caso de los 19 stacks de Corrosive: el receptor **declara** (`cap 10`), no
**reescribe** — el contador siguió en 19 y lo que cambió fue qué podía hacer cada emisor con él.

### ⛔ `is_cc` no se acuña — y el motivo es el criterio de la campaña

El concepto queda —hay un cruce, el portador lo condiciona, se muestrea con el resto del estado— pero
**el término no se materializa**: ni como marca, ni como nombre propio, ni como tag.

**Por qué:** el corpus todavía **no lee entidades de forma sincronizada**, y acuñar el término antes de
que exista esa sincronización produce **`GameLaws` 2.0** — un nombre con autoridad prestada, sin la
estructura que lo sostenga. §17 documenta cómo termina eso. El término se gana el lugar cuando haya una
sola lectura de entidad, no antes.

### La neutralidad es de la **marca**, no de la entidad

La marca es neutral, y eso la fuente ya lo declara: `status-effect.wikitext` §*Independent from Damage*
dice **"Universal:"** en 11 de 14 filas (*"**Players and enemies** get staggered"*). No hay que inventar
esa parte: hay que leerla.

⚠️ **Lo que NO se sigue de ahí es que la entidad se defina por sus capas.** Una sola página del corpus
lo refuta — `references/wiki/mechanics/overguard.md`:

| Qué manda | Evidencia |
|---|---|
| **la clase** | *"Only **Warframes, Companions, Specters, and Eidolon Lures** are able to receive Overguard. Consequently, it **cannot** be given to **Defense Objects**"* |
| **no el bando** | Defense Object y Warframe **están del mismo lado y no comparten la regla** |
| **ni la capa sola** | *"On **players**… negate **all** Status Effects"* ↔ *"On **enemies**… ignore the **crowd control** effects"* — **misma capa, dos reglas** |

**Una entidad con las capas vacías no es "neutra": es una entidad de la que todavía no sabemos la
clase.** El principio `f(estado en t)` se sostiene, pero su argumento no es sólo el estado — la lectura
de una marca depende de **qué clase la porta**, y esa clase es dato de la entidad, no de sus capas.

> **Consecuencia:** este principio **exige que la clase sea legible**, igual que §17 lo exige para el
> canal de desvío. Son dos vías independientes pidiendo lo mismo.

### El límite del principio: **neutral en composición ≠ neutral en fórmula**

*"Todo se lee igual"* vale para **cómo se compone**, no para **con qué ley se resuelve**. Una entidad
puede componer sus nodos por el mismo molde y resolverlos por leyes distintas — y el caso está en el
código, escrito por triplicado:

| Entidad | Ley de DR | Dónde |
|---|---|---|
| **jugador** | `DR = Armor / (Armor + 300)` | `formulas/enemy/ehp.ts` — *la primitiva del jugador viviendo bajo `enemy/`* |
| **enemigo** | `DR = √(3·Armor) / 100` | `formulas/enemy/armor-mitigation.ts` |

**Misma composición** (armor sale del grafo igual para los dos), **distinta resolución**. Confundirlo es
el riesgo de la neutralidad ingenua: generalizar el contenedor y arrastrar la ley del caso que se
ejercitó primero.

> **La forma correcta:** EHP como **primitiva de entidad** que compone igual y **despacha a la ley de
> quien la pide**. Las dos leyes ya están escritas; **falta el despacho.**

Y el propio código lo pide desde los dos lados, en docstrings independientes:
`armor-mitigation.ts` — *"DR **NO es enemy-specific**: es una primitiva del ciclo de la entidad"*;
`ehp.ts` — *"**NO usar esto para EHP de enemigo**"*. Esa segunda advertencia existe porque el lente
`enemy` del oráculo iba a conectarse ahí y **habría revertido en silencio a la fórmula equivocada**.

⚠️ **Deuda que arrastra, y es de ubicación, no de cálculo:** `ehp.ts` está **roto declarativamente** —
es la primitiva del jugador bajo `enemy/`, sin consumidor. `OQ-ENGINE-22` es su eje.

### Un booleano no alcanza — hay dos gatings observablemente distintos

| Gating | Caso | Qué pasa si esperás |
|---|---|---|
| **supresión** | Overguard vs el panic de Heat — la marca corre, la expresión no | **se agota** |
| **congelamiento** | Equinox *Rest*: *"unable to recover… until they wake"* — la marca no corre | **no pasa nada** |

Un flag `suprimido: bool` colapsa los dos, aunque se lo ponga en tres capas distintas.

### C1 no se fractura

C1 **no tiene `t`, tiene escenario**: responde el régimen **estacionario**; C2 responde la
**transición**. Es la diferencia normal C1/C2, no una fractura nueva que este principio introduzca.

### Lo que el motor no puede hacer hoy — medido

- **`StatusEffect` (15 entradas) cubre sólo los procs con origen de daño.** Lifted, Knockdown, Microwave
  y Slow **no existen en el código**, y los tres primeros **cuentan para Condition Overload**, que sí
  está implementado. **El motor cuenta status y no puede contar tres de los que el juego cuenta.**
- **`effectOfDamageType(type) → StatusEffect | null` es la única puerta.** Un proc sin tipo de daño no
  tiene por dónde entrar. (Ver `../../../semantic/damage-types.md` §*La Arista 1 es 1:1 en una sola
  dirección*.)
- **`SimulationEngine` cuenta sin padrón:** `context.variables[status_count_var] ?? 0`. El juego lee una
  **lista cerrada y enumerada de 18** (`condition-overload.wikitext` §*What Counts As A Status
  Effect?*); nosotros contamos lo que haya.
- **`ResolutionModifier` sólo expresa `armorMult` y `layerMult`** — no el filtro por tipo de daño ni por
  vía de entrega, que `Damage Vulnerability` sí necesita (§16, y la medición en
  `references/ingame-tests/damage-buckets.md`).

### Tercera llegada independiente a la misma forma

> **La marca es neutral y sólo dice qué. El par (marca, portador) dice qué hace. El lado
> (propio/hostil) dice cómo compone.**

§18 llegó a *"token neutral, destino relativo al portador"* desde el ruteo; el barrido de qué porta una
entidad llegó a *"marca neutral, significado según quién la porta"*; este principio, a *"marca neutral,
expresión función del portador"*. **Tres caminos separados, una estructura** — la señal más fuerte que
produjo la campaña.

**Enlaza con** §17 (el lado receptor: `ignora`/`topea`/`escala` son sus desvíos), §18 (misma forma desde
el ruteo), §13 (`EnemySnapshot`, el pull-read sobre el estado del target).

---

## 21. El lado receptor: cinco slots, y `Damage Vulnerability` es el único que varía en `t`

Hoy `resolveDamageEvent` resuelve `damage × stateMultiplier × typeMultiplier × (1 − dr)`. El lado
receptor completo —que nunca había estado escrito junto— tiene **cinco** slots:

| Slot | Qué es | De dónde sale | ¿Varía en `t`? | Estado en código |
|---|---|---|---|---|
| matriz facción × elemento | ×1.5 / ×0.5 uniforme | `FACTION_BONUS` (15 facciones) | no | ✅ `targetFactionMult` |
| **resistencia por unidad** | Hyekka Master 80% a Heat | **la fila de esa unidad** | no | ❌ ni dato ni código |
| **`Damage Vulnerability`** | Molecular Prime, Reap, Petrify… | **aplicada por un emisor** | **sí** | ⚠️ parcial |
| multiplicador de parte | ×3 cabeza `+ ExtraHeadshotDmg` | `weakpoints[]` (407) + el arma | no | ❌ dato sí, consumidor no |
| DR de armadura | `1 − √(3·AR)/100` | `armor` − strips | sí | ✅ `damageReductionFromArmor` |

**Son cinco filas distintas, no capas de lo mismo**, y el discriminador es §20: la resistencia por
unidad responde *"¿está en la fila del dato de la unidad?"* → **clase/identidad**; `Damage
Vulnerability` responde *"¿es condición temporal?"* → **estado**. Fusionarlas colapsaría esa partición.

> **Y no choca con §19.** `Damage Vulnerability` varía en `t` (→ ley) **y** compone como bucket
> (`(1+Σ) × ∏`), que parece meterlo en los dos tramos. No lo hace: el test de §19 se aplica **por
> valor**, y acá hay dos valores distintos —*cuánto vale* la marca y *cuándo está vigente*—, cada uno
> en su tramo una sola vez. La composición es ortogonal a la frontera: una ley también compone.

La fuente lo dice con la frase exacta —`references/wiki/mechanics/damage-vulnerability.md`—:
*"Damage Vulnerability is **not same as** positive Damage Type Modifiers which is an **innate
property** to enemy health"*. `innate` es el discriminador, textual.

### El engine ya implementa `Damage Vulnerability` — dos veces, sin nombrarla

`EnemyState.getDamageMultiplier` es *"el producto de los `layerMult` de los efectos activos
(Viral/Magnetic)"*, y la fuente clasifica **exactamente esas dos** como fuentes de DV. **Es el mismo
mecanismo, ya construido y ya poblado.**

Lo que falta no es el mecanismo: es **su canal de entrada**. Hoy la única puerta es **ser un
`StatusEffect`** (itera `activeBehaviors()`), y Molecular Prime no es un proc, Reap no es un proc,
Petrify no es un proc. **Ninguna de las ~30 fuentes restantes puede entrar.**

```
hoy:      getDamageMultiplier → activeBehaviors()             → sólo procs
después:  getDamageMultiplier → portadores de DV en el target → procs ∪ debuffs ∪ mods ∪ arcanos
```

**Y `layerMult` no se deriva a primitiva: se reclasifica.** No es un mecanismo — es la implementación
de **un filtro (por capa) de un slot (DV)**. Al generalizar deja de ser campo de `EffectBehavior` y pasa
a ser un caso del predicado de elegibilidad. Cierra sin pérdida: Viral y Magnetic siguen siendo
miembros, con su filtro expresado en el vocabulario general en vez de en un campo dedicado.

### Elegibilidad ⊥ composición

`bucket_id` no estaba mal — estaba **incompleto**. Son dos preguntas, y ninguna implica la otra:

| Pregunta | Quién responde | Naturaleza |
|---|---|---|
| ¿**participa** este DV en esta instancia? | el **filtro** | predicado booleano, **previo** |
| ¿**cómo** compone con los que sí participan? | `bucket_id` | aritmética, **posterior** |

**Demostrado en las dos direcciones por las fuentes primarias.** El bucket aditivo (8/8 verificados)
mezcla **5 sin filtro** (Atomi-Barrage · Containment Wall · Petrify · Jade's Judgments · Prey of Dynar)
con **3 filtradas por tipo** (Magus Accelerant · Magus Destruct · Theorem Contagion). Y del lado
multiplicativo, **Paralysis** (melee) convive con **Molecular Prime** (sin filtro) y **Lull**
(Finisher). **El filtro no reparte buckets.**

```
DV(instancia, target, t) =  (1 + Σ   magnitud)  ×  ∏  (1 + magnitud)
                              m ∈ bucket_add       m ∉ bucket_add
                              elegible(m, inst)    elegible(m, inst)
```

Otra vez `∏(1 + Σ)` — la forma canónica de cualquier stat (§16). **Ambas etapas son producto/suma, así
que conmutan: no hay orden de composición que decidir.** Lo único que no conmuta es `elegible()`, que
no es una operación aritmética.

**El filtro es un predicado, no un peso** — medido: un rifle contra un enemigo con `Melee Damage
Vulnerability` activa da **el mismo número exacto** (25 → 25). No aporta poco: **no entra al producto**.

**Cuarto filtro, que las fuentes destaparon solas: el estado del target.** Petrify — *"tied to being
petrified; enemies that cannot be petrified will not have it applied"*; Bonewidow *Firing Line* —
*"receive 1.5x Damage Vulnerability from all sources **while Lifted**"*. Es el cruce que §20 cerró como
concepto y decidió **no** acuñar (`is_cc`); que aparezca sin ir a buscarlo valida esa decisión.

### 🔴 El hueco que bloquea: la Instancia no declara de qué clase de ataque viene

`elegible(m, instancia)` necesita tres datos. **Dos existen:**

| Dato | Estado |
|---|---|
| tipo de daño | ✅ `damageToken`; `Resolucion.as` ya lo declara explícito |
| capa golpeada | ✅ `Layer` — la pila de cuatro (`contracts/layers.ts`), y la resolución devuelve cuál recibió |
| **clase de ataque** (melee · finisher · weapon · ability) | ❌ **no existe** |

**Sin el tercero, Paralysis y Lull son inmodelables** — no por su magnitud, sino porque nadie puede
preguntar si aplican. `Resolucion` declara `as` (*con qué tipo resuelve*) y le falta el hermano: **de
qué viene**. La Instancia nace target-agnóstica y llega al target sin procedencia de arsenal.

La capa **dejó de ser binaria**: `contracts/layers.ts` declara la pila de cuatro y, sobre todo, mueve la
tabla de quién la atraviesa **del daño a la capa** — sin eso, *"Toxin salta el shield pero no el
Overguard"* es inexpresable. Lo que sigue sin existir es el **origen** de dos de las cuatro, y la ley
de Magnetic contra Overguard (*"el único status con stacking propio contra Overguard"*).

### Lo que la medición ya validó de la arquitectura vigente

`resolveDamageEvent` aplica `stateMultiplier` **una vez**, y el tick de DoT resuelve por ahí →
**single-dip por construcción**, correcto antes de que lo midiéramos (`×2.000` medido).

> 🔴 **Restricción dura:** `Damage Vulnerability` **no puede** entrar a `GAMEPLAY_MULT_FACTION_DAMAGE`
> (§16). Es la tentación obvia —Reap y Roar tienen la misma forma `+X% daño`— y daría **`×4` donde el
> juego da `×2`: 100% de error en el tick.** Era inferencia desde el hit; ahora es **dato medido en el
> tick mismo** (`references/ingame-tests/damage-buckets.md`, Test 7).

**Enlaza con** §20 (clase ⊥ estado, el discriminador de la tabla), §16 (pools y el bucket del emisor),
§14 (LEY/ESTADO/RESOLUCIÓN), `../../../semantic/damage-types.md` (los procs que sí son fuente de DV).

---

## 22. Qué es una entidad: `capa` ⊥ `estado` ⊥ `clase`

§20 dice que todo se lee como `f(estado en t)`, y §17 que el portador resuelve sus parámetros. **Los dos
necesitan saber qué clase de entidad es** — y hasta acá "clase" se venía usando sin definir. Esta sección
la define, y separa tres cosas que el corpus lista juntas.

### El test de tres vías

Ante cualquier propiedad de una entidad, **una sola pregunta la clasifica**:

| Pregunta | Es… | Ejemplos |
|---|---|---|
| ¿tiene **cantidad que se agota**? | **capa** | overguard · overshield · shield · health |
| ¿es **condición temporal**? | **estado** | procs · `Damage Vulnerability` · invulnerabilidad |
| ¿está en **la fila del dato de la unidad**? | **clase / identidad** | eximus · acolyte · warframe · compañero |

Las tres son excluyentes y ninguna propiedad conocida entra en dos. §21 ya lo usa para separar la
**resistencia por unidad** (clase) de `Damage Vulnerability` (estado); acá queda declarado en vez de
prestado.

⚠️ **La invulnerabilidad no es una capa**, aunque se dibuje en la misma barra: no tiene cantidad, tiene
**duración**. Es el único ítem de la cadena `health → shield → overshield → overguard` que es estado, y
confundirlo lleva a intentar "restarle" daño.

### `capa` ⊥ `clase` — Eximus **otorga** una capa, no **es** una capa

**Prueba pedida:** ¿existe algo que sea Eximus y no se explique por lo que Eximus otorga?

> `eximus.wikitext:116` — *"Unlike typical Eximus, **Prosecutors have 10x base Health rather than
> Overguard**"*
> `:121` — *"Unlike typical Eximus, **Warden Eximus have +1.2 base Health rather than Overguard**"*

**Existen Eximus sin Overguard.** Ser Eximus no es reducible a lo que porta → **no es estado, es clase.**
Y eso reinterpreta la lista de excepciones de `overguard.md`: no es *"el tipo sobrescribe a la clase"* —
es que **Overguard es una propiedad que la clase suele otorgar y no la define**.

Refuerzo de la misma fuente: *"Almost any base unit type (Osprey, Lancer, MOA, etc.) **can spawn as** an
Eximus"* y *"over their **normal counterpart**"*. **Se decide al instanciar, no en runtime** — que es la
firma de una clase, no de un estado.

**Y la prueba independiente, in-game:** un Eximus bajo *Mind Control* **no deja de ser Eximus** al pasar
al bando aliado. El bando cambia, la clase no.

### La lectura de una marca depende de la clase, no del bando

`references/wiki/mechanics/overguard.md` lo ejercita en una sola página:

- *"Only **Warframes, Companions, Specters, and Eidolon Lures** are able to receive Overguard.
  Consequently, it **cannot** be given to **Defense Objects**"* — Defense Object y Warframe **están del
  mismo lado y no comparten la regla**.
- *"On **players**… negate **all** Status Effects"* ↔ *"On **enemies**… ignore the **crowd control**
  effects"* — **misma capa, dos reglas**.

La wiki escribió *"on players / on enemies"* porque esos conjuntos son disjuntos en la práctica, **pero
el discriminador real es la clase**. Consecuencia verificable: un compañero con Overguard lee **como un
warframe**, y un Eximus mind-controlled sigue leyendo **como Eximus**.

**Y el jugador no está en la lista:** portan el warframe y sus hermanos. **El jugador es nodo de
propiedad, no portador** — cierra el árbol de §18 sin retoques.

### 🔴 `Boss` no pasa el test — no es una cosa sola

A diferencia de `Eximus` y `Acolyte`, `Boss` mezcla **cuatro registros**:

| Registro | Evidencia | Qué es |
|---|---|---|
| **rol de misión** | *"There are **seven types** of bosses"*: Normal · Field · Hardmode · Assassin · Adversary · Quest · Event — clasificados por **dónde aparecen** | ❌ no es propiedad de la entidad |
| **inmunidad a CC** | declarada en `ragdoll` y `stagger`, **no en la página de Bosses** | ✅ clase, mal ubicada |
| **exclusiones por habilidad** | `{{ver|18.5}}`: *"Zephyr's Tornado will no longer ragdoll boss-type enemies"*, ídem Valkyr *Paralysis*, Volt *Shock* | ⚠️ lista enumerada patch a patch |
| **tope de status** | `{{ver|27.3}}`: sólo **Kuva Liches**, y DE lo declara *"our **first step**… we work towards applying this to other Bosses/VIPS"* | ⚠️ **rollout incompleto por declaración de la fuente** |

**`Acolyte` sí pasa:** familia cerrada y nombrada (Angst · Malice · Mania · Misery · Torment · Violence)
con reglas propias que **no son reducibles a lo que porta** — no hay capa ni marca que explique su tope
de status.

⚠️ **Y las exclusiones de 18.5 están escritas del lado del emisor** (*"la habilidad X ya no hace Y a
bosses"*), no del receptor (*"bosses ignoran Y"*). **El fraseo de la fuente no dice dónde vive la
regla** — misma asimetría emisor/receptor de §17, y motivo suficiente para no derivar la clase `Boss`
de esa lista.

**Enlaza con** §17 (el canal de desvío necesita esta clase), §20 (`f(estado en t)` la necesita para
leer una marca), §21 (el test separa la resistencia por unidad de `Damage Vulnerability`).
Cita: `references/wiki/mechanics/{overguard,eximus,acolytes,bosses}` + los raws hermanos.
