---
Estado: "referencia"
Rol: "Contratos técnicos base del motor de simulación v2"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-07-29"
Dependencias:
  - "docs/domains/engine/design/simulation-architecture.md"
Dependidos:
  - "docs/domains/engine/design/simulation-roadmap.md"
---

# OmniFrame Simulation Contracts

Este documento fija las definiciones conceptuales mínimas para `Entity`, `Attribute`, `Modifier`, `Simulation Context` y `Projection Snapshot`.

### Capa A: Intención (The Ensemble Store)
- **Naturaleza**: Estado mutable del usuario que define el "Sistema de Sistemas".
- **Responsabilidad**: Almacena los punteros de configuración de toda la build.
- **Contrato (Ensemble)**:
  ```typescript
  {
    warframe: {
      id: string,
      rank: number,
      slots: Record<number, Slot>, // Posicional (0-7 + Exilus + Aura)
      shards: ArchonShard[],       // Mutaciones de ADN
      helminth: { ability_id?: string, slot?: number, invigoration?: boolean }
    },
    weapons: {
      primary: WeaponIntent,
      secondary: WeaponIntent,
      melee: WeaponIntent
    },
    focus: { school_id: string, nodes: string[] },
    companion: { id: string, slots: Record<number, Slot> },
    operator: { arcanes: string[] }
  }
  ```
- **Regla de Oro**: El campo `slots` es **estrictamente posicional**. El motor de la Capa C procesa los slots en orden (0 -> N) para determinar la jerarquía de combinación elemental.

---

## 5. Contratos Base: Definición de Entidad y Modificador

Para que el motor sea determinista, definimos las interfaces conceptuales que rigen la simulación.

### 5.1 La Entidad (Simulation Entity)

#### ADN Mutado (Layer B Output)
El ADN que recibe la Capa C no es el "Raw" del dataset. Es un **ADN Mutado** por la Capa B:
1. **Fetch**: Obtiene `BaseDNA` de `weapons.json`.
2. **Mutate**: Inyecta `Archon Shards`, `Helminth Invigorations` o `Weapon Augments` permanentes directamente en los valores `base`.
3. **Emit**: Entrega el `MutatedDNA` a la Capa C. Para el motor, el Warframe *ya nació* con 500 de armadura, sin saber que 200 vienen de una mutación.

Es la unidad mínima de identidad persistente o efímera en el motor.
- **Identity**: `unique_name` (SSoT del juego).
- **ADN (Base Data)**: Valores inmutables. Las armas incluyen un `attack_profile_registry`.
- **Registry**: Mapa de **Atributos** que la entidad posee.
- **Behaviors**: Lista de lógicas asociadas.

#### ¿Qué es una Entidad? (Ejemplos)
- **Powersuit (Warframe)**: La entidad raíz.
- **Weapon (PE)**: Entidades de combate con perfiles de ataque.
- **Exalted Weapon (PE anidada)**: Entidad con mods propios cuya activación depende de un behavior de habilidad.
- **Mod / Arcane / Shard**: Entidades que se acoplan para inyectar modificadores.
- **Ability**: Sub-entidad de un Powersuit que posee su propio escalado.

#### ¿Qué NO es una Entidad?
- **Buffs (ej: Roar)**: Son *efectos* o *modificadores* temporales generados por el comportamiento de una entidad. No tienen ADN persistente.
- **Status Effects (ej: Slash)**: Son resultados de la simulación de combate.
- **Damage Types**: Son metadatos/enums utilizados en el cálculo.

### 5.2 El Atributo (Simulation Attribute v3)
Un nodo en el grafo que gestiona su propio valor acumulado mediante buckets segregados.
- **Schema**:
  - `base`: Valor inicial (ADN).
  - `base_flat`: Suma fija a la base (ej: +900 Armor).
  - `mods_add_pct`: Acumulador de mods (ej: +165%).
  - `total_flat`: Suma fija final.
  - `multiplicative`: Producto de multiplicadores.
- **Fórmula de Resolución**: `((base + base_flat) * (1 + mods_add_pct/100) + total_flat) * multiplicative`.

