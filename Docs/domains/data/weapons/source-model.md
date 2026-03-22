# Weapons Source Model

> Estado: activo
> Rol: describir la estructura canonica de datos de armas consumida por el proyecto
> Fuente de verdad de: modelo de fuente para `weapons.json`
> No usar para: backlog del builder o decisiones de UI
> Ultima actualizacion: 2026-03-22

## Fuente principal

`@wfcd/items` es la fuente primaria del dataset de armas. La wiki sirve para validar
semantica y detectar gaps, no para redefinir la estructura base.

## Regla estructural

- campos top-level pertenecen al arma
- `attacks[]` pertenece a cada modo de ataque
- el proyecto no debe desnormalizar campos del arma dentro de cada ataque

## Top-level relevantes

- `criticalChance`, `criticalMultiplier`, `procChance`
- `fireRate`, `magazineSize`, `reloadTime`, `multishot`, `accuracy`
- `range`, `comboDuration`, `followThrough`, `heavyAttackDamage`
- `damage` y `totalDamage` top-level solo como referencia, no como base de calculo

## Regla de calculo

Para builder y simulacion, la fuente de verdad del dano de arma es `attacks[]`.

## Donde seguir

- `attack-structure.md`
- `known-gaps.md`

