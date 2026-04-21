---
Estado: "ratificado"
Rol: "Definición de macro y micro arquitectura del motor de simulación v2"
Version: "v0.1.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-04-21"
Dependencias:
  - "docs/design/sim-v2/simulation-blueprint.md"
Dependidos:
  - "docs/design/sim-v2/simulation-contracts.md"
---

# OmniFrame Simulation Architecture

Este documento concentra la arquitectura general del motor de simulación, separando responsabilidades entre intención, hidratación, simulación y proyección.

---

## 1. Macro-Arquitectura: El Flujo de Verdad

Para garantizar el desacoplamiento y la fidelidad, el sistema se divide en tres capas de responsabilidad estricta:

### Capa A: Intención (Loadout Store)
- **Naturaleza**: Estado mutable del usuario.
- **Responsabilidad**: Almacena punteros (IDs y Ranks) de lo que el usuario desea equipar. No contiene lógica de juego.
- **Contrato**: `{ warframeId: string, primaryId: string, mods: Slot[] }`.

### Capa B: Hidratación (The Mutator Bridge)
- **Naturaleza**: Capa de traducción, búsqueda y mutación.
- **Responsabilidad**:
  - Escucha la **Intención (Ensemble)**.
  - **DNA Mutation Step**: Antes de emitir el cuerpo hidratado, aplica las "Mutaciones Fijas" (Archon Shards, Helminth, Invasiones) sobre los valores base de los datasets. Esto entrega un `MutatedDNA` a la simulación.
  - **Positional Mapping**: Mapea los slots de la intención a una estructura indexada que preserve el orden de los mods para el `Elemental System`.
  - **Hidratación Parcial (Content Hashing)**: Solo re-hidrata si el hash de la rama (o su mutación) ha cambiado.

### Capa C: Simulación (The Engine)
- **Naturaleza**: Motor de leyes físicas y matemáticas (Funcional y Determinista).
- **Responsabilidad**: 
  - **Elemental System (The Factor Order)**: Procesa los modificadores elementales siguiendo el orden de slots (0 -> N). Combina elementos según las reglas de precedencia de Warframe (Mod 1 + Mod 2 = Combo, Mod 1 + Base = Combo, etc.).
  - **Attribute-Level Resolve**: El motor resuelve por **Atributo**.
  - **Variant DNA Resolve**: Capaz de conmutar entre perfiles de ADN (Incarnon/Alt) inyectados en el `AttackProfileRegistry` mediante un flag de contexto.
  - **Tick Queue (Anti-recursión)**: Las Transient Entities se procesan en una cola de simulación con límites de profundidad y energía.
  - **Atomic Simulation Step**: Resolución secuencial intrapaso de perdigones en memoria volátil.
- **Salida**: La **Proyección (B4)**, un reporte completo del estado del simulacro para la UI.

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
  6. **Multiplicative**: Multiplicadores finales independientes (ej: Roar, Faction Damage, Críticos).

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
  - *¿Qué pasa si el ADN es inmutable?* Se mantiene la pureza A->B->C. El ADN dinámico es simplemente un parámetro de entrada para la Capa C, no un cambio en los datasets de la Capa B.

### 2.4 Contrato de Proyección (B4)
La salida del motor debe separarse en dos formas claramente distintas:
- **Projection Snapshot**: Un POJO inmutable y serializable con el resultado de la simulación. Es la salida oficial del motor.
- **Selective UI Reactive Bridge**: Capa externa que adapta el snapshot a la UI. Debe ser **selectiva**: solo actualiza los nodos reactivos (Signals/Stores) que han cambiado en el diff del snapshot actual vs el anterior.

Regla clave:
- El motor no expone signals ni objetos reactivos propios.
- La interfaz consume una "proyección degradada" pero reactiva vía el Bridge.

---

## 3. Principios de Implementación

1. **Agnosticismo Total**: El motor de simulación no sabe que React existe. Podría correr en un servidor, en un worker o en una terminal.
2. **Reactividad por Bridge**: La granularidad reactiva vive en la capa de integración UI, no en el motor.
3. **Fidelidad Documental**: Cada fórmula en el código debe tener un puntero directo a su correspondiente en `docs-references/`.

---

## 4. Definición de Sistemas (Engine Modules)

- **Elemental System**: Lógica de colisión y combinación de tipos de daño.
- **Status Engine**: Simulación de proyecciones de DoT.
- **Combat Simulator**: Resolución de daño final contra un **Target**.
- **Ability System**: Escalado de poderes.
- **Time-Window Simulator (Timeline)**:
  - Sistema híbrido que proyecta el comportamiento del loadout en una ventana de tiempo (ej: 0s a 10s).
  - Genera una serie temporal de datos para visualizar gráficas de DPS sostenido, picos de daño y decaimiento de buffs.
  - Permite discutir el "Time-to-Kill" teórico contra enemigos simulados.
