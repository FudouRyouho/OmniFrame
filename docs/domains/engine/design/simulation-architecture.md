---
Estado: "activo"
Rol: "Definición de macro y micro arquitectura del motor de simulación v2"
Version: "v0.4.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-07-08"
Dependencias:
  - "docs/domains/engine/design/simulation-blueprint.md"
Dependidos:
  - "docs/domains/engine/design/simulation-contracts.md"
---

# OmniFrame Simulation Architecture

Capas horizontales con comunicación vertical estricta: cada capa es completa en su nivel de abstracción y solo se comunica hacia abajo (computar) o hacia arriba (proyectar).

---

## 1. Macro-Arquitectura: El Flujo de Verdad

```
┌─────────────────────────────────────────────────┐
│  A — INTENCIÓN                                  │
│  EnsembleStore + EnsembleIntention              │
└───────────────────┬─────────────────────────────┘
                    │ snapshot de intención
┌───────────────────▼─────────────────────────────┐
│  B — COMUNICACIÓN                               │
│  MutatorBridge                                  │
└───────────────────┬─────────────────────────────┘
                    │ Ensemble (contrato del engine)
┌───────────────────▼─────────────────────────────┐
│  C1 — ENGINE (resolve/)   C2 — SIMULATION       │
│  SimulationEngine         CombatCalculator      │
│  StaticHydrator           TimelineSimulator     │
│  ModRepository            StatusEngine          │
└───────────────────┬─────────────────────────────┘
                    │ snapshot(): SimulationEntity[]  (salida de C, output/consume.ts)
┌───────────────────▼─────────────────────────────┐
│  D — PROYECCIÓN                                 │
│  ViewModelContract v0 (display-only/C1)          │
│  @shared/view-model + useViewModel (@providers)  │
└─────────────────────────────────────────────────┘
```

> **Nomenclatura en evolución (2026-07-03):** el payload de salida de C se llamaba `ProjectionSnapshot`
> (tipo purgado 2026-06-16); hoy la salida cruda es `snapshot(): SimulationEntity[]`. El rename del payload
> y el destino final de la Capa D (contrato neutro + Capa E / ViewModel real) **siguen en flujo** — ver
> `OQ-ENGINE-8` (rename del payload) y `OQ-ENGINE-10` (Capa E). Este doc refleja lo asentado; los ejes
> abiertos se rastrean en esas OQ.

---

### Las dos intenciones del usuario

El sistema recibe dos tipos de intención del usuario, con ciclos de vida independientes:

| Intención | Contrato | Quién la produce | Destino |
|---|---|---|---|
| **Equipamiento** | `EnsembleIntention` | `EnsembleStore` (Capa A) | B → C1/C2 |
| **Contexto de simulación** | `SimulationContext` | Arsenal State (UI) | B → C1/C2, D |

**`EnsembleIntention`** responde "¿qué tengo equipado?". No cambia si el usuario activa o desactiva una condición.

**`SimulationContext`** responde "¿cómo quiero ver el resultado?". Arsenal State lo construye derivando las condiciones disponibles del propio `EnsembleIntention`: si Galvanized Savvy está equipada, Arsenal State sabe que existe la condición asociada y la incluye en `flags`. El engine no infiere condiciones — las recibe ya construidas.

**Estado inicial (simplificación estática):** `flags` = todas las condiciones derivadas del equipamiento en `true`, `variables` = todos los stacks al máximo. A medida que el modelo evolucione, el usuario podrá controlar condiciones individuales y cantidad de stacks desde la UI.

**`SimulationContext` como punto de variabilidad de C2:** C2 no tiene sub-modos. Lo que varía es la riqueza del contexto:
- Mínimo (flags derivadas del equipo, sin enemigo) → resolución "todo activo al máximo"
- Completo (enemigo + timeline) → simulación con DoT y TTK

La capa, el contrato y el flujo son idénticos en ambos casos.

---

### Capa A: Intención (EnsembleStore)

