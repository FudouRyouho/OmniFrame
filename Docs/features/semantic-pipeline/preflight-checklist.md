# Semantic Pipeline Preflight Checklist

> Estado: activo
> Rol: listar lo que debe verificarse antes de ejecutar el parser o hacer merge
> Fuente de verdad de: checklist operativo previo del track semantic pipeline
> No usar para: estado general del proyecto
> Depende de: `workflow.md`, `questions.md`
> Ultima actualizacion: 2026-03-22

## Antes de correr el parser

1. Confirmar que el `.md` usa `## /Lotus/...` y no `## N - NOMBRE`.
2. Confirmar que los grupos y augments siguen el formato semantico vigente.
3. Verificar si el archivo ya fue procesado o si existe riesgo de overwrite manual.

## Antes de aceptar el output

1. Confirmar que el parser genero `groups` con la estructura esperada.
2. Revisar si `exclusive` en augments sigue siendo valido para el caso actual.
3. Confirmar que ninguna habilidad desaparecio por encabezados mal formados.

## Antes de mergear a `ability-stats.override.json`

1. Para merge mecanico de `groups`: usar `npm run merge:semantic-groups` (desde `Project/`) o
   edicion manual equivalente.
2. Preservar `name`, `description` e `imageName` (el script de merge solo toca `groups`).
3. Confirmar que cada `uniqueName` del parsed ya existe en el override (si no, generar entradas
   con `generate-data` o entrada manual antes).
4. Revisar `upgradeBy` porque el parser deja placeholders.

## Antes de cerrar la tarea

1. Actualizar `status.md` si cambia la cobertura o el workflow del track.
2. Actualizar `questions.md` si se resolvio o aparecio una duda nueva.
3. Si una decision afecta a varios tracks, moverla a `Docs/decisions/open-questions.md`.
