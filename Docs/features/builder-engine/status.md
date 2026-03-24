# Builder Engine Status

> Estado: activo
> Rol: estado operativo del track del motor de calculo
> Fuente de verdad de: implementado, pendiente y bloqueantes del engine
> No usar para: reglas de UI o detalle del pipeline semantico
> Depende de: `../../domains/engine/builder-v1.md`
> Ultima actualizacion: 2026-03-22

## Objetivo

Implementar un motor puro que calcule un layout de Warframe sin acoplarse a React.

## Alcance real de v1

v1 es un calculador estatico de stats y resultados directos.

No incluye:

- DoT
- simulacion temporal
- dano acumulado por ticks
- enemy-state loops
- kill loops

## Implementado

- existe documentacion base del contrato del motor
- existe una propuesta de `Layout` y `CalculationContext`
- esta documentado el scope v1
- esta documentada la necesidad de una capa de integracion separada
- existe base documental para integrar `Archon Shards` por fases

## Implementado (acotado, no es el engine completo)

- `Project/src/lib/abilityCalc.ts`: calculo de valores de stats de habilidad a partir de
  `upgradeBy` + variables de motor (`EngineVars`), resolucion de labels `|valN|` para UI.
  Es util para vistas y herramientas dev; **no** implementa `calculate(layout, context)` ni
  un layout de equipo completo.

## No implementado aun

- `features/arsenal/engine/` real
- `calculate(layout, context)` funcional segun `builder-v1.md`
- `EngineOutput` real usado por la app de forma transversal
- provider de build conectado al motor

## Bloqueantes

- fuente numerica confiable para mods
- soporte parcial de abilities
- faltan decisiones practicas sobre condiciones, stacks y overrides
- no existe aun una capa de integracion viva para layout activo

## Dependencias fuertes

- `../semantic-pipeline/status.md`
- `../../domains/integration/runtime-composition.md`
- futura referencia de mecanicas del juego en `../../reference/wiki/`
- `archon-shards-integration.md` para entrada gradual de shards

## Desbloquea

- Arsenal real
- layout activo en HUD
- comparacion de builds por resultados directos

## Referencias legacy utiles

- `../../reference/audits/runtime-layer-map.md`
- `../../reference/audits/repo-structure-snapshot.md`
- `../../reference/audits/component-usage-audit.md`

## S6 — minimo horizontal

Vision y limites del corte actual (dev, engine acotado, capa intermedia, UI texto):
- `s6-horizontal-minimum.md`

## Lectura operativa del track

- `../../overview/placeholder-minimums.md` para entrada, salida y consumer esperado antes de implementacion completa
- `file-structure.md` para ubicacion del motor
- `mod-value-source.md` para fuente numerica de mods
- `gaps.md` para bloqueantes y deudas locales
- `../../domains/data/mods/upgrade-taxonomy.md` para semantica de mods
- `../../domains/data/weapons/` para limites reales de armas
- `../../domains/data/abilities/` para vocabulario y formulas de habilidades
