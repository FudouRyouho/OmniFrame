---
Estado: "ratificado"
Rol: "Contratos técnicos base del motor de simulación v2"
Version: "v0.1.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-04-21"
Dependencias:
  - "docs/design/sim-v2/simulation-architecture.md"
Dependidos:
  - "docs/design/sim-v2/simulation-roadmap.md"
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
      helminth: { abilityId?: string, slot?: number, invigoration?: boolean }
    },
    weapons: {
      primary: WeaponIntent,
      secondary: WeaponIntent,
      melee: WeaponIntent
    },
    focus: { schoolId: string, nodes: string[] },
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
- **Identity**: `uniqueName` (SSoT del juego).
- **ADN (Base Data)**: Valores inmutables. Las armas incluyen un `AttackProfileRegistry`.
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
  - `baseFlat`: Suma fija a la base (ej: +900 Armor).
  - `baseAddPct`: Escala de la base previa a mods.
  - `modsAddPct`: Acumulador de mods (ej: +165%).
  - `totalFlat`: Suma fija final.
  - `multiplicative`: Producto de multiplicadores.
- **Fórmula de Resolución**: `((base + baseFlat) * (1 + baseAddPct/100) * (1 + modsAddPct/100) + totalFlat) * multiplicative`.

### 5.3 El Modificador (Modifier)
La instrucción que altera un Atributo.
- **Source**: Entidad que lo origina (ej: Mod `Serration`).
- **Target**: Atributo al que afecta (ej: `WEAPON_DAMAGE`).
- **Operation**: `ADD` | `MUL` | `SET` | **`CONTEXT_SCALE`**.
- **Context Link**: (Para `CONTEXT_SCALE`) Clave del contexto a consultar (ej: `target.uniqueStatusCount`) y multiplicador base.
- **Condition**: (Opcional) Contexto bajo el cual se activa.

### 5.4 El Contexto de Simulación (Simulation Context)
Es el entorno efímero inyectado en cada corrida de simulación.
- **Active Profile Selection (Incarnon/Alt-Fire)**:
  - **Naturaleza**: Switch de contexto, no de intención.
  - **Mecánica**: El `Simulation Context` incluye un `activeProfileId` (ej: "incarnon", "alt-fire").
  - **Efecto**: El motor conmuta el puntero del `AttackProfileRegistry` al perfil seleccionado. Si el perfil altera stats base (como ocurre en Incarnon), el motor re-calcula el grafo usando la variante de ADN correspondiente.
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
- **Diagnostics & Debug Layer**:
  - **Naturaleza**: Capa de introspección del motor ("Qué entra -> Qué sale").
  - **Campos de Diagnóstico**:
    - `resolvedOrder`: El orden topológico final en que se resolvieron los atributos.
    - `sourceTrace`: Para cada atributo, un mapa de qué entidad inyectó qué modificador y en qué bucket.
    - `mutationAudit`: Comparativa entre `BaseDNA` y `MutatedDNA` para verificar Shards/Helminth.
    - `cycleAlerts`: Notificaciones de bucles detectados y resueltos por Fixed-Point.
  - **Justificación**: Crucial para evitar la "Caja Negra". Permite al desarrollador (y al usuario avanzado) entender por qué un stat tiene el valor que tiene.

---

## 6. Diagnóstico Detallado (The Traceability Contract)

Cada atributo en la proyección puede opcionalmente incluir un `TraceNode`:

```typescript
interface TraceNode {
  attributeId: string;
  finalValue: number;
  steps: {
    source: string; // "Mod:Serration", "Arcane:Fury", "DNA:Base"
    bucket: "base" | "baseFlat" | "baseAddPct" | "modsAddPct" | "totalFlat" | "multiplicative";
    value: number;
    op: "ADD" | "MUL" | "SET";
  }[];
}
```
