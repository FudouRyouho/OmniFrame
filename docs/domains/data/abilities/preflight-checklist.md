---
Estado: "activo"
Rol: "Verificación antes de considerar una habilidad como 'Cerrada' en el override"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Checklist"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Preflight Checklist: Ability Overrides

## Lista de Verificación

- [ ] **Estructura**: La habilidad usa el contrato `groups[]` y no el formato plano legacy.
- [ ] **Identificadores**: El `uniqueName` coincide exactamente con el del dataset base.
- [ ] **Escalabilidad**: Todos los stats tienen un `upgradeBy` asignado (no dejar placeholders en "NONE" si el stat escala en la wiki).
- [ ] **Semántica**: Los tipos de daño están correctamente envueltos en tags `<DT_*>` (ej: `<DT_CORROSIVE>`).
- [ ] **Energía**: Los costes y drains usan los tipos especiales `ENERGY_COST` o `ENERGY_DRAIN`.
- [ ] **Integridad**: No hay descripciones vacías ni iconos rotos.

## Cuándo usar este checklist

Este checklist es obligatorio antes de realizar un commit que afecte a `Project/public/data/ability-stats.override.json`.
