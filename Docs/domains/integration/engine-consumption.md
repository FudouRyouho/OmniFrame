# Engine Consumption In Runtime

> Estado: activo
> Rol: describir como la capa de integracion consume el motor y maneja granularidad de re-render
> Fuente de verdad de: frontera entre engine puro y consumo runtime
> No usar para: formulas del engine o decisiones visuales finas
> Depende de: `runtime-composition.md`, `../engine/output-contract.md`
> Ultima actualizacion: 2026-03-21

## Regla base

El motor recalcula y devuelve un objeto completo.
La memoizacion y la granularidad de consumo viven fuera del motor.

## Modelo v1

- memoizacion por entidad
- consumo selectivo de `output.primary`, `output.warframe`, etc.
- sin hooks hiper-granulares hasta que el profiling lo justifique

## Extension futura

Si el profiling lo justifica, pueden aparecer hooks o selectores mas finos, por ejemplo:
- por entidad
- por stat
- por ataque

