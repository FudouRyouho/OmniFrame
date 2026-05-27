---
Estado: "ratificado"
Rol: "Índice maestro de la reconstrucción del motor de simulación v2"
Version: "v0.1.0"
Impacto_ID: "SSoT-Blueprint"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-04-21"
Dependencias:
  - "docs/governance/naming-conventions.md"
Dependidos:
  - "docs/domains/engine/design/simulation-architecture.md"
  - "docs/domains/engine/design/simulation-contracts.md"
  - "docs/domains/engine/design/arch-decisions.md"
  - "docs/domains/engine/design/simulation-roadmap.md"
---

# 🛸 Simulation Blueprint: El Motor de Verdad

Este documento actúa como **índice maestro** de la reconstrucción del núcleo de OmniFrame. La arquitectura se desglosa en piezas modulares para garantizar soberanía técnica y trazabilidad.

---

## 🧭 Navegación del Simulacro

- **Arquitectura**: [simulation-architecture.md](./simulation-architecture.md)
- **Contratos**: [simulation-contracts.md](./simulation-contracts.md)
- **Decisiones Arquitectónicas**: [arch-decisions.md](./arch-decisions.md)
- **Roadmap**: [simulation-roadmap.md](./simulation-roadmap.md)
- **Auditoría Diseño vs Código**: [../engine-audit.md](../engine-audit.md)
- **Integración formulas/ como SSoT**: [formulas-integration.md](./formulas-integration.md)

---

## Orden de Lectura Recomendado

1. **[Arquitectura](./simulation-architecture.md)**: Cómo fluye la verdad (A->B->C).
2. **[Contratos](./simulation-contracts.md)**: El lenguaje matemático del motor.
3. **[Decisiones Arquitectónicas](./arch-decisions.md)**: Invariantes y resoluciones críticas.
4. **[Roadmap](./simulation-roadmap.md)**: Pasos de ejecución.
5. **[Auditoría](../engine-audit.md)**: Estado real del código vs diseño.

---

## Hitos ya cerrados

- El motor debe ser agnóstico a React y a cualquier librería reactiva concreta.
- La hidratación consume el pipeline local (`Project/public/data/`) y no directamente `references/`.
- `Simulation Context` no es una entidad persistente.
- La salida oficial del motor es un `Projection Snapshot` serializable.
- Las invariantes arquitectónicas (Stat Accumulator v3, Layered Decorators, etc.) están registradas en `arch-decisions.md`.

---

## Mensaje de Visión
> "No estamos construyendo una tabla de Excel. Estamos construyendo el simulacro donde las leyes de Warframe cobran vida para el usuario."
