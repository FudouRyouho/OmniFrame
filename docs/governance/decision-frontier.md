---
Estado: "referencia"
Rol: "Separar lo ya decidido de lo que sigue en debate o solo sugerido"
Version: "v0.0.3"
Impacto_ID: "G-ADL-Frontier"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-07"
---

# Decision Frontier

Este documento marca la frontera de lo que ya no se debate porque ya tiene una solución arquitectónica cerrada o una decisión de compromiso aceptada.

## Fronteras de la Fase Actual

### 1. Motor de Simulación (Sim-v2)
**Decidido**:
- **Cierre del Modelo Lineal (B1-B4)**: Se abandona el modelo manual de 3 capas en favor de un **Motor de Simulación Sistémica** (Sim-v2).
- **Agnosticismo Total**: El motor es una pieza funcional, determinista y serializable (apto para Web Workers), completamente desacoplada de React.
- **Flujo A->B->C**: La jerarquía es **Intención (Ensemble) → Hidratación (Mutator Bridge) → Simulación (Engine)**.
- **Salida Única**: El motor emite solo **Projection Snapshots** inmutables.
- **Eliminación de `LoadoutProvider`**: Eliminado físicamente (2026-05-19). `LoadoutState` y `loadout.ts` eliminados (2026-05-21). `EnsembleStore` es el único SSoT de estado del usuario. Ver DC-OQ-STATE-1..4 en `closed-decisions.md`.

**Abierto**:
- Umbrales de conmutación para el **Modo Probabilístico** (Energy Threshold).
- Implementación física del **Selective UI Reactive Bridge**.
- Estándar de esquemas JSON para **Behaviors Declarativos**.

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
- **Unificación de componentes visuales en `@shared`**: `shared/components/` activo (cards, specs/detail views, views por entidad, filters/toolbars, navigation, popovers, slots). Ver `docs/governance/closed-decisions.md` (DC-OQ-UI-1).

**Abierto**:
- Arquitectura final de CSS y design tokens.

---

## Decisiones de Dominio (D-series)

Las secciones anteriores definen fronteras **arquitectónicas** — son invariantes que requieren
debate y autorización explícita para cambiar (equivalente a RED).

Las decisiones D-series que viven en `docs/domains/<dominio>/decisions.md` son un nivel distinto:
decisiones correctas hoy que pueden evolucionar con nueva evidencia sin fricción formal.

| Estado | Descripción | Protocolo de cambio |
|---|---|---|
| **VIGENTE** | Correcta hoy, evolucionable bajo nueva evidencia | Actualizar `decisions.md` + documentar motivo. Impacto GREEN (sube si toca TypeScript o arquitectura). |
| **DEFINITIVA** | Invariante del sistema, declarada explícitamente | Halt + debate + autorización. Mismo protocolo que las fronteras arquitectónicas de arriba. |

Por defecto, las D-series son **VIGENTES**. Solo se declara DEFINITIVA cuando la decisión
es un invariante real del sistema (ej: "los overrides viven en `Project/public/data/`").

Ref: `docs/CLAUDE.md` § "Regla de evolución de decisiones de dominio (D-series)"

---

## Decisiones Históricas (B1-B5)
> [!NOTE]
> Los debates pertenecientes a las fases de auditoría y cimentación inicial (B1 a B5) se consideran **CERRADOS**. Cualquier duda operativa sobre estas fases debe consultarse en `docs/governance/closed-decisions.md`.

## Uso de este documento
1. Identificar el área de trabajo.
2. Separar lo que ya no es negociable de lo que requiere diseño activo.
3. Si un punto Decidido genera bloqueo, registrar el gap técnico como nueva OQ en `open-questions.md` o como deuda en el `status.md` del dominio correspondiente.
