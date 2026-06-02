---
Estado: "referencia"
Rol: "Auditoría de integración del motor de simulación con el Arsenal"
Version: "v0.0.5"
Impacto_ID: "E-05"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-05-27"
---

# Auditoría de Panorama y Mapeo de Dependencias (Sim-v2 vs Arsenal)


Este documento registra el estado técnico y las brechas detectadas durante la fase de integración del motor de simulación v2 en el ecosistema del Arsenal de OmniFrame.

## 1. Brecha de Contratos (Data Drift)

| Capa | Estado Actual | Limitación para Integración |
| :--- | :--- | :--- |
| **Engine (EnsembleIntention)** | Estructura de intención tipada: mods, shards, incarnon. | Incarnon Genesis: perks estáticos implementados vía `IncarnonRepository` (D-13, 2026-05-27). Perks dinámicos (on-kill, condicionales, stacking) y Helminth sin implementar. |
| **UI (ArsenalMetadataState)** | Rico en metadata visual. Posee catálogos de Shards y Evoluciones Mock. | Los datos son puramente descriptivos (`label`, `description`). No emiten modificadores matemáticos procesables por el motor. |
| **Bridge (MutatorBridge)** | Activo — traduce `EnsembleIntention` → contratos del engine. Absorbe la lógica que `EnsembleAdapter` (eliminado 2026-05-19) tenía como stub. | Archon Shards migrados a `EnsembleIntention` (OQ-STATE-2 ✅). **DNA mutation NO implementada** — `shards: []` y `helminth: undefined` hardcodeados. Ver `../engine-audit.md §3`. |

## 2. Inventario de Dependencias y Bloqueos

### Dominios Aislados (No Consumibles)
- **Archon Shard Catalog**: ✅ Migrado a `EnsembleIntention` (OQ-STATE-2). ✅ `ShardRepository` emite `Modifier[]` al `StaticHydrator` — OQ-ENGINE-4 cerrado (2026-05-27). 14/27 stats con `upgrade_type` mapeado; 13 nulos pendientes de vocabulario de condiciones.
- **Incarnon Logic**: `IncarnonRepository` resuelve perks estáticos → `Modifier[]` vía tokens `WEAPON_BASE_*` (D-13, 2026-05-27). ~35% mapeados; ~65% con `null + note` (condicionales, on-kill, stacking). OQ-ENGINE-2 es profile switching (modo incarnon), no mapeo de perks.

### UI y Patrones de Interacción
- **Hover vs Acción**: El sistema de Popover compartido (`CustomPopover.tsx`) está infrautilizado en el Lab.
- **Dinamismo**: El Arsenal utiliza `useSyncExternalStore` con un snapshot global. Inyectar `useSimulation` aquí requiere asegurar que no existan bucles de renderizado infinito al recalcular estadísticas en cada cambio de estado de UI.

## 3. Estado

Arsenal consume `useSimulation` como hook de proyección (implementación parcial activa). Contrato formal de Capa D (`ViewModelContract`) pendiente — ver `simulation-architecture.md §Capa D`.

---
*Documento generado para soporte de toma de decisiones en la Fase de Integración.*
