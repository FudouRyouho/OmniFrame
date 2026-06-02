---
Estado: "activo"
Rol: "Hoja de ruta para la implementación del motor v2"
Version: "v0.2.1"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-05-27"
---

# 🗺️ Roadmap: Reconstrucción del Motor de Simulación (Sim-v2)

Este documento define la ruta crítica para sustituir el sistema de Loadout/Resolver actual por el nuevo **Motor de Simulación Reactiva**.

---

## Fases 1–5 ✅ (completadas al 2026-05-27)

Contratos cerrados, grafo reactivo implementado (`SimulationEngine` + Kahn's), pipeline de hidratación completo (`StaticHydrator`, `ModRepository`, repositorios). Path legacy (`LoadoutProvider`, `SimulationLab`, `EnsembleAdapter`) purgado.

---

## Fase 6: Integración Arsenal (Muerte del Stub) 🚀
*Prioridad actual: Estabilizar la conexión de datos y la reactividad de la UI.*

- [x] **Arquitectura de Manifiesto Plano**: Adopción de `Record<Uid, Intent>` con Uids Semánticos.
- [x] **MutatorBridge Refactor**: `EnsembleAdapter` eliminado (OQ-STATE-4, 2026-05-19) — lógica absorbida por `MutatorBridge`.
- [x] **Data Hydration Engine**: `StaticHydrator` + `ModRepository` + `ShardRepository` + `IncarnonRepository` + `ItemRepository` (2026-05-27).
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
