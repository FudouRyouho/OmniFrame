---
Estado: "en revision"
Rol: "Estado operativo del motor de cálculo y el Resolver"
Version: "v0.0.2"
Impacto_ID: "E-Status"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Builder Engine Status — [CRISIS DE INTEGRIDAD]

## Situación Actual: Fallo de Arquitectura B1-B4

Se declara un **Fallo de Integridad** en los contratos del Builder. Lo que antes se entendía como una implementación referencial no cumple con el agnosticismo requerido. Se inicia la fase de **Deprecación y Re-diseño Total** del flujo de integración.

### Componentes en el Codebase

- **Engine Core**: Implementado en `Project/src/core/engine/`. **Única pieza estable**. Fórmulas matemáticas puras.
- **Resolver**: `Project/src/core/engine/resolver.ts`. **ESTADO: ROTO**. No cumple su rol de mediación. Marcado para deprecación/re-diseño.
- **Loadout**: `Project/src/core/engine/loadout.ts`. **ESTADO: LEGACY**. Implementación referencial acoplada a la UI. Marcado para deprecación.

## Estado de Implementación (Track de Desarrollo)

- **Cálculo Base**: Operativo para Armas y Warframes (Stats estáticos).
- **Habilidades**: Integración parcial vía `abilityCalc.ts` (transicional).
- **Consumo en UI**: El **ArsenalView** actúa como un stub de flujo UX, desacoplado del cierre funcional de la integración para permitir iteración en paralelo.

---

### Bloqueos Críticos
1.  **Re-definición de B4**: Materializar el payload reactivo entre el Resolver y la Interfaz.
2.  **Consolidación de Overrides**: Migración de `public/data/` a la carpeta de overrides interna del proyecto.
3.  **Persistencia**: Definición de contratos para el guardado de builds.

---

### Notas Operativas
Este documento ya no sigue la estructura de "Tramos" de la fase anterior. El foco actual es la **Sincronización de Contratos** y la eliminación de deuda arquitectónica en el bloque Resolver/Loadout.
