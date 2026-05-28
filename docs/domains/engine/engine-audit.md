---
Estado: "referencia"
Rol: "Auditoría de alineación entre docs/domains/engine/design/ y la implementación real del motor"
Version: "v0.1.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-05-27"
Dependencias:
  - "docs/domains/engine/design/simulation-architecture.md"
  - "docs/domains/engine/design/simulation-contracts.md"
  - "docs/domains/engine/design/simulation-roadmap.md"
---

# Auditoría Fase 3 — Sim-v2: Diseño vs. Implementación

**Alcance**: Lectura completa de `Project/src/core/engine/` comparada contra los cuatro documentos de diseño.
**Método**: Lectura directa de código. No se ejecutaron tests.
**Fecha**: 2026-05-18

---

## 1. ✅ Implementado y Alineado

| Concepto diseñado | Implementación | Notas |
| :--- | :--- | :--- |
| Reactive Attribute Graph (Kahn's) | `SimulationEngine.rebuildGraph()` | Correcto. Kahn's BFS completo. |
| Fixed-Point fallback (3 pasos) | `SimulationEngine.resolve()` | Correcto. Pases 1, 2 y 3. Ver ⚠️ sobre convergencia. |
| Stat Accumulator v3 — fórmula maestra | `calculateCurrentValue()` | Fórmula idéntica a la diseñada. `AttributeNode` tiene los 6 buckets exactos. |
| Elemental System — Factor Order | `DamageCombiner.combine()` | Ordenamiento por índice de slot, consolidación de duplicados, combinación por pares. Fiel al diseño. |
| MutatorBridge — ruta única | `simulateFromIntention(EnsembleIntention)` | Ruta legacy `simulate(LoadoutState)` eliminada (2026-05-21). Una sola entrada canónica. |
| GameLaws centralizadas | `BASELINE_GAME_LAWS` en `contracts/index.ts` | SSoT para corrosive, viral, status stacks. |
| ~~SimulationAuditor (AI-Ready)~~ | ~~`audit/SimulationAuditor.ts`~~ | **ELIMINADO** — directorio `engine/audit/` purgado junto con `TraceObserver.ts`. Funcionalidad no migrada. |
| Hybrid Simulation (Atómico vs Bulk) | `CombatSimulator.simulateAttack()` | `HYBRID_THRESHOLD = 20` perdigones. Modo atómico bajo ≤20, EV bulk sobre 20. Alineado. |
| SimulationContext (flags, variables, active_profile_id, laws, target) | `contracts/index.ts` | Contrato materializado correctamente. |
| Falloff por distancia (Distance Bucket) | `CombatCalculator.project()` | `falloff_start`, `falloff_end`, `falloff_min_pct` operativos. |
| ProjectionSnapshot como POJO serializable | `SimulationEngine.getProjectionSnapshot()` | Existe y es serializable. Ver ⚠️ sobre riqueza de contenido. |
| TraceNode / AuditResponse | `AuditStep` + `AuditResponse` en `contracts/index.ts` | Mapeado correctamente. Naming ligeramente distinto (`AuditStep` ≈ diseño `TraceNode`). |
| Tipo de daño combo — ELEMENTAL_COMBINATIONS | `contracts/damage-logic.ts` | Las 6 combinaciones primarias están correctas. |

---

## 2. ⚠️ Implementado Parcialmente o con Desviación

### 2.1 Convergence Check — Missing

**Diseño** (`simulation-architecture.md §2.4`):
> "Convergence Check: Si el valor cambia menos del 0.01%, se considera resuelto."

**Implementación** (`SimulationEngine.resolve()`):
Los 3 pasos del Fixed-Point siempre se ejecutan incondicionalmente. No hay comparación de delta entre pasos. El ciclo tampoco emite el `STALE_LOOP_WARNING` documentado.

**Impacto**: Bajo en la mayoría de casos (3 pasos son suficientes), pero el comportamiento diagnóstico diseñado no existe.

---

### 2.2 ProjectionSnapshot — Riqueza insuficiente

**Diseño** (`simulation-contracts.md §5.5`):
Snapshot debe contener `ttk`, `effective_dps`, `status_weights` poblados, y para Timeline: Delta Events en lugar de snapshots completos.

**Implementación** (`SimulationEngine.getProjectionSnapshot()`):
```typescript
metrics: { status_weights: {} } // TODO: Implement status weighting logic
```
`ttk` y `effective_dps` están en `CombatMetrics` (de `CombatCalculator.project()`) pero no fluyen al `ProjectionSnapshot` oficial. El snapshot del motor está desconectado del combate.

**Impacto**: El `ProjectionSnapshot` actual no es consumible por la UI sin pasar por `CombatCalculator` manualmente. El "Selective UI Reactive Bridge" no puede operar sobre él.

---

### 2.3 Timeline — Flat Array vs. Delta Stream

**Diseño** (`simulation-contracts.md §5.5`):
> "Differential Timeline Stream: Initial Snapshot + Delta Events `{ tick, entityId, attributeId, newValue }`."

**Implementación** (`TimelineSimulator.simulateBurst()`):
Emite un array plano de `TimelineEvent[]`, donde cada evento es un snapshot completo en cada tick de 0.1s. No hay delta stream. Toda la carga de datos es inmediata.

**Impacto**: Aceptable para simulaciones cortas. En ventanas largas (>30s a 60fps), el array puede ser grande. La optimización de memoria diseñada no está presente.

---

### 2.4 Active Profile Switching — Solo en hidratación, no en runtime

**Diseño** (`simulation-contracts.md §5.4`):
> "El motor conmuta el puntero del `attack_profile_registry` al perfil seleccionado [via `active_profile_id` en el SimulationContext]."

**Implementación**: El `active_profile_id` se pasa al `SimulationContext`, pero en `StaticHydrator.createBaseEntity()` el perfil se selecciona en el momento de hidratación. Durante `SimulationEngine.resolve()`, el `active_profile_id` del contexto no se usa para conmutar perfiles — los atributos ya están fijos desde la hidratación.

**Impacto**: Cambiar entre modo base/incarnon requiere re-hidratar todo el ensemble desde cero, no solo un "switch de contexto". El flag de contexto existe pero no hace nada en runtime.

---

### 2.5 PE/TE Tagging — Warframe incorrectamente etiquetado como 'TE'

**Diseño**: PE = entidades que el usuario "posee" (Warframe, Armas, Compañero). TE = efímeras (proyectiles, procs).

**Implementación** (`StaticHydrator.createBaseEntity()`):
```typescript
persistence: dna.tags.includes('weapon') ? 'PE' : 'TE'
```
Los Warframes no llevan el tag `'weapon'`, por lo que quedan marcados como `'TE'`. En la práctica no hay código que diferencie PE de TE hoy, así que no hay impacto funcional inmediato.

---

### 2.6 Focus School — Hardcodeado

En `MutatorBridge.ensembleFromIntention()`:
```typescript
focus: { school_id: "zenurik", nodes: [] }
```
No conectado a ningún dato real.

---

## 3. ❌ Diseñado pero No Implementado

| Concepto | Archivo diseñado | Estado |
| :--- | :--- | :--- |
| ~~DNA Mutation Step~~ — **Archon Shards** | `simulation-architecture.md §Capa B` | **Implementado (2026-05-27)** — `StaticHydrator.hydrate()` consume `ensemble.warframe.shards` vía `ShardRepository`. Emite `Modifier` objects con `target_entity` correcta. OQ-ENGINE-4 cerrado. Helminth sigue sin implementar. |
| Casting Snapshot (ADN Dinámico) | `simulation-architecture.md §2.7` | No existe. El behavior `CAST` → snapshot parcial del padre → InjectedDNA en TE no está implementado. |
| Transient Entity Queue (Anti-recursión) | `simulation-architecture.md §Capa C` | Los procs (Slash, Heat, Toxin) son proyecciones matemáticas de `StatusEngine`, no TEs reales en una cola. No hay límite de profundidad ni energía de tick. |
| Logic Decorator Layers (6 capas) | `simulation-architecture.md §2.6` | No existen. El engine resuelve todos los modificadores en un solo bloque sin capas ordenadas (`INITIAL_OVERRIDE` → `FINAL_CLIP`). |
| AuditQuery con filtros | `simulation-contracts.md §6.2` | La interfaz `AuditQuery` (`filter: "all" \| "only_changes" \| "last_pass"`) no está implementada. `SimulationAuditor.getAudit()` devuelve siempre la traza completa. |
| Hit Location (Head / Body / Weakpoint) | `simulation-architecture.md §2.2` | No implementado en `CombatSimulator.resolveHit()`. No hay multiplicador por zona de impacto. |
| Companion channel | `simulation-contracts.md §Capa A` | No incluido en `MutatorBridge.ensembleFromIntention()` (la lógica que antes era `EnsembleAdapter` ya fue absorbida, ver OQ-STATE-4 cerrado 2026-05-19). |
| Double Dipping (TE → child TE) | `simulation-architecture.md §2.1` | No implementado. Los procs no re-aplican multiplicadores del padre. |

---

## 4. 🔧 Implementado Sin Especificación en Diseño

Piezas que existen en el código pero que no tienen contraparte en `docs/domains/engine/design/`.

### 4.1 WEAPON_DAMAGE como multiplicador global

> **⚠️ Actualizado 2026-05-27:** Arquitectura declarada DEFINITIVA en OQ-ENGINE-1. Base corregida de 100 a `damage_sum`. Ver notas inline.

`StaticHydrator` inyecta un nodo `WEAPON_DAMAGE` (base = `damage_sum` del perfil activo, calculado por `ItemRepository`) en toda entidad arma. En `calculateCurrentValue()`:

```typescript
const globalDmgMult = weaponDamageNode ? (weaponDamageNode.final / base) : 1.0;
// ...
if (attributeId.startsWith('damage_') && attributeId !== 'WEAPON_DAMAGE') {
  val *= globalDmgMult;
}
```

Serration (y similares) aplican como `ADD` al pool aditivo de `WEAPON_DAMAGE`, que escala todos los tipos de daño como multiplicador global. Implementa correctamente el stacking aditivo de Warframe: `Base × (1 + ΣSerration + ΣHeavyCal + ...)`. **Es la arquitectura canónica del juego — no un hack.** Documentada en `references/wiki/mechanics/calculating-bonuses.md §Stacking ADITIVO`. Validada en 33 tests gold standard (2026-05-27).

### 4.2 Infraestructura de datos no especificada

| Archivo | Rol real |
| :--- | :--- |
| `ItemRepository.ts` | Carga JSONs desde `public/data/` (warframes, weapons, mods, overrides). In-memory Map. Calcula `damage_sum` del perfil activo. |
| `ModRepository.ts` | Resuelve `upgrade_type` strings del JSON a `{ attr, op }` del engine vía `UPGRADE_MAP` / `resolveToken()`. Label parsing eliminado — OQ-ENGINE-3 cerrado (2026-05-27). |
| `ShardRepository.ts` | Resuelve Archon Shards: tipo + stat + isTau → `Modifier` con `target_entity`. |
| `IncarnonRepository.ts` | Resuelve perks Incarnon Genesis: `evolution_perks` → `Modifier[]` vía `UPGRADE_MAP`. Añadido 2026-05-27. |
| `DnaRepository.ts` | DNA base de items. |
| `EnemyRepository.ts` | Repositorio de perfiles de enemigos escalados por nivel. |
| `EnemyState.ts` | Máquina de estado del enemigo: escudos, salud, armadura, stacks de DoT, lógica de corrosión. |
| `RngProvider.ts` | Abstracción de RNG inyectable para testabilidad. |
| ~~`DatasetSeeder.ts`~~ | **ELIMINADO** — D-9 (2026-05-19). Datos de prueba = pipeline real. |
| ~~`TraceObserver.ts`~~ | **ELIMINADO** — directorio `audit/` purgado. |

### 4.3 ~~Elemental damage via label parsing~~ — RESUELTO (2026-05-27)

> **OQ-ENGINE-3 CERRADO.** `ModRepository` v2 consume `upgrade_type` directamente vía `isUpgrade()` + `UPGRADE_MAP` / `resolveToken()`. No hay label parsing. El tipo elemental ya está declarado en el token D-6 (ej. `WEAPON_ADD_TOXIN_DAMAGE`). El campo `stat.label` existe en el override como texto descriptivo pero no se procesa.

### 4.4 All-operations siempre ADD

`ModRepository` produce todos los modificadores con `operation: "ADD"` por defecto, independientemente del tipo de stat. Mods multiplicativos (como Faction damage) requieren `operation: "MULTIPLICATIVE"` pero reciben `"ADD"` si no hay un registro manual explícito.

---

## 5. Open Questions generadas por esta auditoría

| ID | Pregunta | Impacto |
| :--- | :--- | :--- |
| **OQ-ENGINE-1** | ¿El patrón `WEAPON_DAMAGE` como multiplicador global es la arquitectura definitiva? | Alto | ✅ **CERRADO (2026-05-27)** — Arquitectura definitiva. Base = `damage_sum`. 33 tests gold standard. |
| **OQ-ENGINE-2** | Profile switching (Incarnon/Alt-fire): re-hidratar vs. conmutar en `resolve()`. | Medio | **ABIERTO** |
| **OQ-ENGINE-3** | ¿El label-parsing en `ModRepository` es aceptable o se migra a token explícito? | Medio | ✅ **CERRADO (2026-05-27)** — Token D-6 explícito en override. Label parsing eliminado. |
| **OQ-ENGINE-4** | ¿En qué Fase se implementa la DNA Mutation (Archon Shards, Helminth)? | Alto | ✅ **CERRADO (2026-05-27)** — Archon Shards implementados en `StaticHydrator`. Helminth defer. |

Estas preguntas se registran en `docs/governance/open-questions.md`.

---

## 6. Veredicto General

El motor tiene un núcleo funcional sólido:
- El grafo reactivo está bien implementado.
- La fórmula del Stat Accumulator es fiel al diseño.
- El Elemental System (DamageCombiner) es la pieza más completa y alineada.
- El sistema de auditoría (SimulationAuditor) supera la especificación original.

Las brechas más grandes son de **completitud**, no de corrección:
- La Capa B (hidratación mutante) está a medias — los shards y Helminth no mutan nada.
- El `ProjectionSnapshot` no fluye los datos de combate correctamente.
- El sistema de capas decoradoras (Logic Decorator Layers) no existe — los caps, floors y overrides no tienen orden garantizado.

Las brechas de **diseño sin código** (Casting Snapshot, TE Queue, Hit Location) son features de Fase 8+ y no bloquean el trabajo actual de Fase 6.
