# Ability Source Gaps

> Estado: activo
> Rol: documentar gaps reales entre la fuente canonica de habilidades y el payload actual
> Fuente de verdad de: diferencias pendientes entre la wiki y `ability-stats.json`
> No usar para: cobertura por warframe o workflow del parser
> Depende de: `source-model.md`, `schema.md`
> Ultima actualizacion: 2026-03-21

## Gaps principales

### Multi-value

- la wiki soporta `Val2`, `Val3`, etc.
- el payload simplificado historico solo retenia `Val1`

### `HelminthMax`

- ausente en el payload historico

### `RoundTo`

- ausente
- impacto principal de display

### `InverseModifier`

- ausente
- impacto de calculo en casos edge

### Separadores de seccion

- la wiki usa entries sin `Values`
- el payload historico los represento de forma parcial

## Uso de este documento

Este archivo existe para separar:
- limites reales de la fuente
- deudas del payload historico
- decisiones futuras del schema

