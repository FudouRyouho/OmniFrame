---
Estado: "activo"
Rol: "Índice de decisiones promovidas y registro de estado de boundaries B1-B4"
Version: "v0.0.2"
Impacto_ID: "G-ADL-Index"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Stage 0 Architecture Decisions Index

## Mapa de Decisiones y Estado de Boundaries

| IDs | Documento Canónico | Estado / Qué fijan |
| :--- | :--- | :--- |
| **B1-B4** | `../domains/engine/architecture.md` | **RE-ABIERTO**. Los boundaries entre Loadout, Resolver y Engine están bajo re-discusión técnica. |
| **C1, C41** | `../governance/open-questions.md` | `LoadoutProvider` como integración React (OQ-2). |
| **C2-C28** | `../domains/data/mods/mods-schema.md` | Schema de mods: `stats[]`, `values[]`, `condition`, indexado por `uniqueName`. |
| **C15-C31** | `../domains/data/conditions-baseline.md` | Baseline canónico de condiciones y familias. |
| **OQ-12** | `../governance/open-questions.md` | **RE-ABIERTO**. Contrato del Backward Resolver (B4) en re-evaluación. |

## Mantenimiento de Referencias

- El antiguo registro `draft-matrix.md` ha sido consolidado y renombrado a **`impact-matrix.md`** en la carpeta `overview/`.
- Las decisiones archivadas residen en `docs-archive/historical/`.

---

### Nota de Sinceridad Documental (2026-04-18)
Aunque muchas decisiones de la fase Stage-0 fueron marcadas como cerradas, la realidad operativa del proyecto y la ambigüedad en la cimentación del **Loadout** han obligado a reabrir el debate sobre los boundaries del Resolver. Este documento actúa ahora como un mapa de lo que está en flujo y lo que se mantiene estable.