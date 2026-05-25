---
Estado: "referencia"
Rol: "Auditoría de integración del motor de simulación con el Arsenal"
Version: "v0.0.4"
Impacto_ID: "E-05"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-05-19"
---

# Auditoría de Panorama y Mapeo de Dependencias (Sim-v2 vs Arsenal)


Este documento registra el estado técnico y las brechas detectadas durante la fase de integración del motor de simulación v2 en el ecosistema del Arsenal de OmniFrame.

## 1. Brecha de Contratos (Data Drift)

| Capa | Estado Actual | Limitación para Integración |
| :--- | :--- | :--- |
| **Engine (EnsembleIntention)** | Estructura de intención tipada: mods, shards, incarnon. | Incarnon y Helminth sin lógica de impacto matemático implementada. |
| **UI (ArsenalMetadataState)** | Rico en metadata visual. Posee catálogos de Shards y Evoluciones Mock. | Los datos son puramente descriptivos (`label`, `description`). No emiten modificadores matemáticos procesables por el motor. |
| **Bridge (MutatorBridge)** | Activo — traduce `EnsembleIntention` → contratos del engine. Absorbe la lógica que `EnsembleAdapter` (eliminado 2026-05-19) tenía como stub. | Archon Shards migrados a `EnsembleIntention` (OQ-STATE-2 ✅). **DNA mutation NO implementada** — `shards: []` y `helminth: undefined` hardcodeados. Ver `../engine-audit.md §3`. |

## 2. Inventario de Dependencias y Bloqueos

### Dominios Aislados (No Consumibles)
- **Archon Shard Catalog**: ✅ Migrado a `EnsembleIntention` (OQ-STATE-2). Los IDs de efecto (`crimson-ability-strength`) aún requieren mapeo hacia el `AttributeRegistry` del motor para emitir modificadores reales.
- **Incarnon Logic**: La selección de evoluciones es puramente posicional en el stub, sin lógica de impacto en las estadísticas del arma. Pendiente OQ-ENGINE-2.

### UI y Patrones de Interacción
- **Hover vs Acción**: El sistema de Popover compartido (`CustomPopover.tsx`) está infrautilizado en el Lab.
- **Dinamismo**: El Arsenal utiliza `useSyncExternalStore` con un snapshot global. Inyectar `useSimulation` aquí requiere asegurar que no existan bucles de renderizado infinito al recalcular estadísticas en cada cambio de estado de UI.

## 3. Plan de Acción Iterativo (Estado Actualizado — 2026-05-19)

1. ~~**Fortalecimiento del Puente**: Actualizar `EnsembleAdapter.ts`...~~ ✅ **Completado** — `EnsembleAdapter` eliminado. `MutatorBridge` absorbe la traducción de intención → contratos del engine. Ver `simulation-architecture.md §Capa B`.
2. **Refactorización de Interfaz**: Mover el Auditor de un panel lateral a un `CustomPopover` activado por acción explícita en las filas de estadísticas. *(Pendiente — bloquea UX del StatPanel)*
3. ✅ **Migración Determinista**: El Arsenal consume `useSimulation` como hook de proyección. Implementación parcial activa. Contrato formal de Capa D (Proyección) pendiente — ver `simulation-architecture.md §Capa D`.

---
*Documento generado para soporte de toma de decisiones en la Fase de Integración.*
