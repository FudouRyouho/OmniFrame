# Builder Engine V1

> Estado: activo
> Rol: definir el contrato estable del motor de cálculo en v1
> Fuente de verdad de: principios y limites del engine
> No usar para: estado de implementacion del track
> Última actualización: 2026-03-21

## Principios

- el motor es una funcion pura
- no conoce React
- no hace fetch
- consume datos ya resueltos por la capa de integración
- puede calcular layouts parciales

## Regla de alcance v1

v1 debe leerse como una calculadora estática de resultados directos, no como un
simulador temporal.

Queda explícitamente fuera de v1:

- modelado de DoT
- simulación de tiempo
- daño total acumulado por ticks
- evolución temporal de stacks y ramps
- resistencias por facción y health-type
- condicionales complejas del tipo on-kill, on-hit, aim o enemy-state

## Contrato conceptual

```ts
calculate(layout, context) -> EngineOutput
```

## Entrada

`Layout` debe describir entidades equipadas y mods por `uniqueName` + `rank`.

`CalculationContext` debe contener estado de cálculo variable, por ejemplo:
- condiciones activas
- stacks
- flags simples de contexto

## Alcance v1

- stats base de armas
- mods de arma
- stats base de warframe
- mods de warframe
- primer soporte de habilidades
- soporte directo de modificadores simples que no requieran eje temporal

Fuera de scope inicial:
- companions
- companion weapons
- necramech
- archwing
- k-drive
- dots
- simulación de DPS por ventana de tiempo
- rotación real de estados del enemigo

## Dependencias fuertes

- fuente numérica de mods para cálculo
- schema estable de abilities
- capa de integración que resuelva datos y provea contexto

## Donde seguir

- `../../features/builder-engine/status.md`
- `../../features/builder-engine/dependencies.md`
- `layout-contract.md`
- `context-contract.md`
- `output-contract.md`
- `formula-overview.md`
- `../integration/runtime-composition.md`
