# Ability Stats Pipeline

> Estado: activo
> Rol: describir el flujo de trabajo entre fuente, markdown semantico, parser y override
> Fuente de verdad de: pipeline actual de habilidades
> No usar para: detalle matematico del engine
> Depende de: `source-model.md`, `schema.md`
> Ultima actualizacion: 2026-03-22

## Flujo actual

```text
wiki/module + captura manual
  -> references/Semantic/*.md
  -> utilities/parse-semantic.mjs
  -> output temporal con groups
  -> merge manual o asistido
  -> Project/public/data/ability-stats.json
```

## Reglas actuales

- el parser genera `groups`
- el parser no genera `name`, `description`, `icon`
- el parser usa `upgradeBy: "NONE"` como placeholder
- la asignacion correcta de `upgradeBy` sigue siendo manual

## Objetivo de este pipeline

Separar:
- estructura editorial y grupos
- metadata de runtime
- semantica real del engine

## Problemas aun abiertos

- merge reproducible hacia `ability-stats.json`
- validacion real de cobertura de los `.md`
- semantica de `exclusive` para augments
- criterio consistente para asignar `upgradeBy`

Ver:
- `../../../features/semantic-pipeline/status.md`
- `../../../features/semantic-pipeline/questions.md`
- `../../../features/semantic-pipeline/semantic-markdown-format.md`
