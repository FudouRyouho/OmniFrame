# Semantic Pipeline Questions

> Estado: activo
> Rol: registrar preguntas abiertas locales del track semantic pipeline
> Fuente de verdad de: dudas pendientes de este track
> Ultima actualizacion: 2026-03-22

## SP-Q1 - Augments y `exclusive`

Pregunta:
- `exclusive: true` para augments representa una regla correcta del modelo o solo un
  efecto colateral del parser y del schema actual

Impacto:
- cambia la interpretacion futura del JSON por parte del engine y la UI

## SP-Q2 - Merge reproducible

Resuelto (2026-03-22):
- el merge **mecanico** de `groups` esta cubierto por `Project/scripts/merge-semantic-groups.mjs`
  (preserva el resto del entry en `Project/data/overrides/ability-stats.override.json`)
- la revision de `upgradeBy` y metadata sigue siendo manual-asistido; no es un pipeline de un solo comando

Impacto:
- el flujo de mantenimiento ya no depende de una unica interpretacion oral del merge

## SP-Q3 - Asignacion de `upgradeBy`

Pregunta:
- cual es el workflow canonico para asignar `upgradeBy` despues del parseo

Impacto:
- afecta calidad del dato y velocidad de carga

## SP-Q4 - Cobertura real

Pregunta:
- el estado heredado de `ability-stats-gap.md` sigue representando la cobertura real de
  los `.md` o ya esta desactualizado

Impacto:
- evita planificar sobre un inventario falso
