# Abilities Source Model

> Estado: activo
> Rol: describir que exponen las fuentes de habilidades y que no exponen
> Fuente de verdad de: limites y cobertura de las fuentes de abilities
> No usar para: estado de migracion del pipeline
> Ultima actualizacion: 2026-03-28

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

### 3. `Project/public/data/ability-stats.override.json`

Es la copia activa consumida en runtime para:
- metadata de habilidad
- grupos consumidos por UI y engine cuando una entrada ya esta migrada al contrato objetivo
- override de casos no cubiertos directamente por la fuente primaria

Importante:
- esta ruta representa runtime, no necesariamente la fuente editable canonica
- hoy convive con `Project/data/overrides/ability-stats.override.json` como copia transicional
- el rol logico correcto de este dato es `override`, no `generated`
- en el corte 2026-03-28, el runtime todavia mezcla estructuras legacy y entradas orientadas a `groups[]`; no tratarlo como schema plenamente migrado

## Regla de interpretacion

- la wiki define la semantica base y muchos valores reales
- semantic markdown define la estructura editorial y agrupacion
- `ability-stats` define el payload final de override consumible por la app

## Limites conocidos

- hay habilidades y warframes recientes con cobertura parcial o manual
- los `.md` semanticos no siempre estan sincronizados con la cobertura real
- el runtime publicado todavia no pasa la verificacion estructural completa del schema objetivo
- parte de la semantica de augments y grupos aun requiere validacion

Ver:
- `schema.md`
- `pipeline.md`
- `../data-layer-roles.md`
- `../../../features/semantic-pipeline/questions.md`
