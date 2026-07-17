---
Estado: "referencia"
Rol: "Verificación antes de considerar una habilidad como 'Cerrada' en el override"
Impacto_ID: "data-abilities-checklist"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-01"
---

# Preflight Checklist: Ability Overrides

## Lista de Verificación

- [ ] **Estructura**: La habilidad usa el contrato `groups[]` y no el formato plano legacy.
- [ ] **Identificadores**: El `uniqueName` coincide exactamente con el del dataset base.
- [ ] **Escalabilidad**: Stats que escalan tienen `upgrade_by` asignado. Stats fijos no tienen el campo (ausencia = valor fijo — `"NONE"` fue eliminado en D-11).
- [ ] **Semántica**: Los tipos de daño están correctamente envueltos en tags `<DT_*>` (ej: `<DT_CORROSIVE>`).
- [ ] **Energía**: Los costes y drains usan los tipos especiales `ENERGY_COST` o `ENERGY_DRAIN`.
- [ ] **Integridad**: No hay descripciones vacías ni iconos rotos.

- [ ] **Fuente**: Los `groups`/`stats` fueron generados vía `apply-ability-md.ts`, no editados a mano en el JSON.

## Cuándo usar este checklist

Este checklist es obligatorio antes de realizar un commit que afecte a `Project/public/data/ability-stats.override.json`.
