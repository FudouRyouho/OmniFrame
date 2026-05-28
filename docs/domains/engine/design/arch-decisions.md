---
Estado: "referencia"
Rol: "Decisiones arquitectónicas críticas del motor de simulación v2 — Sim-v2"
Version: "v0.1.1"
Impacto_ID: "E-01-Decisions"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-05-27"
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
