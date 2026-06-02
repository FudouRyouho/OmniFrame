---
Estado: "referencia"
Rol: "Documentar gaps reales entre la fuente canónica de habilidades y el payload actual"
Version: "v0.0.2"
Impacto_ID: "data-abilities-gaps"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-01"
---

# Ability Source Gaps

## Gaps principales

### ~~Multi-value~~ — RESUELTO (D-12, 2026-05-22)

`base_value: number | [number, number]` en `AbilityStatEntry` soporta rangos min-max.
`|val1|` y `|val2|` resuelven `base_value[0]` y `base_value[1]` respectivamente.

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