- **Naturaleza**: Dos preocupaciones horizontales bajo el mismo concepto:
  - **EnsembleStore** — contenedor reactivo (observable agnóstico de framework). Reacciona a acciones explícitas del usuario (equipar ítem, asignar mod). Es proactivamente reactivo: no sabe de UI interna, pero emite snapshots cuando el usuario actúa.
  - **EnsembleIntention** — contrato de datos puro (POJO tipado). Define qué tiene equipado el usuario en cada canal y bajo qué condiciones de entorno.
- **Responsabilidad**: Almacenar la intención del usuario como datos puros. No contiene lógica de juego ni fórmulas.
- **Contrato**: `EnsembleIntention` — ver `@shared/types/ensemble.ts` (gemelo-de-entrada, movido desde `providers/Ensemble` 2026-06-12).
- **No conoce**: fórmulas del engine, contexto de simulación, cómo la UI se renderiza.
- **Físico**: store `ensembleStore` en `@core/intention/ensemble-store.ts` (A1); binding React `EnsembleProvider` en `providers/Ensemble/` (composición). El store salió de `providers/` el 2026-06-12.

> **Edge cases (ej: armas exaltadas):** Cuando una habilidad activa un arma exaltada (Excalibur, Valkyr), la intención debe reflejar ese cambio de estado sin que sea una selección directa del usuario. Este caso no está resuelto hoy — es una preocupación de diseño pendiente en Capa A.

---

### Capa B: Comunicación (MutatorBridge)

- **Naturaleza**: Capa de traducción unidireccional. Solo baja (intención → engine). No sube.
- **Dos entradas:** recibe `EnsembleIntention` desde Capa A **y** `SimulationContext` desde Arsenal State (UI). No construye el contexto — lo recibe ya formado y lo reenvía al engine junto con el Ensemble traducido.
- **Responsabilidad**:
  - Escucha el snapshot de `EnsembleIntention`.
  - **DNA Mutation Step**: Aplica mutaciones fijas (Archon Shards, Helminth) sobre los valores base del dataset. Entrega `MutatedDNA` al engine. *(Archon Shards implementados — OQ-ENGINE-4 cerrado (2026-05-27): `StaticHydrator.hydrate()` consume `ensemble.warframe.shards` vía `ShardRepository`. Helminth sigue sin implementar.)*
  - **Positional Mapping**: Preserva el orden de slots de mods para el Elemental System de C1.
- **No conoce**: React, UI, cómo las fórmulas funcionan internamente. No decide qué condiciones están activas.
- **Físico**: `Project/src/core/bridge/MutatorBridge.ts` (fuera de `engine/` desde 2026-06-12 — B no es C).

---

### Capa C1: Engine (Fórmulas Puras)

- **Naturaleza**: Motor matemático funcional y determinista. No tiene estado mutable.
- **Responsabilidad**:
  - Recibe el `Ensemble` de Capa B y el `SimulationContext`.
  - Construye el grafo reactivo de atributos (`AttributeNode` por entidad).
  - Resuelve el grafo mediante Topological Sort + Fixed-Point fallback.
  - Emite entidades con atributos completamente resueltos.
- **No conoce**: tiempo, enemigos, entorno de combate, UI.
- **Contrato de AttributeNode**: ver `docs/domains/engine/attribute-node-contract.md`
- **Físico**: `engine/resolve/SimulationEngine.ts` + `engine/resolve/hydration/{StaticHydrator, ModRepository, DnaRepository, ItemRepository (segmentado weapon/warframe, Slice C), ShardRepository, IncarnonRepository, ArcaneRepository, DamageCombiner}.ts`. Reorganizado a `resolve/` el 2026-06-12.

---

### Capa C2: Simulation (Entorno Reproducible)

