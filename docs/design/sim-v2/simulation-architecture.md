---
Estado: "activo"
Rol: "Definición de macro y micro arquitectura del motor de simulación v2"
Version: "v0.2.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-05-19"
Dependencias:
  - "docs/design/sim-v2/simulation-blueprint.md"
Dependidos:
  - "docs/design/sim-v2/simulation-contracts.md"
---

# OmniFrame Simulation Architecture

Este documento define la macro y micro arquitectura del motor de simulación v2. El modelo fue diseñado para resolver los problemas de v1 (Resolver bidireccional y demasiado abstracto) mediante **capas horizontales con comunicación vertical estricta**: cada capa es completa en su nivel de abstracción y solo se comunica hacia abajo (para computar) o hacia arriba (para proyectar).

> **Nota de versión:** v0.2.0 actualiza la macro-arquitectura de A/B/C/B4 al modelo de cinco capas (A, B, C1, C2, D) acordado en mayo 2026. La micro-arquitectura (§2) permanece sin cambios.

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
│  C1 — ENGINE          C2 — SIMULATION           │
│  SimulationEngine     CombatCalculator          │
│  StaticHydrator       TimelineSimulator         │
│  ModRepository        StatusEngine              │
└───────────────────┬─────────────────────────────┘
                    │ ProjectionSnapshot
