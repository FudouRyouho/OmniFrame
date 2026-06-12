---
Estado: "referencia"
Rol: "Decisiones arquitectónicas críticas del motor de simulación v2 — Sim-v2"
Version: "v0.2.1"
Impacto_ID: "E-01-Decisions"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-06-12"
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
- `consume()` = acceso a la salida resuelta de C (`ProjectionSnapshot`). Vive en `@core`. Lo consumen **scripts y tests (no-dominios)** directamente.
- **Capa D** = consumo derivado (`ViewModelContract` + su mapping). Vive **fuera** de `@core` y cruza por `@shared`. (`useSimulation` en `@core/engine/hooks` es D reactiva *parcial* co-ubicada en `@core` — drift a reubicar cuando D se materialice.)

**Consecuencia:** el CLI y la futura UI son **adaptadores hermanos** (Ports & Adapters) sobre el mismo puerto `consume()`: el CLI es la instancia **no-reactiva** (lee la salida de C directo, por ser script), la UI la **reactiva** (cruza por `@shared`). El módulo **no** se nombra `api/` (arrastra la connotación del diseño WebSocket muerto) ni `projection/` (projection = D, fuera de `@core`).

---

## 7. Frontera de dominios: `@core` no importable por dominios

**Decisión:** Los dominios (`domains/*`) **no importan `@core`**. Reafirma la Restricción 1 de `Project/CLAUDE.md` (lista permitida: `@shared`, `@lib`, `./internal` — `@core` excluido). `@core` es el dominio de lógica fuera de UI/consumo-derivado (capas **A, B, C**); el alias es solo empaquetado (podría ser `engine`).

**Consecuencia:**
- La UI cruza al motor **solo por `@shared`** (inversión de dependencias): la salida vía `ViewModelContract`, y por **simetría** la entrada (intención) también debe cruzar por `@shared` ↔ `EnsembleStore` (A) en `@core`.
- `domains/arsenal/view/UpgradeView.tsx` importando `@core/engine/hooks/useSimulation` es una **violación/drift** (stub conectado antes de existir D y antes de los tests), no un patrón válido.
- **`@providers` (capa de composición / adapter) SÍ importa `@core`** — ruling 2026-06-12. `@providers` **no es un dominio de feature**; esta frontera y la Restricción 1 aplican a `domains/*`, no a la capa que compone adapters. `EnsembleProvider → @core/intention/ensemble-store` es válido (adapter→core, dirección correcta de Ports&Adapters). Ver `closed-decisions.md` DC-OQ-ENGINE-9.
- `ViewModelContract` debe ser **consumer-shaped** (un ViewModel de MVVM, alimentado por `lib/*` como ingredientes), nunca *producer-laundered* (la salida cruda re-exportada por `@shared` solo para legalizar el import).

**Estado:** `C→D→UI` es **prototipo en revisión**. `A→B→C` es coherente. La **simetría de entrada quedó realizada (2026-06-12)**: `ensemble.types` → `@shared/types/ensemble.ts`, `ensembleStore` (A1) → `@core/intention/`; `@core` reestructurado (Stage 0+1, DC-OQ-ENGINE-9). Ver `OQ-ENGINE-FUTURE`/`OQ-ENGINE-9` en [`../../../governance/open-questions.md`](../../../governance/open-questions.md).
