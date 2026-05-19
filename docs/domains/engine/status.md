---
Estado: "activo"
Rol: "Estado operativo del motor de cálculo sim-v2"
Version: "v0.1.0"
Impacto_ID: "E-Status"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-18"
---

# Engine Status

> **Audit fecha:** 2026-05-18 — Reescrito con estado físico real.

---

## Estado de sim-v2 (implementación actual)

| Componente | Ruta | Estado |
|---|---|---|
| `SimulationEngine` | `sim-v2/logic/SimulationEngine.ts` | **Activo** — grafo de atributos con topological sort + fixed-point fallback |
| `MutatorBridge` | `sim-v2/logic/MutatorBridge.ts` | **Activo** — orquesta la simulación completa desde EnsembleIntention; absorbe la lógica del eliminado `EnsembleAdapter` |
| `CombatCalculator` | `sim-v2/logic/CombatCalculator.ts` | **Activo** |
| `DamageCombiner` | `sim-v2/logic/DamageCombiner.ts` | **Activo** |
| `StatusEngine` | `sim-v2/logic/StatusEngine.ts` | **Activo** |
| `TimelineSimulator` | `sim-v2/logic/TimelineSimulator.ts` | **Activo** |
| `StaticHydrator` | `sim-v2/logic/StaticHydrator.ts` | **Activo** — carga datos de items en el motor |
| `DnaRepository` | `sim-v2/logic/DnaRepository.ts` | **Activo** |
| Contratos | `sim-v2/contracts/` | **Cerrados** — attributes, damage-logic, damage-multipliers, mod-overrides |
| Tests | `sim-v2/__tests__/` | **Activos** — 12 suites |
| `useSimulation` | `sim-v2/hooks/useSimulation.ts` | **Activo** — hook React que conecta EnsembleStore → MutatorBridge → UI |

## Fórmulas matemáticas (`core/engine/formulas/`)

Las fórmulas son la pieza más estable del sistema. Están organizadas por dominio:

| Carpeta | Cubre |
|---|---|
| `formulas/common/` | `scaling-base`, `crit-base`, `status-base` — primitivas compartidas |
| `formulas/weapon/` | weapon-core, weapon-crit, weapon-status, weapon-multishot, weapon-condition-overload |
| `formulas/warframe/` | warframe-core |
| `formulas/ability/` | ability-crit, ability-status |
| `formulas/arcane/` | arcane-core |

Ver [`formula-overview.md`](formula-overview.md) para la especificación matemática.

## Lo que NO existe (eliminado)

- `resolver.ts` — eliminado. Su rol fue absorbido por `MutatorBridge` + `SimulationEngine`.
- Arquitectura B1-B4 — deprecated. Ver `docs-archive/historical/engine-integrity-gaps.md` para el diagnóstico histórico.

## Auditoría Fase 3 — completada (2026-05-18)

La auditoría de alineación diseño vs. implementación está completa. Ver:
- [`sim-v2-audit.md`](sim-v2-audit.md) — qué coincide, qué diverge, qué no se implementó.
- [`transition-residues.md`](transition-residues.md) — inventario de código zombie, stubs y deuda técnica catalogada.

Ver `docs/governance/open-questions.md` para OQ-STATE-1..4 (capa de integración) y OQ-ENGINE-1..4 (motor).

## Contratos del motor

- [`attribute-node-contract.md`](attribute-node-contract.md) — Qué modela cada campo de `AttributeNode`, su capa en la fórmula de Warframe y la operación de modificador que lo alimenta. Base empírica en `references/wiki/mechanics/`.