┌───────────────────▼─────────────────────────────┐
│  D — PROYECCIÓN                                 │
│  [ViewModelContract — pendiente de definición]  │
└─────────────────────────────────────────────────┘
```

---

### Capa A: Intención (EnsembleStore)

- **Naturaleza**: Dos preocupaciones horizontales bajo el mismo concepto:
  - **EnsembleStore** — contenedor reactivo (observable agnóstico de framework). Reacciona a acciones explícitas del usuario (equipar ítem, asignar mod). Es proactivamente reactivo: no sabe de UI interna, pero emite snapshots cuando el usuario actúa.
  - **EnsembleIntention** — contrato de datos puro (POJO tipado). Define qué tiene equipado el usuario en cada canal y bajo qué condiciones de entorno.
- **Responsabilidad**: Almacenar la intención del usuario como datos puros. No contiene lógica de juego ni fórmulas.
- **Contrato**: `EnsembleIntention` — ver `providers/Ensemble/ensemble.types.ts`
- **No conoce**: fórmulas del engine, contexto de simulación, cómo la UI se renderiza.
- **Físico**: `Project/src/providers/Ensemble/`

> **Edge cases (ej: armas exaltadas):** Cuando una habilidad activa un arma exaltada (Excalibur, Valkyr), la intención debe reflejar ese cambio de estado sin que sea una selección directa del usuario. Este caso no está resuelto hoy — es una preocupación de diseño pendiente en Capa A.

---

### Capa B: Comunicación (MutatorBridge)

- **Naturaleza**: Capa de traducción unidireccional. Solo baja (intención → engine). No sube.
- **Responsabilidad**:
  - Escucha el snapshot de `EnsembleIntention`.
  - **DNA Mutation Step**: Aplica mutaciones fijas (Archon Shards, Helminth) sobre los valores base del dataset. Entrega `MutatedDNA` al engine. *(Parcialmente implementado — shards mapeados, lógica de mutación pendiente. Ver OQ-ENGINE-4.)*
  - **Positional Mapping**: Preserva el orden de slots de mods para el Elemental System de C1.
- **No conoce**: React, UI, cómo las fórmulas funcionan internamente.
- **Físico**: `Project/src/core/engine/sim-v2/logic/MutatorBridge.ts`

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
- **Físico**: `SimulationEngine.ts`, `StaticHydrator.ts`, `ModRepository.ts`, `DnaRepository.ts`, `ItemRepository.ts`

---

### Capa C2: Simulation (Entorno Reproducible)

- **Naturaleza**: Aplica el resultado de C1 en un escenario reproducible con contexto. Usa C1 internamente.
- **Responsabilidad**:
  - Recibe las entidades resueltas de C1 + `SimulationContext` (target, distancia, flags de entorno).
  - Resuelve daño final contra enemigos, procs de estado, líneas de tiempo.
  - Emite `ProjectionSnapshot` con métricas de combate (DPS, TTK, status weights).
- **No conoce**: UI, intención del usuario, cómo se presentan los resultados.
- **Distinción clave con C1**: C1 resuelve *qué vale cada atributo*. C2 resuelve *qué pasa en el juego con esos valores*.
- **Físico**: `CombatCalculator.ts`, `CombatSimulator.ts`, `TimelineSimulator.ts`, `StatusEngine.ts`, `EnemyRepository.ts`, `EnemyState.ts`

---

### Capa D: Proyección (Reactive View Bridge)

- **Naturaleza**: Capa de transformación y presentación reactiva. Solo sube (snapshot → UI).
- **Responsabilidad**:
  - Recibe `ProjectionSnapshot` de C2.
  - Transforma el snapshot en una estructura que la UI puede consumir sin conocer internos del engine.
  - Gestiona la granularidad reactiva: solo emite actualizaciones para los nodos que cambiaron respecto al snapshot anterior (diff).
  - Expone los buckets de `AttributeNode` estructurados para la vista de "sheets" (contribución de mods por capa de fórmula).
- **No es el Observer de v1**: el Observer era externo y para debug. La Capa D es parte del flujo de presentación.
- **No conoce**: fórmulas del engine, lógica de simulación.
- **Estado actual**: implementación mínima (`useSimulation` hook expone el snapshot crudo). El contrato de `ViewModelContract` está **pendiente de definición**.
- **Físico actual**: `Project/src/core/engine/sim-v2/hooks/useSimulation.ts`
- **Físico pendiente**: ViewModelContract, diff tracker, granular reactive emitters.

> **Regla clave:** el engine no expone signals ni objetos reactivos propios. La reactividad vive exclusivamente en Capa D, no en C1 ni C2.

---

## 2. Micro-Arquitectura: El Modelo de Entidades (Reactive Attribute Graph)

OmniFrame opera como un motor de juego simplificado. Todo objeto en el sistema es una **Entidad** conectada a un **Grafo Reactivo de Atributos**.

### 2.1 Clasificación de Entidades (PE vs TE)
Para mantener el motor ligero y determinista, las entidades se dividen por su ciclo de vida:

- **PE (Persistent Entities)**:
  - **Definición**: Entidades que el usuario "posee" y equipa en su loadout.
  - **ADN Extendido**: Las armas poseen un **`AttackProfileRegistry`** (Primary, Alt, Incarnon), donde cada perfil define su propio `DeliveryType` (Beam, Projectile, etc.).
  - **Ejemplos**: Warframe, Weapon, Companion, Mods, Arcanes.

- **TE (Transient Entities)**:
  - **Definición**: Entidades efímeras generadas por una acción o comportamiento.
  - **Jerarquía de Generación**: Una TE puede generar TEs hijas (ej: un Impacto genera un Proc de Estado). Esto permite simular el **Double Dipping** (re-aplicación de multiplicadores en el proc).
  - **Ejemplos**: Proyectiles, Procs de Estado, Invocaciones temporales.

### 2.2 El Escenario: Espacio Abstracto (Buckets de Estado)
La simulación no utiliza coordenadas físicas (X, Y, Z), sino un **Escenario Abstracto** basado en condiciones lógicas:

- **Buckets de Distancia**: Rangos discretos que afectan el Falloff o el AoE (ej: `0-10m`, `10-20m`).
- **Puntos de Impacto**: Selección lógica de la zona de impacto (`Head`, `Body`, `Weakpoint`).
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
    3. **Convergence Check**: Si el valor cambia menos del 0.01%, se considera resuelto.
    4. **Emergency Break**: Si no converge tras 3 pasos, se congela el valor y se emite un `STALE_LOOP_WARNING` en los diagnósticos.
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