- **Naturaleza**: Aplica el resultado de C1 en un escenario reproducible con contexto. Usa C1 internamente.
- **Responsabilidad**:
  - Recibe las entidades resueltas de C1 + `SimulationContext` (flags de condiciones, variables de stacks, target opcional, distancia).
  - Resuelve daño final, procs de estado, líneas de tiempo. El nivel de detalle depende de la riqueza del `SimulationContext` recibido — no de sub-modos internos de C2.
  - Emite métricas de combate (DPS, TTK, status weights). *(El payload rico `ProjectionSnapshot` diseñado para esto fue purgado 2026-06-16; hoy las métricas viven en `CombatMetrics` de `CombatCalculator` y aún no fluyen a un contrato de salida único — deuda registrada, ver `OQ-ENGINE-8`. El modelo de daño/status de C2 se aterrizó en `design/damage-status-model.md`, 2026-07-02.)*
- **No conoce**: UI, intención del usuario, cómo se presentan los resultados.
- **Distinción clave con C1**: C1 resuelve *qué vale cada atributo*. C2 resuelve *qué pasa en el juego con esos valores*.
- **Físico**: `engine/simulate/combat/{CombatCalculator, CombatSimulator, AtomicSimulator, TimelineSimulator, StatusEngine, RngProvider}.ts` + `engine/simulate/enemies/{EnemyRepository, EnemyState}.ts`. Reorganizado a `simulate/` el 2026-06-12.

---

### Capa D: Proyección (Reactive View Bridge)

- **Naturaleza**: Capa de transformación y presentación reactiva. Solo sube (snapshot → UI).
- **Responsabilidad**:
  - Recibe el snapshot resuelto de C (`consume().snapshot(): SimulationEntity[]`).
  - Transforma el snapshot en una estructura que la UI puede consumir sin conocer internos del engine (`project()` → `ViewModelContract`).
  - *(Pendiente)* Gestiona la granularidad reactiva: emitir solo los nodos que cambiaron respecto al snapshot anterior (diff).
  - Expone los buckets de `AttributeNode` estructurados para la vista de "sheets" (contribución de mods por capa de fórmula).
- **No es el Observer de v1**: el Observer era externo y para debug. La Capa D es parte del flujo de presentación.
- **No conoce**: fórmulas del engine, lógica de simulación.
- **`view_mode`** *(diseñado, no implementado)*: `"classic"` expondría solo `AttributeNode.final`; `"advanced"` los buckets completos con atribución por fuente. Mismo cálculo de C1 — distinta profundidad de exposición.
- **Estado actual (2026-07-03)**: **`ViewModelContract` v0 (display-only/C1) materializado** — `project()` en `@shared/view-model` (snapshot crudo → `token·value·unit·category`), consumido por **D1** (`UpgradeView` vía `useViewModel` en `@providers`) y **D2** (oráculo CLI, `npm run oracle -- view`). Ningún dominio importa `@core`.
- **Pendiente**: versión reactiva completa (diff tracker, granular emitters), `metrics`/A2 (C2), y el rename D→contrato-neutro + construcción de la **Capa E** (ViewModel real con chrome) — ver `OQ-ENGINE-10`. El `useSimulation` que cumplía este rol de forma parcial fue **purgado** (2026-06-16), no reubicado.

> **Salida de C ≠ Capa D (frontera de dominios):** `consume()` (en `@core/engine/output/`) es el **punto de salida de C** — superficie del dominio engine, consumida directo por **scripts y tests (no-dominios)**. **No es la Capa D.** La Capa D (consumo derivado: `ViewModelContract` + mapping) vive **fuera** de `@core` y cruza por `@shared`; los dominios no importan `@core` (Restricción 1). Ver [`arch-decisions.md`](arch-decisions.md) §6-7.
>
> **Primer cliente real (no-UI):** el CLI oráculo (`scripts/oracle/`) consume `consume()` y, en modo `view`, `project()` — es el cliente que `OQ-ENGINE-FUTURE` ponía como condición para materializar D. Su output fue el material del que se derivó `ViewModelContract` v0.
>
> **Estado:** `A→B→C→D` coherente con D v0 (display-only); la **Capa E** (confluencia info+chrome) sigue estacionada — `OQ-ENGINE-10`.

