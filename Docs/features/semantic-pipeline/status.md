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
fuente -> semantic markdown -> parser -> merge -> ability-stats.json
```

## Implementado

- `utilities/parse-semantic.mjs` existe y parsea markdown semantico
- el output ya usa `groups`
- `ability-stats.json` usa el schema nuevo basado en grupos
- hay base documental para `upgradeBy`, `upgradeType` y formulas
- `Ash` fue el primer caso llevado al formato nuevo

## Pendiente

- verificar cobertura real de todos los `.md`
- definir un merge reproducible hacia `ability-stats.json`
- asignar `upgradeBy` de forma consistente habilidad por habilidad
- revisar semantica de grupos augment respecto a `exclusive`
- reducir la dependencia de documentos legacy para seguir el estado real

## Estado de cobertura conocido

Ultimo estado conocido heredado de auditorias previas del track:
- 1 warframe en formato nuevo listo para parser
- 26 warframes en formato antiguo pendientes de verificar o migrar
- 35 placeholders sin stats reales

Este dato debe tratarse como base de trabajo, no como verdad final, hasta re-auditarlo.

## Bloqueantes

- ausencia de merge script estable
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
