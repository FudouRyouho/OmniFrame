# Mods Override Strategy

> Estado: activo
> Rol: definir el rol del override de mods en el proyecto actual
> Fuente de verdad de: estrategia de override para datos de mods
> No usar para: formula del builder o detalles de UI
> Ultima actualizacion: 2026-03-22

## Principio

El override de mods no es la fuente de verdad del efecto. Esa semantica vive en
`upgradeTypes[]`.

## Rol actual del override

El override existe para cubrir gaps concretos:
- valores por rango en casos no lineales
- tipo de daño cuando no pueda inferirse de fuente estructurada
- condiciones puntuales
- efectos `UNIQUE` o misc cuando no haya `upgradeType` util

## Lo que no deberia hacer

- no inventar `modifier` paralelos a `upgradeTypes`
- no redefinir toda la descripcion del mod si la fuente ya la provee
- no convertirse otra vez en base global de mods

## Casos importantes

### Elementales

`upgradeTypes[]` no siempre identifica el tipo elemental especifico.

### Galvanized, Primed, Archon

Requieren manejo especial de valores por rango.

### UNIQUE

Algunos casos necesitan `misc` o metadata especial sin convertirse en un sistema paralelo.

