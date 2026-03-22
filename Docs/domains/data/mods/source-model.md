# Mods Source Model

> Estado: activo
> Rol: describir que exponen las fuentes de mods y cuales son sus limites para el builder
> Fuente de verdad de: modelo de fuentes para datos de mods
> No usar para: backlog del builder o decisiones transversales
> Ultima actualizacion: 2026-03-22

## Fuente principal

La fuente principal de mods sigue siendo `warframe-items` enriquecido con datos del
fork y del wikia.

## Lo que si tenemos

- `upgradeTypes[]` como identificador canonico del efecto
- `compatName`
- `baseDrain` y `fusionLimit`
- `maxRank`
- `isExilus`
- `modClass`
- `isWeaponAugment`
- incompatibilidades

## Lo que sigue siendo problema

- `levelStats` sigue siendo texto por rango
- parte de la semantica condicional no esta estructurada
- los casos especiales no pueden inferirse todos sin apoyo adicional

## Regla actual

- `upgradeTypes[]` define que modifica el mod
- el valor numerico no debe parsearse libremente en runtime
- el builder necesita una fuente estructurada o un override controlado

