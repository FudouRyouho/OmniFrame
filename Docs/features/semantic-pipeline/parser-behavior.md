# Semantic Parser Behavior

> Estado: activo
> Rol: describir el comportamiento actual del parser semantico y sus limites conocidos
> Fuente de verdad de: comportamiento operativo observado del parser
> No usar para: decidir por si solo la semantica final del schema
> Depende de: `../../domains/data/abilities/pipeline.md`
> Ultima actualizacion: 2026-03-22

## Comportamiento actual

- parsea `references/Semantic/*.md`
- genera output keyed por `uniqueName`
- el payload generado es compatible con `groups[]`
- asigna `upgradeBy: "NONE"` como placeholder

## Lo que si hace

- traduce la estructura del markdown semantico a grupos
- respeta `##` como frontera de habilidad
- genera augments y subgrupos como grupos toggleables
- depende del formato documentado en `semantic-markdown-format.md`

## Lo que no hace

- no genera `name`
- no genera `description`
- no genera `icon`
- no resuelve `upgradeBy` real
- no decide por si solo el merge final a `ability-stats.json`

## Limites conocidos

- la semantica de `exclusive` para augments sigue abierta
- una cabecera `##` mal formada puede dejar habilidades fuera del output
- el valor de cobertura real depende del estado real de `references/Semantic/`

## Relacion con el legacy

Este documento reemplaza la parte operativa de:
- `../../reference/audits/semantic-pipeline-pre-audit.md`