> **Regla clave:** el engine no expone signals ni objetos reactivos propios. La reactividad vive exclusivamente en Capa D, no en C1 ni C2.

---

## 2. Micro-Arquitectura: El Modelo de Entidades (Reactive Attribute Graph)

OmniFrame opera como un motor de juego simplificado. Todo objeto en el sistema es una **Entidad** conectada a un **Grafo Reactivo de Atributos**.

### 2.0 El trazado de una instancia de daño (source-agnostic)

> **Reconciliación (2026-07-08).** Las facetas del ciclo de vida de una instancia de daño estaban
> **dispersas** en §2.1 (TE), §2.5 (modo Expected/atómico), §2.6 (capas decoradoras) y §2.7 (Casting
> Snapshot) — varias "diseñado-no-implementado". Esta sección las unifica en **un trazado único**. Es
> **ortogonal** al flujo macro A→B→C→D (§1): aquél es equipamiento→proyección; éste es el ciclo de vida
> de una **instancia** dentro de C. No lo reemplaza.

**Principio rector — desacople emergente, no capas preventivas.** Una etapa/separación se agrega **sólo
cuando una mecánica real la fuerza**, nunca para prevenir. Separar sobre dato-sin-modelar *genera* drift
(lo contrario del objetivo). Y el costo es asimétrico: **desacoplar después es barato** (`scale()` es una
función pura, se reubica en un move), **refactorizar lo enredado es caro** — `resolveHit` (que hoy colapsa
②+③, abajo) es la evidencia viva de lo segundo.

**El trazado — 3 etapas:**

```
[C1 ya resolvió los stats de la fuente (§2.3 accumulator). La instancia nace DESPUÉS de C1.]
        │
① NACE                una fuente emite instancia(s):
                      · arma      → perfil (§2.1 AttackProfileRegistry) + multishot (N instancias)
                      · habilidad → cast + ADN inyectado (§2.7 Casting Snapshot)
                      · proc/DoT  → TE (§2.1)
                      cada instancia lleva magnitudes base por tipo + un snapshot CONGELADO de los
                      stats de su fuente (§2.7 es el caso ability; para arma el snapshot es el entity C1).
        │
② COMPONE-TRAYECTO    transforms DETERMINISTAS sobre la instancia, source-agnostic. Todos conmutan
                      → UNA sola etapa (sub-clasificación interna, NO sub-etapas):
                      · sinergia externa        (Roar ×, mods de facción Expel/Bane, arcanos final-crit-damage)
                      · mutación contextual     (falloff por distancia)
                      · aplicación del crit
                      Modo promedio (build-calculator, averageCritMultiplier) vs tirada (timeline,
                      resolveCritTier) = eje §2.5 (Expected/Atómico) + arch-decisions §8 (input→simulado).
                      El modo NO cambia la etapa.
        │
③ RESUELVE-VS-TARGET  física INTRÍNSECA del target-entidad, source-agnostic, keyed en el TARGET (no en el
                      trayecto): bonificación de facción · DR de armadura · ruteo/bypass de capa
                      (shields/health, Toxin bypass, Slash=True) · multiplicadores de stacks de status · caps/floors.
```

**Fronteras que el trazado clarifica:**

- **C1/C2.** La "mutación" de stats es C1 (§2.3); ①②③ son C2. Ninguna etapa del trazado re-resuelve el grafo.
- **§2.6 = orden de resolución de un STAT (C1), NO del daño-vs-target.** La línea "POST_MUL: Faction damage
  adjustments" que §2.6 lista pertenece en realidad a **③** (propiedad del target, C2), no a un decorador de
  stat. Se separan los dos órdenes (deshace el muddle histórico).
- **② vs ③ = trayecto vs contexto-target.** ② es lo que la instancia acumula/lleva hasta llegar
  (instance-keyed); ③ es lo que el target le hace (target-keyed). Una "sinergia sobre el target" (ej. el
  target tiene Viral → recibe más) es **③**, no ②.
