# Semantic Pipeline Coverage

> Estado: activo
> Rol: registrar la cobertura conocida de los markdown semanticos por warframe
> Fuente de verdad de: inventario operativo de cobertura del track semantic pipeline
> No usar para: contrato del schema o reglas del parser
> Depende de: `status.md`
> Ultima actualizacion: 2026-03-28

## Estado verificado actual

Verificado: 2026-03-28 con `node scripts/verify-ability-stats.mjs` desde `Project/`.

- Total entradas: 559
- Correctas: 0
- Con warnings: 0
- Con errores: 559
- Schema legacy: 260

## Lectura correcta del archivo

- este archivo deja de usar el inventario heredado por warframe como lectura operativa
- el parser y el formato semantico existen, pero el runtime publicado en `Project/public/data/ability-stats.override.json` no esta migrado por completo a `groups[]`
- 260 entradas fueron marcadas explicitamente como `schema legacy`; el resto del archivo sigue fallando la verificacion estructural actual

## Inventario heredado retirado

El listado previo por warframe se retira de este documento porque no estaba verificado
contra el runtime ni contra el estado real de `references/Semantic/`.

## Proximo paso operativo

1. migrar el override runtime para que `verify-ability-stats.mjs` deje de fallar estructuralmente
2. re-auditar `references/Semantic/` y reconstruir un inventario por warframe ya verificado
3. volver a usar este archivo como corte operativo solo despues de esa revalidacion
