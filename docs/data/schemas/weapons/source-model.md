---
Estado: "referencia"
Rol: "Describir la estructura canónica de datos de armas consumida por el proyecto"
Version: "v0.0.3"
Impacto_ID: "data-weapons-schema"
Fidelidad_Fisica: "Project/src/shared/types/weapon.ts"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-06-01"
---

# Weapons Source Model

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

- `./weapons-attack-structure.md`
- `./weapons-known-gaps.md`
