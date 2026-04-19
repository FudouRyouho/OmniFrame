---
Estado: "activo"
Rol: "Separar lo ya decidido de lo que sigue en debate o solo sugerido"
Version: "v0.0.2"
Impacto_ID: "G-ADL-Frontier"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Decision Frontier

Este documento marca la frontera de lo que ya no se debate porque ya tiene una solución arquitectónica cerrada o una decisión de compromiso aceptada.

## Fronteras de la Fase Actual

### 1. Engine y Estructura de Loadout
**Decidido**:
- `LoadoutProvider` es la frontera activa de integración y estado.
- El cálculo se delega al `Resolver` (Engine); el provider es un gestor de estado puro.
- El flujo bidireccional (Grilla de ítems <-> Cómputo) es el modelo operativo.

**Abierto**:
- Implementación física del desacoplamiento total del Resolver (WebWorkers vs Service).
- Integración final del payload reactivo (B4).

### 2. Capas de Datos y SSoT
**Decidido**:
- La jerarquía de capas es `Raw -> Derived -> Canonical -> Presentation`.
- El SSoT de Overrides es **100% manual** y reside en `Project/public/data/`.
- El idioma del proyecto es **inglés exclusivo** (`DC-1`).

**Abierto**:
- Taxonomía inferior compartida (`family`, `variant`).
- Reglas de derivación determinista para tipos específicos (Arcane, Companion).

### 3. Capa de Presentación
**Decidido**:
- La frontera de traducción y formateo reside en el `Presentation Layer` (Formatter).
- Se prohíbe la invención de taxonomías desde la UI.

**Abierto**:
- Unificación de componentes visuales (Cards, Specs) en `@shared`.
- Arquitectura final de CSS y design tokens.

---

## Decisiones Históricas (B1-B5)
> [!NOTE]
> Los debates pertenecientes a las fases de auditoría y cimentación inicial (B1 a B5) se consideran **CERRADOS**. Cualquier duda operativa sobre estas fases debe consultarse en `docs/governance/closed-decisions.md` o en el historial del `migration-status.md`.

## Uso de este documento
1. Identificar el área de trabajo.
2. Separar lo que ya no es negociable de lo que requiere diseño activo.
3. Si un punto Decidido genera bloqueo, registrar el gap técnico en `impact-matrix.md`.
