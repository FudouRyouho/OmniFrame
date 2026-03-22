# Builder Calculation Context

> Estado: activo
> Rol: definir la estructura de `CalculationContext` para el builder engine
> Fuente de verdad de: contrato de contexto variable del motor
> No usar para: resultado del motor o wiring de UI
> Depende de: `builder-v1.md`
> Última actualización: 2026-03-21

## Contrato conceptual

```ts
interface CalculationContext {
  activeConditions: string[]
}
```

## Uso esperado

`CalculationContext` modela el estado variable que no pertenece al layout fijo, por ejemplo:
- condiciones activas
- stacks
- flags de contexto simples

## Regla v1

En v1 el motor puede asumir máximo rendimiento para condiciones y stacks.
Cuando eso ocurra:
- el supuesto debe documentarse
- la metadata resultante debe poder mostrarse en UI

En v1 no existe eje temporal dentro del contexto:
- no hay timeline
- no hay ticks
- no hay duraciones activas corriendo
- no hay simulación por segundos

## Regla futura

La evolución natural es que el provider mantenga este contexto y recalcule el motor
cuando cambie.
