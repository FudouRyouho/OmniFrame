---
Estado: "en ejecucion"
Rol: "Hoja de ruta para la implementación del motor v2"
Version: "v0.1.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-04-21"
Dependencias:
  - "docs/design/sim-v2/simulation-contracts.md"
  - "docs/design/sim-v2/simulation-pre-implementation.md"
Dependidos:
  - "docs/overview/impact-matrix.md"
---

# 🗺️ Roadmap: Reconstrucción del Motor de Simulación (Sim-v2)

Este documento define la ruta crítica para sustituir el sistema de Loadout/Resolver actual por el nuevo **Motor de Simulación Reactiva**.

---

## Fase 1: Limpieza y Oficialización (Completado)
- [x] **Deprecación de Documentación Antigua**: Marcar como `DEPRECADO` los documentos en `docs/domains/engine/` e `integration/` que contradigan el nuevo modelo.
- [x] **Migración de Contratos**: Mover `docs-temp/` a `docs/design/sim-v2/` bajo estado de `REVISIÓN`.
- [ ] **Cierre de Debate**: Confirmar que los contratos de `Ensemble`, `Entity` y `Attribute` son finales para la primera iteración de desarrollo.

## Fase 2: El Laboratorio Estéril (Prototipo Headless)
- [ ] **Definición de Mock Data**: Crear `core/engine/__tests__/fixtures/synthetic-dna.ts` con entidades base (Warframe, Weapon, Mod) simplificadas.
- [ ] **Implementación de la Capa C (Engine Core)**:
    - [ ] Construcción del `Reactive Attribute Graph`.
    - [ ] Implementación del `Topological Sort` y `Fixed-Point Iteration`.
    - [ ] Sistema de `Elemental Combination` posicional.
- [ ] **Implementación de la Capa B (Mutator Bridge)**:
    - [ ] Lógica de inyección de Shards/Helminth en ADN base.
    - [ ] Generación de `Mutated DNA`.
- [ ] **Validation Runner**: Script `scripts/validate-sim-v2.ts` para ejecutar simulaciones por consola.

## Fase 3: Capa de Diagnóstico y Observación (Debug Layer)
- [ ] **Diagnostic Registry**: Implementar el bucket de logs en el `Projection Snapshot` para rastrear:
    - `Input Ensemble` -> `Mutated DNA` -> `Resolved Graph` -> `Final Projection`.
- [ ] **Traceability**: Permitir que cada Atributo sepa qué modificadores lo afectaron (Source Tracking).
- [ ] **Audit UI (Opcional)**: Una vista técnica que visualice el rastro de un stat (ej: por qué este daño es 500?).

## Fase 4: Integración Progresiva (The Bridge)
- [ ] **UI Bridge Development**: Crear el adaptador que convierte el `Projection Snapshot` en `Signals/Stores` consumibles por la UI.
- [ ] **Deprecación de `loadout-context.tsx`**: Sustitución gradual del provider antiguo por el nuevo flujo observer.

---

## 🛡️ Auditoría de Riesgos
1. **Riesgo de Regresión**: Mantener el sistema antiguo vivo mientras se construye el nuevo en paralelo.
2. **Incompletitud de Datos**: Usar el **Dataset Sintético** como escudo hasta que los JSONs reales estén listos.
3. **Complejidad del Grafo**: Limitar inicialmente el número de iteraciones de convergencia para evitar cuellos de botella.
