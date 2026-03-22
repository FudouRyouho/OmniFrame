# Warframes Source Model

> Estado: activo
> Rol: definir el modelo mínimo de datos de Warframe que el proyecto debe consumir
> Fuente de verdad de: requerimientos de datos base para `warframes.json` y capas derivadas
> No usar para: fórmulas finales del engine o detalles de UI
> Última actualización: 2026-03-22

## Objetivo

Este documento fija el modelo mínimo que OmniFrame necesita para calcular Warframes en
v1 y para abrir la puerta a `Archon Shards` sin tener que rediseñar la base después.

## Fuente base

El proyecto parte del dataset normalizado del fork de `warframe-items`.

La expectativa no es copiar cada campo del dataset externo, sino garantizar que la
capa interna exponga un modelo estable para el engine.

## Modelo mínimo para v1

El engine necesita, como mínimo:

- `uniqueName`
- `name`
- `health`
- `shield`
- `armor`
- `energy`
- `abilities[]`

Campos útiles pero no bloqueantes en la primera iteración:

- `sprintSpeed`
- `polarities`
- `auraPolarity`
- `passive`
- `shieldRecharge`
- `healthRegen`

## Regla de diseño

Los stats base del Warframe y los pools de modificadores no son la misma cosa.

Separacion recomendada:

- datos fuente del frame: vida, escudo, armadura, energía
- pools derivados de build: `STR`, `DUR`, `RNG`, `EFF`
- metadata de contexto: condiciones, stacks, thresholds

## Variables derivadas que el engine debe exponer

Aunque no existan como stats base del Warframe, el motor necesita producir:

- `abilityStrength`
- `abilityDuration`
- `abilityRange`
- `abilityEfficiency`

Estas variables son necesarias para:

- fórmulas de habilidad
- visualización de build
- soporte de `Archon Shards`

## Relevancia para Archon Shards

Para soportar shards de forma semi-completa, este modelo debe permitir:

- sumar vida plana
- sumar escudo plano
- sumar energía plana
- sumar armadura plana
- sumar `Ability Strength`
- sumar `Ability Duration`
- evaluar thresholds simples como `maxEnergy > 500`

## No mezclar

No deben mezclarse en el modelo base del Warframe:

- resistencias de enemigos
- estado del objetivo
- daño por tiempo
- timers de combate

Eso pertenece a otras capas del engine.

## Donde seguir

- `../weapons/source-model.md`
- `../../engine/builder-v1.md`
- `../../engine/formula-overview.md`
- `archon-shards.md`
