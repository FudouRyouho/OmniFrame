# Semantic Pipeline Pre-Audit

> Estado: referencia
> Rol: conservar hallazgos historicos del pre-audit previo a ejecutar el parser semantico
> Fuente de verdad de: contexto historico de correcciones y discrepancias detectadas el 2026-03-21
> No usar para: estado operativo actual del track semantic pipeline
> Ultima actualizacion: 2026-03-21

## Correcciones ya aplicadas en ese momento

### Split de `types.ts`

Quedo documentado que:
- `types.ts` fue reemplazado por `Project/src/lib/types/`
- `index.ts` preservo compatibilidad de imports
- no habia errores de diagnostico en los consumidores auditados

### Correccion en `legacy.ts`

Quedo documentado que:
- `Stat.modifier` en `legacy.ts` debia usar `AbilityScaling`
- el import incorrecto desde el modulo nuevo fue removido

## Discrepancias documentales detectadas entonces

### `open-questions.md` y D2

El pre-audit detecto redaccion confusa alrededor de D2 y su relacion con las decisiones
del builder engine.

Valor actual de esta nota:
- sirve como evidencia de que los docs legacy quedaron desalineados
- no debe tomarse como backlog vivo si `Docs/` ya provee la lectura principal

### `open-questions.md` y DT-6

El pre-audit detecto que la migracion de `ability-stats.json` se seguia describiendo
como pendiente total, cuando el schema nuevo ya estaba operando parcialmente.

Valor actual de esta nota:
- justifica mover el estado operativo del pipeline a `Docs/features/semantic-pipeline/`

## Notas de frontera de tipos

### Tipos del motor

El pre-audit dejo explicito que los tipos del motor no pertenecen a `src/lib/types/`
porque el motor es feature-specific y debe vivir en `features/arsenal/engine/`.

Esta frontera ya esta reflejada en:
- `Docs/domains/engine/builder-v1.md`

### `UpgradeType` como string abierto

Tambien quedo documentado que `UpgradeType` se mantiene como `string` abierto por
coste de mantenimiento y expansion del dataset.

Esta nota sigue siendo valida como decision historica, pero aun no tiene un documento
dedicado en `Docs/` para mods.

## Partes operativas que ya no viven aqui

Lo operativo del pre-audit fue dividido en:
- `Docs/features/semantic-pipeline/parser-behavior.md`
- `Docs/features/semantic-pipeline/preflight-checklist.md`
- `Docs/features/semantic-pipeline/questions.md`
- `Docs/features/semantic-pipeline/coverage.md`

Por eso este archivo debe leerse solo como referencia historica.
