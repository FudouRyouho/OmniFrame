---
Estado: "referencia"
Rol: "Hoja de ruta para la implementación del motor v2"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-07-24"
---

# 🗺️ Roadmap: Reconstrucción del Motor de Simulación (Sim-v2)

Este documento define la ruta crítica para sustituir el sistema de Loadout/Resolver actual por el nuevo **Motor de Simulación Reactiva**.

> **⚠️ Predata la reestructura de `@core` y la campaña de saneamiento A+B+C.** Las Fases 1–5 están hechas; las 6–9 son **direccionales** y varios ítems evolucionaron o se reorganizaron desde entonces (p. ej. `attribute-registry` se reescribió en D-7 Fase 4; el puerto de datos "0" y `BrowserAdapter` cubren parte de la "Gobernanza de Datos"). Para el **progreso real** ver [`../status.md`](../status.md) y `governance/current-state.md`; este roadmap conserva la **intención de ruta**, no el estado línea-por-línea.

---

## Fases 1–5 ✅ (completadas)

Contratos cerrados, grafo reactivo implementado (`SimulationEngine` + Kahn's), pipeline de hidratación completo (`StaticHydrator`, `ModRepository`, repositorios). Path legacy (`LoadoutProvider`, `SimulationLab`, `EnsembleAdapter`) purgado.

---

## Fase 6: Integración Arsenal (Muerte del Stub) 🚀
*Prioridad actual: Estabilizar la conexión de datos y la reactividad de la UI.*

- [x] **Arquitectura de Manifiesto Plano**: Adopción de `Record<Uid, Intent>` con Uids Semánticos.
- [x] **MutatorBridge Refactor**: `EnsembleAdapter` eliminado (OQ-STATE-4) — lógica absorbida por `MutatorBridge`.
- [x] **Data Hydration Engine**: `StaticHydrator` + `ModRepository` + `ShardRepository` + `IncarnonRepository` + `ItemRepository`.
- [~] **Gobernanza de Datos (Engine-Only)**: descartada. `attribute-registry` es un tipo TS (D-7 Fase 4), no un JSON; no existen `public/data/engine/{attribute-registry,slot-rules}.json` — eran fósiles de v1 sin consumidor.
- [ ] **Reactive Selection Selectors**: Hooks de suscripción granular para optimizar re-renders en el Arsenal.
- [ ] **Validation UI Feedback**: Predicados de compatibilidad (`isExilus`, `compatName`) integrados en la UI.
- [ ] **SimulationContext Runtime**: Manejo de flags efímeros (Modo Incarnon, Toggles) fuera del estado inmutable.

## Fase 7: Observabilidad Arsenal (Réplica Warframe) 👁️
- [ ] **Debate Técnico: Umbral de Visibilidad**: Contextos de activación de auditoría.
- [x] **Snapshot Logic (Fixed-Point)**: Resolución de ciclos mediante **3 iteraciones** (implementado en Core; el Convergence Check por delta sigue sin implementar — ver `simulation-architecture.md §2.4`).
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