- **③ vive como auxiliares de la ENTIDAD-target**, source-agnostic — cualquier fuente (arma, habilidad, tick)
  llama las mismas. DR es entidad-level (con variantes: enemigo `√3a/100`, jugador `armor/(armor+300)`);
  encerrarla por tipo de entidad fue el origen del bug de `resolveHit` (usa la DR del jugador sobre enemigos).

**`resolveHit` = drift.** Hoy colapsa ②+③ en una función weapon-specific. Su descomposición (② composición
source-agnostic; ③ auxiliares de la entidad-target) es trabajo posterior, no de este doc.

**Estado.** El trazado es el **objetivo** de arquitectura; la implementación actual (`CombatCalculator`/
`resolveHit`) aún no lo sigue — coherente con §2.1 ("TE-como-entidad-en-cola: diseñado, no implementado"). La
**salida** del trazado (daño final / métricas C2) no fluye a un contrato de salida único todavía — deuda
`OQ-ENGINE-8`.

### 2.1 Clasificación de Entidades (PE vs TE)
Para mantener el motor ligero y determinista, las entidades se dividen por su ciclo de vida:

- **PE (Persistent Entities)**:
  - **Definición**: Entidades que el usuario "posee" y equipa en su loadout.
  - **ADN Extendido**: Las armas poseen un **`AttackProfileRegistry`** (Primary, Alt, Incarnon), donde cada perfil define su propio `DeliveryType` (Beam, Projectile, etc.).
  - **Ejemplos**: Warframe, Weapon, Companion, Mods, Arcanes.

- **TE (Transient Entities)**:
  - **Definición**: Entidades efímeras generadas por una acción o comportamiento.
  - **Jerarquía de Generación** *(TE-como-entidad-en-cola: diseñado, no implementado)*: la idea era que una TE genere TEs hijas (Impacto → Proc). Hoy los procs/DoT son **proyecciones matemáticas** de `StatusEngine`/`EnemyState`, no TEs reales en una cola (sin límite de profundidad ni energía de tick). El **double-dip** sí se modela como regla de composición aritmética — ver [`damage-status-model.md`](damage-status-model.md) §Reglas de composición (faction sobre DoTs, `OQ-ENGINE-13`).
  - **Ejemplos**: Proyectiles, Procs de Estado, Invocaciones temporales.

### 2.2 El Escenario: Espacio Abstracto (Buckets de Estado)
La simulación no utiliza coordenadas físicas (X, Y, Z), sino un **Escenario Abstracto** basado en condiciones lógicas:

- **Buckets de Distancia**: Rangos discretos que afectan el Falloff o el AoE (ej: `0-10m`, `10-20m`). *(Falloff parametrizado; el bucketing por distancia como variable de C2 sigue en diseño — ver `references/wiki/mechanics/damage-falloff.md` y OQ-ENGINE-7.)*
- **Puntos de Impacto** *(diseñado, no implementado)*: zona de impacto (`Head`, `Body`, `Weakpoint`) — sin multiplicador por zona en `CombatSimulator.resolveHit()` todavía.
- **Estados de Entorno**: Flags que describen el espacio físico sin geometría (ej: `Inside Magnetize Bubble`, `In Air`, `Sliding`).

### 2.3 El Acumulador de Atributos (Stat Accumulator v3 - "The Audited Formula")
Estructura de cálculo blindada para evitar ambigüedades en la suma y escalados cruzados.

- **Fórmula Maestra**:
  `V = ((Base + BaseFlat) * (1 + BaseAddPct/100) * (1 + ModsAddPct/100) + TotalFlat) * Multiplicative`

- **Desglose de Buckets**:
  1. **Base**: Valor inmutable de la "fábrica" (DNA).
  2. **Base Flat (Add to Base)**: Sumas directas al valor base (ej: Arcanos de Armadura fija). Afecta a todos los porcentajes posteriores.
  3. **Base Add Pct (Scale Base)**: Porcentajes que aumentan la base antes de los mods (Casos raros de "Base Stat Link").
  4. **Mods Add Pct (Relative Additive)**: El bucket estándar de mods (ej: Serration, Vitality). Se suman entre sí: `1 + (Σ mods / 100)`.
  5. **Total Flat (Add to Total)**: Sumas fijas finales (ej: daño adicional plano de algunas pasivas). No escalan con mods.
  6. **Multiplicative**: Multiplicadores finales independientes (ej: Roar, Críticos).

