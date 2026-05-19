---
Estado: "en ejecucion"
Rol: "Hoja de ruta para la implementación del motor v2"
Version: "v0.2.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-04-21"
---

# 🗺️ Roadmap: Reconstrucción del Motor de Simulación (Sim-v2)

Este documento define la ruta crítica para sustituir el sistema de Loadout/Resolver actual por el nuevo **Motor de Simulación Reactiva**.

---

## Fase 1: Limpieza y Oficialización ✅
- [x] **Deprecación de Documentación Antigua**: Marcado de documentos obsoletos en `docs/domains/engine/`.
- [x] **Migración de Contratos**: Movimiento de `docs-temp/` a `docs/design/sim-v2/`.
- [x] **Cierre de Debate**: Congelación de contratos de `Ensemble`, `Entity` y `Attribute`.

## Fase 2: Cierre de Contratos Bloqueantes ✅
- [x] **Separar salidas oficiales**: Snapshot, Timeline y Audit Artifact.
- [x] **Cerrar ontología canónica**: Definición de `Weapon`, `AttackProfile`, etc.
- [x] **Congelar Game Laws SSoT**: Centralización en `BASELINE_GAME_LAWS`.

## Fase 3: Implementación Núcleo Headless ✅
- [x] **Alinear contratos físicos**: `contracts/index.ts` materializado.
- [x] **EnsembleAdapter (Bridge de Compatibilidad)**: Traductor inicial operativo.
- [x] **Reactive Attribute Graph**: Implementación de Kahn's Algorithm.

## Fase 4: Observabilidad Orientada a Agentes ✅
- [x] **SimulationAuditor aislado**: Trazas de auditoría sin contaminación.
- [x] **Rastreo de Causalidad**: Evaluación de condiciones operativa.
- [x] **Diff Diagnostics**: Sistema de comparación diferencial.

## Fase 5: Integración en Laboratorio ✅
- [x] **Lab Bridge Development**: Hook `useSimulation` integrado.
- [x] **Visualizador de Auditoría**: Panel dinámico en `SimulationLab`.

---

## Fase 6: Integración Arsenal (Muerte del Stub) 🚀
*Prioridad actual: Estabilizar la conexión de datos y la reactividad de la UI.*

- [x] **Arquitectura de Manifiesto Plano**: Adopción de `Record<Uid, Intent>` con Uids Semánticos.
- [ ] **MutatorBridge Refactor**: Actualizar el `EnsembleAdapter` para reconstruir la jerarquía desde el Record plano.
- [ ] **Data Hydration Engine**: Motor de carga de JSONs para convertir `Intents` en `Entities`.
- [ ] **Gobernanza de Datos (Engine-Only)**: Centralizar `slot-rules.json` y `attribute-registry.json` en `public/data/engine/`.
- [ ] **Reactive Selection Selectors**: Hooks de suscripción granular para optimizar re-renders en el Arsenal.
- [ ] **Validation UI Feedback**: Predicados de compatibilidad (`isExilus`, `compatName`) integrados en la UI.
- [ ] **SimulationContext Runtime**: Manejo de flags efímeros (Modo Incarnon, Toggles) fuera del estado inmutable.

## Fase 7: Observabilidad Arsenal (Réplica Warframe) 👁️
- [ ] **Debate Técnico: Umbral de Visibilidad**: Contextos de activación de auditoría.
- [x] **Snapshot Logic (Fixed-Point)**: Resolución de ciclos mediante 5 iteraciones (Implementado en Core, pendiente ajuste de pasos).
- [ ] **Auditoría No Intrusiva**: Integración en `CustomPopover`.

## Fase 8: Física de Armas y Refinamiento (En pausa) 🛠️
- [ ] **Lógica de Beams (Continuous)**: Tick-rate y rampa.
- [ ] **Multidisparo y Falloff**: Diferenciación física de proyectiles.
- [ ] **Distribución de Procs**: Lógica de Pesos de Estado (Status Weights).

## Fase 9: Expansión y Ecosistema (Debate Abierto) 🌐
- [ ] **External Buff Injection**: Inyección de Focus Schools, Squad Buffs y Arcanos de Operador.
- [ ] **Prototipo de Behavior Overrides**: Sustitución dinámica de comportamientos (Helminth/Augments).

---

## 🛡️ Auditoría de Riesgos
1. **Riesgo de Modelo Mezclado**: Resuelto mediante la separación de Snapshot y Auditoría.
2. **Riesgo de Ontología Incompleta**: Mitigado por el registro de ADN jerárquico.
3. **Riesgo de Deriva Física**: Es el foco de la Fase 8.
4. **Riesgo de Contexto Inflado**: Mitigado por el Selective Trace del Auditor.
