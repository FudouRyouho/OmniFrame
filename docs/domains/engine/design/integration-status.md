---
Estado: "referencia"
Rol: "Auditoría de integración del motor de simulación con el Arsenal"
Impacto_ID: "E-05"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-21"
Fecha_de_actualizacion: "2026-08-07"
---

# Auditoría de Panorama y Mapeo de Dependencias (Sim-v2 vs Arsenal)


Este documento registra el estado técnico y las brechas detectadas durante la fase de integración del motor de simulación v2 en el ecosistema del Arsenal de OmniFrame.

## 1. Brecha de Contratos (Data Drift)

| Capa | Estado Actual | Limitación para Integración |
| :--- | :--- | :--- |
| **Capa A (`Scene`)** | Estructura de intención tipada: el portador contiene sus mods, arcanos, shards e incarnon. | Incarnon Genesis: perks estáticos implementados vía `IncarnonRepository` (D-13). Perks dinámicos (on-kill, condicionales, stacking) y Helminth sin implementar. |
| **UI (estado de sesión de arsenal)** | El store es `arsenal-ui-session`: estado UI-local honesto, sin catálogos mock (`DC-OQ-STUB-1`). Los catálogos reales (archon/incarnon) se leen vía `Registry.getCatalog`/`useCatalog`. | La intención va por `useEnsemble`; el chrome de slots aún se hidrata ad-hoc (eje-2 diferido, `OQ-UI-2`). |
| **Bridge (MutatorBridge)** | Activo — traduce `Scene` → contratos del engine. Absorbe la lógica que `EnsembleAdapter` (eliminado) tenía como stub. | Archon Shards viajan en `WarframeIntent.shards` y llegan al `ShardRepository` (OQ-STATE-2 ✅). **Helminth sigue sin implementar** — `helminth: undefined` hardcodeado en el bridge. Ver `../engine-audit.md §3`. |

## 2. Inventario de Dependencias y Bloqueos

### Dominios Aislados (No Consumibles)
- **Archon Shard Catalog**: ✅ Vive en la intención, hoy como `WarframeIntent.shards` (OQ-STATE-2). ✅ `ShardRepository` emite `Modifier[]` al `StaticHydrator` — OQ-ENGINE-4 cerrado. 14/27 stats con `upgrade_type` mapeado; 13 nulos pendientes de vocabulario de condiciones.
- **Incarnon Logic**: `IncarnonRepository` resuelve perks estáticos → `Modifier[]` vía tokens `WEAPON_BASE_*` (D-13). ~35% mapeados; ~65% con `null + note` (condicionales, on-kill, stacking). OQ-ENGINE-2 es profile switching (modo incarnon), no mapeo de perks.

### UI y Patrones de Interacción
- **Hover vs Acción**: El sistema de Popover compartido (`CustomPopover.tsx`) está infrautilizado en el Lab.
- **Dinamismo**: El Arsenal utiliza `useSyncExternalStore` con un snapshot global. El binding a la simulación se hace vía `useViewModel` (`@providers`, liga `EnsembleStore → consume() → project()`); cuidar que no haya bucles de render al recalcular en cada cambio de estado de UI.

## 3. Estado

La Capa D se materializó como **`ViewModelContract` v0** (display-only/C1) en `@shared/view-model`; el Arsenal (`UpgradeView`) la consume vía `useViewModel` (`@providers`, D1), y el oráculo CLI vía `project()` (D2) — dos lentes del mismo contrato. Pendiente: versión reactiva completa — ver `simulation-architecture.md §Capa D`. *(La Capa E intermedia se descartó — `DC-OQ-ENGINE-10`.)*
