# Ability Stats Source Audit

> Estado: referencia
> Rol: conservar la auditoria historica entre `ability-stats.json` y `Module:Ability/data/stats`
> Fuente de verdad de: contexto historico de gaps y del cambio hacia sintaxis del engine
> No usar para: estado operativo actual del semantic pipeline
> Ultima actualizacion: 2026-03-21

## Que dejo establecido esa auditoria

- que los datos de abilities eran reales, no inventados
- que el problema principal era de cobertura y shape, no de correccion base
- que existian gaps como `Val2`, `HelminthMax`, `RoundTo`, `InverseModifier`
- que la sintaxis corta tipo `STRENGTH` era incoherente frente a `AVATAR_ABILITY_*`

## Que parte sigue viva hoy

- los gaps de fuente siguen siendo relevantes
- la coherencia con el vocabulario del engine sigue siendo relevante

## Donde vive ahora lo util

- `../../domains/data/abilities/source-model.md`
- `../../domains/data/abilities/source-gaps.md`
- `../../domains/data/abilities/schema.md`

## Rol actual

Leer este documento como evidencia historica de por que el schema y el vocabulario
de abilities tuvieron que cambiar.

