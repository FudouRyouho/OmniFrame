# Abilities Source Model

> Estado: activo
> Rol: describir que exponen las fuentes de habilidades y que no exponen
> Fuente de verdad de: limites y cobertura de las fuentes de abilities
> No usar para: estado de migracion del pipeline
> Ultima actualizacion: 2026-03-21

## Fuentes actuales

### 1. `Module:Ability/data/stats`

Expone:
- `Label`
- `Modifier`
- `Values`
- `Max`, `Min`
- `HelminthValues`, `HelminthMax`
- `RoundTo`
- `InverseModifier`

No resuelve por si solo:
- estructura editorial por grupos manuales
- augments modelados como toggles de UI
- metadata de flujo del parser

### 2. `references/Semantic/*.md`

Expone:
- estructura humana y agrupacion de stats
- labels visibles y orden de lectura
- subgrupos y augments modelados de forma manual

No expone por si solo:
- `upgradeBy` final
- `upgradeType`
- metadata completa de runtime (`name`, `description`, `icon`)

### 3. `Project/public/data/ability-stats.json`

Es la fuente activa en runtime para:
- metadata de habilidad
- grupos consumidos por UI y futuro engine
- override de casos no cubiertos directamente por la fuente primaria

## Regla de interpretacion

- la wiki define la semantica base y muchos valores reales
- semantic markdown define la estructura editorial y agrupacion
- `ability-stats.json` define el payload final consumible por la app

## Limites conocidos

- hay habilidades y warframes recientes con cobertura parcial o manual
- los `.md` semanticos no siempre estan sincronizados con la cobertura real
- parte de la semantica de augments y grupos aun requiere validacion

Ver:
- `schema.md`
- `pipeline.md`
- `../../../features/semantic-pipeline/questions.md`

