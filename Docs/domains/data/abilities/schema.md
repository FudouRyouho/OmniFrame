# Ability Stats Schema

> Estado: activo
> Rol: documentar el schema aceptado hoy para `ability-stats.json`
> Fuente de verdad de: contrato actual del override de habilidades
> No usar para: cobertura por warframe o estado del parser
> Depende de: `source-model.md`
> Ultima actualizacion: 2026-03-22

## Entrada de habilidad

Cada habilidad en `Project/public/data/ability-stats.json` esta indexada por
`uniqueName` y usa esta estructura conceptual:

```ts
interface AbilityStatsData {
  name: string
  description: string
  icon: string
  groups: AbilityGroup[]
}
```

`AbilityStatsData` es la unidad completa consumida por runtime para una habilidad.

## Grupo

```ts
interface AbilityGroup {
  id?: string
  label?: string
  defaultActive?: boolean
  exclusive?: boolean
  stats: AbilityStatEntry[]
}
```

Regla:
- sin `id`: grupo base siempre activo
- con `id`: grupo toggleable

Patrones comunes:
- habilidad simple: solo grupo base
- formas exclusivas: grupos con `exclusive: true`
- motes o secciones acumulables: grupos con `exclusive: false`

## Valor

```ts
interface AbilityStatValue {
  baseValue: number
  upgradeBy: string
  upgradeType?: string
  cap?: number
  capMin?: number
  helminthBase?: number
  helminthCap?: number
  inverse?: boolean
}
```

## Valores validos de `upgradeBy`

- `AVATAR_ABILITY_STRENGTH`
- `AVATAR_ABILITY_RANGE`
- `AVATAR_ABILITY_DURATION`
- `AVATAR_ABILITY_EFFICIENCY`
- `ENERGY_COST`
- `ENERGY_DRAIN`
- `NONE`

## Convenciones activas

- `upgradeBy` usa vocabulario del engine
- `upgradeType` solo existe cuando la habilidad modifica stats externos
- `NONE` representa valor fijo
- `ENERGY_COST` y `ENERGY_DRAIN` son tipos especiales de energia

## Regla de `upgradeType`

`upgradeType` solo aparece cuando una habilidad modifica algo externo al stat propio,
por ejemplo buffs como Roar, Warcry o Volt Speed. Debe usar el mismo vocabulario que
`upgradeTypes[]` en mods.

## Tags de texto

`label` y `description` pueden contener tags como:

- `<DT_*>`
- `<ENERGY>`
- `<SHIELD>`
- `<HEALTH>`

La ubicacion exacta del tag forma parte del contenido esperado del schema, no de la UI.

## Documentos complementarios

- `engine-variables.md` fija el vocabulario canonico
- `formula-patterns.md` resume como interpreta eso el builder
- `group-model.md` separa el problema de grupos y modos

## Lo que este documento no decide

- cobertura real por warframe
- flujo de migracion desde semantic markdown
- semantica final de ciertos augments o grupos especiales

Esos temas viven en:
- `pipeline.md`
- `engine-variables.md`
- `formula-patterns.md`
- `group-model.md`
- `../../../features/semantic-pipeline/status.md`
- `../../../features/semantic-pipeline/questions.md`
