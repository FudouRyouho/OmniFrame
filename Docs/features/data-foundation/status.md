# Data Foundation Status

> Estado: activo
> Rol: estado operativo de gaps y estabilidad de la base de datos del proyecto
> Fuente de verdad de: gaps activos del dataset y proximos focos de datos
> No usar para: formulas del builder o backlog de UI
> Depende de: `../../domains/data/ssot.md`
> Ultima actualizacion: 2026-03-21

## Objetivo

Consolidar las fuentes de verdad y exponer claramente que gaps del dataset siguen
abiertos antes de que el builder dependa de ellos.

## Estado actual

- metadata principal de warframes, armas y mods ya existe
- `ability-stats.json` sigue siendo la base activa de habilidades
- `passives.json` existe como fuente local
- la semantica de categorias de mods ya esta normalizada

## Gaps activos

### DF-G1 - Rank bonuses post-30

- no modelados
- Nidus es el caso confirmado mas importante
- impactan directamente el pool del builder

### DF-G2 - Rank scaling de warframes

- parcialmente entendido
- los stats base y los bonos extra no deben mezclarse

### DF-G3 - Valores numericos de mods

- `levelStats` sigue siendo texto
- el builder necesita una fuente estructurada

### DF-G4 - Companion compatibility

- `compatName` ya esta preservado en datos
- falta formalizar su uso en filtrado jerarquico

## Desbloquea

- `../builder-engine/status.md`
- `../navigation-shell/status.md`

