---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.0.3"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-04-20"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos activos. Las preguntas cerradas han sido migradas a `closed-decisions.md`.

---

## OQ-2 - Rol del LoadoutProvider y Agnosticismo Real — **CERRADO (2026-04-21)**
**Solución:** Se abandona el `LoadoutProvider` como gestor de cálculo. La arquitectura **Sim-v2** introduce el **Mutator Bridge** y el **Engine Agnóstico**. El estado es ahora una **Ensemble Store** serializable.
**Referencia:** `docs/design/sim-v2/OMNIFRAME_SIMULATION_ARCHITECTURE.md`

## OQ-5 - Punto de migracion de hidratacion a build time
**Estado:** **ABIERTO**
**Dominio:** integración / data
**Pregunta:** ¿Cuándo deja de vivir la hidratación de habilidades en runtime y pasa al pipeline de build?
**Impacto:** Afecta performance del engine y fidelidad de los datos.

## OQ-12 - Definicion del contrato de Proyección (B4) — **CERRADO (2026-04-21)**
**Solución:** El contrato de salida es un **Projection Snapshot** inmutable y serializable. La reactividad se maneja mediante un **Selective UI Reactive Bridge** externo al motor.
**Referencia:** `docs/design/sim-v2/OMNIFRAME_SIMULATION_CONTRACTS.md`

## OQ-13 - Frontera de calculo entre Arsenal y Builder — **CERRADO (2026-04-21)**
**Solución:** No hay frontera de cálculo. Ambos consumen el mismo **Engine Sim-v2**. La diferencia radica únicamente en el **Simulation Context** inyectado (Target vs Baseline).
