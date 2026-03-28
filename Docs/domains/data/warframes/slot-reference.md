# Slots por entidad — Referencia empírica

> Estado: referencia — verificar contra dataset antes de usar en implementación
> Rol: tabla empírica de slots por tipo de entidad equipable para el diseño del Builder
> Fuente de verdad de: conteo base de slots por tipo de entidad
> Migrado desde: `Docs/temp/pre-v1-architecture-2026-03-26.md` (RV-1) — 2026-03-27

## Tabla

| Entidad | Slots normales | Slot especial | Exilus | Arcanos |
|---|---|---|---|---|
| Warframe | 8 | 1 aura | 1 | 2 |
| Primaria | 8 | - | 1 | 1 |
| Secundaria | 8 | - | 1 | 1 |
| Melee | 8 | 1 stance | 1 | 1 |

## Notas

- Jade tiene 2 auras (excepción conocida)
- Extensibilidad prevista: Sevagoth shadow, armas exaltadas, companions v2

## Origen

Decisión RV-1 (2026-03-27): la interface pre-C1 fue eliminada (contradecía PA-N y C8).
Esta tabla se conserva como referencia empírica — no usar en producción sin verificar contra el dataset.
