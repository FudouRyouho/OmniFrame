# Ability Stats Pipeline

> Estado: activo
> Rol: describir el flujo de trabajo entre fuente, markdown semantico, parser y override
> Fuente de verdad de: pipeline actual de habilidades
> No usar para: detalle matematico del engine
> Depende de: `source-model.md`, `schema.md`
> Ultima actualizacion: 2026-03-22

## Flujo actual (lectura unica)

```text
wiki/module + captura manual
  -> references/Semantic/*.md
  -> utilities/parse-semantic.mjs
  -> references/Semantic/parsed-output.json  (solo groups; upgradeBy placeholder)
  -> merge de groups hacia Project/data/overrides/ability-stats.override.json
       (manual, o script Project/scripts/merge-semantic-groups.mjs)
  -> revision manual de upgradeBy y metadata si aplica
  -> npm run generate:data  (generate-data.mjs publica JSON estatico)
  -> Project/public/data/ability-stats.override.json  (runtime)
  -> node scripts/verify-ability-stats.mjs  (sanidad del schema)
```

## Roles por archivo

| Artefacto | Rol |
|-----------|-----|
| `references/Semantic/*.md` | fuente editorial |
| `utilities/parse-semantic.mjs` | parser; no escribe en `Project/` |
| `references/Semantic/parsed-output.json` | salida temporal del parser |
| `Project/data/overrides/ability-stats.override.json` | override editable (canonica para editar) |
| `Project/scripts/merge-semantic-groups.mjs` | aplica solo `groups` del parsed sobre el override |
| `Project/scripts/generate-data.mjs` | normaliza y escribe `public/data` incl. ability-stats |
| `Project/public/data/ability-stats.override.json` | consumo en runtime; no editar como fuente |

## Reglas actuales

- el parser genera `groups`
- el parser no genera `name`, `description`, `icon`
- el parser usa `upgradeBy: "NONE"` como placeholder
- la asignacion correcta de `upgradeBy` sigue siendo manual despues del merge de `groups`
- `ability-stats` pertenece a la capa de override, no a la capa generated
- `Project/public/data/ability-stats.override.json` es la copia de runtime, no la definicion
  conceptual del rol del dato

## Objetivo de este pipeline

Separar:
- estructura editorial y grupos
- metadata de runtime
- semantica real del engine

## Decision de merge (S3)

- el merge **mecanico** de `groups` puede hacerse con `merge-semantic-groups.mjs` (determinista)
- el criterio de **upgradeBy**, revisión de labels y metadata sigue siendo **manual-asistido**
- `generate-data` es el paso formal de publicacion desde override editable hacia `public/`

## Temas aun abiertos (no bloquean el flujo base)

- validacion sistematica de cobertura de todos los `.md`
- semantica de `exclusive` para augments
- criterio consistente documentado para asignar `upgradeBy` en casos limite

Ver:
- `../../../features/semantic-pipeline/status.md`
- `../../../features/semantic-pipeline/questions.md`
- `../../../features/semantic-pipeline/semantic-markdown-format.md`
- `../data-layer-roles.md`
