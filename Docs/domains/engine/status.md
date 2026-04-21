---
Estado: "en revision"
Rol: "Estado operativo del motor de cálculo y el Resolver"
Version: "v0.0.2"
Impacto_ID: "E-Status"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Builder Engine Status — [EVOLUCIÓN SIM-V2]

## Situación Actual: Transición a Motor Sistémico
La **Crisis de Integridad** del modelo lineal B1-B4 ha sido resuelta mediante la ratificación de la arquitectura **Sim-v2** (Basada en Grafos y Mutadores). El proyecto ha salido de la parálisis de diseño y entra en fase de prototipado headless.

### Componentes en el Codebase
- **Engine Core (v1)**: `Project/src/core/engine/`. Sigue siendo la única pieza que genera números, pero está marcada como **Legacy**.
- **Resolver/Loadout (v1)**: `Project/src/core/engine/resolver.ts`. Declarados como **Obsoletos**. No recibirán nuevas funcionalidades.
- **Engine (v2)**: Diseño cerrado en `docs/design/sim-v2/`. Implementación pendiente.

## Estado de Desarrollo (Sim-v2)
- **Diseño**: 🟢 RATIFICADO.
- **Contratos**: 🟢 CERRADOS.
- **Implementación**: 🔴 PENDIENTE (Fase 2 del Roadmap).

---

### Bloqueos Operativos
1. **Validación de Datasets**: Confirmar que los JSONs actuales pueden alimentar al `Mutator Bridge` de sim-v2.
2. **Headless Prototype**: Construcción del núcleo sin dependencias de UI.

---

### Notas Operativas
El foco ha pasado de "arreglar el Resolver" a "construir el nuevo Motor". Toda la discusión técnica debe realizarse bajo el nuevo SSoT en `docs/design/sim-v2/`.