- **Contrato detallado**: ver `docs/domains/engine/attribute-node-contract.md`

- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si un Arcano da +900 de Armadura?* Entra en `BaseFlat`. La armadura total sube y los mods de `% Armor` escalan sobre ese nuevo valor.
  - *¿Qué pasa si tengo Serration (+165%) y Heavy Caliber (+165%)?* Entran en `ModsAddPct`. Resultado: `(1 + 1.65 + 1.65) = 4.3x`.
  - *¿Qué pasa si un buff dice "Doble de daño"?* Entra en `Multiplicative`. Resultado: `V * 2`.

### 2.4 Resolución del Grafo: Ciclos y Convergencia
Warframe permite que el Atributo A dependa de B, y B de A (ej: Escudo -> Daño -> Lifesteal -> Escudo).

- **Detección de Ciclos**: El Topological Sort detecta ciclos estáticos.
- **Resolución de "Cross-Stat Scaling"**: 
  - Para dependencias lineales (Armor -> Crit), el grafo las resuelve en un solo paso.
  - Para **Dependencias Circulares**, el motor aplica **Fixed-Point Iteration (Max 3 pasos)**:
    1. Paso 1: Resuelve usando valores base/identidad para los nodos del ciclo.
    2. Paso 2-3: Re-calcula los nodos del ciclo usando los resultados del paso anterior.
    3. **Convergence Check** *(diseñado, no implementado)*: Si el valor cambia menos del 0.01%, se consideraría resuelto. Hoy los 3 pasos corren **incondicionalmente** (sin comparación de delta).
    4. **Emergency Break** *(diseñado, no implementado)*: el `STALE_LOOP_WARNING` no se emite; el corte a 3 pasos sí existe (evita el cuelgue).
- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si el loop es infinito (A=B+1, B=A+1)?* El Emergency Break corta la ejecución en el paso 3, evitando el cuelgue del hilo principal.

### 2.5 Hybrid Simulation: El "Escudo Térmico" de Rendimiento
Para evitar el agotamiento de la `MAX_TICK_ENERGY` en ráfagas de alta densidad (ej: Kuva Kohm con Multishot extremo).

- **Conmutación Automática**:
  - **Modo Atómico**: Cada perdigón es una TE (Transient Entity) con su propia resolución de procs.
  - **Modo Probabilístico (Expected Value)**: Si `Energy_Tick > Threshold`, el motor agrupa los N perdigones restantes en un **"Batch Entity"**.
  - **Cálculo de Batch**: En lugar de tirar dados por cada perdigón, calcula el `ExpectedValue` de procs y daño (ej: "8.5 procs de Cortante en promedio") y aplica el resultado de forma determinista.
- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si el modo probabilístico "borra" un proc crítico de 1 en un millón?* El modelo de EV garantiza que estadísticamente el DPS sea idéntico, aunque se pierda la "granularidad" del evento único. Para la UI, el resultado es indistinguible y el rendimiento se mantiene estable.

### 2.6 Jerarquía de Leyes (Logic Decorator Layers)

> **⚠️ Diseñado, NO implementado (2026-07-03).** Hoy el engine resuelve todos los modificadores en un solo
> bloque (la fórmula del acumulador §2.3), sin capas decoradoras ordenadas — caps/floors/overrides no tienen
> orden garantizado. Es una de las decisiones de blindaje pendientes (ver [`arch-decisions.md`](arch-decisions.md) §4);
> se construirá cuando el layering con orden crítico empiece a doler.

