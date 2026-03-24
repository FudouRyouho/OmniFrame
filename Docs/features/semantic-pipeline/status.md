# Semantic Pipeline Status

> Estado: activo
> Rol: estado operativo del track de abilities semanticas
> Fuente de verdad de: implementado, pendiente, bloqueantes y proximos pasos del pipeline
> No usar para: contrato final del schema
> Depende de: `../../domains/data/abilities/`
> Ultima actualizacion: 2026-03-22

## Objetivo

Convertir la carga de stats de habilidades en un flujo trazable:

```text
fuente -> semantic markdown -> parser -> merge -> ability-stats.override.json
```

## Implementado

- `utilities/parse-semantic.mjs` existe y parsea markdown semantico
- el output ya usa `groups`
- `Project/scripts/merge-semantic-groups.mjs` aplica `groups` del parsed al override editable
- `ability-stats.override.json` usa el schema nuevo basado en grupos
- hay base documental para `upgradeBy`, `upgradeType` y formulas
- `Ash` fue el primer caso llevado al formato nuevo

## Pendiente

- re-auditar cobertura real de `references/Semantic/` y actualizar `coverage.md` (el inventario
  numerico resumido abajo es heredado, no verificado contra disco)
- asignar `upgradeBy` de forma consistente habilidad por habilidad (manual tras merge de `groups`)
- revisar semantica de grupos augment respecto a `exclusive`
- reducir la dependencia de documentos legacy para seguir el estado real

## Estado de cobertura (heredado, no re-auditado)

La fuente detallada por warframe esta en `coverage.md`. Los conteos agregados que antes
vivian solo en este archivo deben leerse como **estimacion heredada** hasta correr una
auditoria del arbol de `.md`.

Hasta entonces:
- usar `coverage.md` como checklist operativo desactualizado pero util
- usar `node Project/scripts/verify-ability-stats.mjs` como sanidad del JSON publicado
  (`groups[]` en runtime), no como medida de cobertura de markdown

## Bloqueantes

- dudas de semantica de groups y augments
- cobertura parcial de las fuentes para warframes recientes

## Desbloquea

- soporte real de habilidades dentro del builder engine
- migracion futura de hidratacion a build time
- menor acoplamiento entre UI de abilities y datos legacy

## Lectura operativa del track

- `coverage.md` para inventario de warframes y cobertura
- `workflow.md` para agregar o migrar un warframe
- `parser-behavior.md` para limites y comportamiento observado del parser
- `semantic-markdown-format.md` para el formato esperado de los `.md`
- `preflight-checklist.md` para validaciones previas a parse y merge
- `../../reference/audits/semantic-pipeline-pre-audit.md` como evidencia historica
