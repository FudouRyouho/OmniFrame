---
Estado: "activo"
Rol: "Documentar gaps reales entre la fuente canónica de habilidades y el payload actual"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Gaps"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Ability Source Gaps

## Gaps principales

### Multi-value

- la wiki soporta `Val2`, `Val3`, etc.
- el payload runtime actual no siempre expone estos valores como contrato estructurado reutilizable

### `HelminthMax`

- ausente como contrato operativo consistente en el payload runtime

### `RoundTo`

- ausente
- impacto principal de display

### `InverseModifier`

- ausente
- impacto de calculo en casos edge

### Separadores de seccion

- la wiki usa entries sin `Values`
- el payload runtime los representa de forma parcial

## Uso de este documento

Este archivo existe para separar:
- limites reales de la fuente
- deudas del payload runtime
- decisiones futuras del schema