> **Alcance (2026-07-08, §2.0):** estas capas ordenan la resolución de un **STAT** (C1). El `POST_MUL:
> Faction damage adjustments` de abajo NO es un decorador de stat: es la etapa **③ RESUELVE-VS-TARGET** del
> trazado (§2.0) — propiedad del target (C2). No mezclar los dos órdenes.

Para evitar condiciones de carrera entre decoradores (ej: "¿50% de reducción o mínimo 10?").

- **Capas de Ejecución (Orden Estricto)**:
  1. `INITIAL_OVERRIDE`: Forza valores antes de cualquier cálculo.
  2. `PRE_ADD`: Altera la base antes de los buckets aditivos.
  3. `POST_ADD`: Modifica el resultado tras las sumas pero antes de multiplicadores.
  4. `POST_MUL`: Modifica tras multiplicadores (ej: Faction damage adjustments).
  5. `FINAL_CLIP`: Caps y Floors finales (ej: "No menos de 10 de daño").
  6. `UI_DISPLAY`: Formateo estético sin afectar la simulación.

- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si A dice "Min 10" y B dice "Reducción 50%"?* Si "Min 10" está en `FINAL_CLIP` y "Reducción 50%" en `POST_MUL`, el daño será 50% y luego, si es menor a 10, subirá a 10. Resultado determinista.

### 2.7 ADN Dinámico: El "Casting Snapshot"

> **⚠️ Diseñado, NO implementado (2026-07-03).** El behavior `CAST` → snapshot parcial del padre →
> `Injected DNA` en la TE no existe (Iron Skin y habilidades-snapshot no modeladas). Feature futura —
> ver [`arch-decisions.md`](arch-decisions.md) §4.

Resuelve el problema de habilidades como Iron Skin de Rhino.

- **Mecánica**: 
  - Al ejecutar el behavior `CAST`, el motor toma un `Projection Snapshot` parcial de los atributos relevantes del padre en ese micro-segundo.
  - Ese snapshot se inyecta como **`Injected DNA`** en la nueva entidad (TE).
  - La TE es inmutable respecto a ese ADN; si los stats del padre cambian después, la TE (Iron Skin) no se ve afectada.
- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si el ADN es inmutable?* Se mantiene la pureza A→B→C1→C2. El ADN dinámico es simplemente un parámetro de entrada para C1, no un cambio en los datasets de Capa B.

---

## 3. Principios de Implementación

1. **Agnosticismo Total**: El engine (C1 y C2) no sabe que React existe. Podría correr en un servidor, en un worker o en una terminal.
2. **Reactividad por Bridge**: La granularidad reactiva vive en Capa D, no en C1 ni C2.
3. **Comunicación vertical estricta**: Ninguna capa salta una capa intermedia. No hay comunicación horizontal entre capas del mismo nivel.
4. **Fidelidad Documental**: Cada fórmula en el código debe tener un puntero directo a su correspondiente en `references/wiki/`.

---

## 4. Definición de Sistemas por Capa

### C1 — Engine Modules
- **Elemental System**: Lógica de colisión y combinación de tipos de daño (`DamageCombiner`).
- **Attribute Graph**: Resolución del grafo reactivo de atributos (`SimulationEngine`).
- **Hydration**: Construcción de entidades desde dataset + DNA (`StaticHydrator`, `DnaRepository`).
- **Mod Resolution**: Traducción de upgrade types a modificadores tipados (`ModRepository`).

### C2 — Simulation Modules
- **Combat Simulator**: Resolución de daño final contra un Target (`CombatCalculator`, `CombatSimulator`).
- **Status Engine**: Simulación de proyecciones de DoT y procs (`StatusEngine`).
- **Ability System**: Escalado de poderes por contexto de simulación.
- **Time-Window Simulator (Timeline)**:
  - Sistema híbrido que proyecta el comportamiento del loadout en una ventana de tiempo (ej: 0s a 10s).
  - Genera una serie temporal de datos para visualizar gráficas de DPS sostenido, picos de daño y decaimiento de buffs.
  - Permite estimar el Time-to-Kill teórico contra enemigos simulados.
