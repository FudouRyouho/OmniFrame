# Semantic Pipeline Status

> Estado: activo
> Rol: estado operativo del track de abilities semanticas
> Fuente de verdad de: implementado, pendiente, bloqueantes y proximos pasos del pipeline
> No usar para: contrato final del schema
> Depende de: `../../domains/data/abilities/`
> Ultima actualizacion: 2026-03-28

## Objetivo

Convertir la carga de stats de habilidades en un flujo trazable:

```text
fuente -> semantic markdown -> parser -> merge -> ability-stats.override.json
```

## Implementado

- `utilities/parse-semantic.mjs` existe y parsea markdown semantico
- el output parsed usa `groups[]`
- `Project/scripts/merge-semantic-groups.mjs` aplica `groups` del parsed al override editable
- existe base de merge para convivir con el override actual, pero `ability-stats.override.json` todavia no esta migrado por completo al schema `groups[]`
- hay base documental para `upgradeBy`, `upgradeType` y formulas
- `Ash` fue el primer caso llevado al formato nuevo

## Pendiente

- migrar el override runtime/publicado a una estructura valida con `groups[]`; el verificador actual marca errores estructurales en todo el archivo
- reemplazar el inventario heredado de `coverage.md` por un corte verificado despues de la migracion real del runtime
- asignar `upgradeBy` de forma consistente habilidad por habilidad (manual tras merge de `groups`)
- revisar semantica de grupos augment respecto a `exclusive`
- reducir el drift entre parser/merge/documentacion y el runtime publicado

## Estado de cobertura

Verificado: 2026-03-28 con `node scripts/verify-ability-stats.mjs` desde `Project/`

**Estado actual**: runtime no alineado con el schema objetivo
- Total entradas: 559
- Correctas: 0
- Con warnings: 0
- Con errores: 559
- Schema legacy: 260

**Status**: el pipeline semantico existe, pero `Project/public/data/ability-stats.override.json`
todavia no pasa la verificacion estructural y no puede describirse como 100% migrado a `groups[]`.

Nota historica: la lectura previa de `299/299` y "100% cobertura" ya no debe usarse como
estado operativo del track.

## Bloqueantes

- migracion reproducible del override runtime a `groups[]`
- dudas de semantica de groups y augments
- cobertura parcial de las fuentes para warframes recientes

## Desbloquea

- soporte trazable de habilidades dentro del builder engine
- migracion futura de hidratacion a build time
- menor acoplamiento entre UI de abilities y datos legacy

## Lectura operativa del track

- `coverage.md` para corte verificado del runtime y estado actual de migracion
- `workflow.md` para agregar o migrar un warframe
- `parser-behavior.md` para limites y comportamiento observado del parser
- `semantic-markdown-format.md` para el formato esperado de los `.md`
- `preflight-checklist.md` para validaciones previas a parse y merge
- `../../reference/audits/semantic-pipeline-pre-audit.md` como evidencia historica