### 5.3 El Modificador (Modifier)
La instrucción que altera un Atributo.
- **Source**: Entidad que lo origina (ej: Mod `Serration`).
- **Target**: Atributo al que afecta (ej: `WEAPON_ADD_DAMAGE`).
- **Operation**: discriminante de la union. **Acumulador** (`value` ES el efecto, la op ES el bucket): `ADD` | `ADD_FLAT` | `BASE_FLAT` | `MULTIPLICATIVE`. **Familia** (el efecto lo computa una fórmula desde el contexto, cada una con sus factores): `CONDITION_OVERLOAD` | `MELEE_COMBO_MULT` | `SNIPER_COMBO_MULT` | `COMBO_SCALED_ADD` | `STACK_DECAY_BUFF`.
- **co_factors**: (Solo `CONDITION_OVERLOAD`) nombres de las dos dimensiones de contexto (`stacks_var`, `status_count_var`). El valor lo calcula `coBonusPct`; el bucket lo decide el `co_behavior` del ataque. Ver `arch-decisions.md §9`.
- **Condition**: (Opcional) Contexto bajo el cual se activa.

### 5.4 El Contexto de Simulación (Simulation Context)
Es el entorno efímero inyectado en cada corrida de simulación.
- **Active Profile Selection (Incarnon/Alt-Fire)**:
  - **Naturaleza**: Switch de contexto, no de intención.
  - **Mecánica**: El `Simulation Context` incluye un `active_profile_id` (ej: "incarnon", "alt-fire").
  - **Efecto**: El motor conmuta el puntero del `attack_profile_registry` al perfil seleccionado. Si el perfil altera stats base (como ocurre en Incarnon), el motor re-calcula el grafo usando la variante de ADN correspondiente.
  - **Justificación**: Cambiar a modo Incarnon en la UI debe ser instantáneo (Contexto). Si fuera Intención, dispararía una re-hidratación completa innecesaria.
- **Persistent Timeline Snapshots**: En el Timeline Simulator, el contexto no se destruye. El motor utiliza una función reductora `f(Context_T, Delta) -> Context_T+1` para simular el paso del tiempo con memoria de procs y estados previos.
- **Target Context (The Enemy Profile)**:
  - **ADN Base**: `Health Type`, `Armor Type`, `Armor Value`, `Faction`.
  - **Law Registry**: Mapa de excepciones de inmunidad y caps de estado específicos (ej: Boss caps).
  - **Dynamic State**: `In_Magnetize_Bubble`, `Stripped_Armor`, etc.
- **Global Buffs & Uptime Presets**:
  - `Auras`: Buffs externos al loadout.
  - `Trigger Presets`: `On_Headshot`, `On_Kill`, `While_Aiming`.
  - `Uptime Mode`: `Base` | `Ramping` | `Maxed`.
- **Combat & Environment State**:
  - `Distance Bucket`: `0-10m`, `10-20m`, etc.
  - `Hit Location`: `Head`, `Body`, `Weakpoint`.

### 5.5 La Proyección (Projection Snapshot)

> **⚠️ Diseño mayormente NO implementado.** El tipo `ProjectionSnapshot` fue **purgado** (sin productor/consumidor). Hoy la salida cruda de C es `consume().snapshot(): SimulationEntity[]` (valores `final` + buckets por nodo); las métricas de combate fluyen al contrato único ya cristalizado `CombatMetrics` (`output/combat-metrics.ts`, particionado `target_agnostic`/`vs_target` — `DC-OQ-ENGINE-8`). El **Differential Timeline Stream**, las **Area Metrics** y la **capa de Diagnostics rica** de abajo son **diseño futuro**, no código actual. El modelo de daño/status de C2 se aterrizó en [`damage-status-model.md`](damage-status-model.md).

El reporte final serializable generado tras el `Resolve`. Es lo que la UI consume para pintar.

- **Differential Timeline Stream (Memory Optimized)**:
  Para evitar la explosión de memoria en simulaciones temporales (Timeline), el motor no emite snapshots completos por cada tick.
  1. **Initial Snapshot**: Estado completo en `T=0`.
  2. **Delta Events**: Una lista de cambios `{ tick, entityId, attributeId, newValue }`.
  3. **UI Bridge Responsibility**: Reconstruir el estado actual aplicando los deltas sobre el `Initial Snapshot`.

- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si el usuario mueve un slider de tiempo?* El Bridge busca el snapshot más cercano y aplica deltas hasta ese punto. Si el timeline es largo, el motor puede emitir "Keyframes" (snapshots completos cada 50 ticks) para acelerar el salto temporal.
- **Entity Stats**: Valor `final` de todos los atributos de cada entidad activa.
- **Combat & Simulation Metrics**:
  - **Damage Weighting**: Jerarquía de pesos de cada tipo de daño para pesos de Proc.
  - **Probability Management**: Promedio (EV) y Desglose por Tiers de Crítico.
  - **Stability & Resource Ratio**: Ratio de Recuperación vs Consumo de Energía/Munición.
  - **Time-to-Kill (TTK)**: Daño efectivo proyectado contra el `Target Profile`.
  - **Area Metrics (AoE Potential)**: Simulación paralela contra un "Escenario Multiobjetivo Estándar" (ej: horda de 5 enemigos con falloff) para mostrar el potencial de daño masivo.
- **Diagnostics & Debug Layer (AI-Ready Observability)**:
  - **Naturaleza**: Capa de introspección aislada ("Flight Recorder"). Diseñada para proporcionar una ventana de contexto mínima a agentes de IA y desarrolladores.
  - **Funcionalidad Principal: Causalidad Selectiva**:
    Permite solicitar la traza de un solo atributo para evitar el ruido de un snapshot completo.
  - **Campos de Diagnóstico**:
    - `resolved_order`: El orden topológico final.
    - `source_trace`: Mapa de causalidad (qué inyectó qué).
    - `audit_session`: Registro de cambios por cada paso del Fixed-Point Iteration.
    - `cycle_alerts`: Notificaciones de bucles resueltos.
  - **Justificación**: Crucial para la depuración autónoma. Permite a un agente de IA auditar la lógica de un stat específico sin procesar todo el estado de la simulación.

---

## 6. Diagnóstico Detallado (The Traceability Contract)

> **⚠️ Renombrado + parcialmente implementado:** los tipos `AuditStep`/`AuditResponse`/`audit_session` se renombraron a **`TraceStep`/`TraceResponse`/`trace_log`** (Fase 3 saneamiento — "trace" describe *qué es*, no *quién lo consume*). El trace es **opt-in** (`enableTrace()`/`getTrace()`), no siempre-on. El `AuditQuery` con `filter` (§6.2) **no está implementado** — `getTrace()` devuelve la traza completa. Los nombres de abajo son el diseño original; el código usa `Trace*`.

Cada atributo en la proyección puede opcionalmente incluir un `TraceNode` o ser consultado vía una `AuditSession`:

### 6.1 TraceNode (Static View)
```typescript
interface TraceNode {
  attribute_id: string;
  final_value: number;
  steps: {
    source: string; // "Mod:Serration", "Arcane:Fury", "DNA:Base"
    bucket: "base" | "base_flat" | "mods_add_pct" | "total_flat" | "multiplicative";
    value: number;
    op: "ADD" | "MUL";
  }[];
}
```

### 6.2 AuditSession (Agent-Oriented Dynamic View)
Contrato para consultas de "ventana mínima" diseñadas para agentes de IA:
```typescript
interface AuditQuery {
  target: { entity_id: string, attribute_id: string };
  filter: "all" | "only_changes" | "last_pass";
}

interface AuditResponse {
  query: AuditQuery;
  causality: {
    pass: number; // 1, 2 o 3 (Fixed-Point)
    modifier_source: string;
    operation: string;
    impact: number; // Delta aplicado
    resulting_value: number;
    condition_status?: {
      raw: string;      // "on_headshot"
      evaluated: boolean; // false
      reason?: string;    // "Context.flags.headshot is undefined"
    };
    context_source?: {
      variable: string; // "unique_status_count"
      value: number;   // 3
    };
  }[];
}
```

### 6.3 La Trinidad del Arsenal (Contextos de Uso)
El motor debe ser agnóstico a la UI. `EnsembleAdapter` eliminado (OQ-STATE-4) — lógica absorbida por `MutatorBridge`. Los tres flujos que debe garantizar `MutatorBridge`:
1. **Arsenal (Equipado)**: Sincronización bidireccional con el estado persistente del usuario.
2. **Swap (Intercambio)**: Proyección efímera comparativa (Ensemble Actual vs Ensemble con Cambio).
3. **Upgrade (Builder/Overframe)**: Manipulación total de slots y variables de contexto para optimización.
