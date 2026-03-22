# Builder Output Contract

> Estado: activo
> Rol: definir la estructura conceptual de `EngineOutput`
> Fuente de verdad de: contrato de salida del motor
> No usar para: formulas internas o backlog de implementacion
> Depende de: `builder-v1.md`
> Ultima actualizacion: 2026-03-21

## Regla base

El motor debe devolver datos calculados, no componentes ni estado de React.

## Pieza minima

```ts
interface StatResult {
  base: number
  calculated: number
}
```

## Estructura conceptual

```ts
interface EngineOutput {
  warframe?: WarframeResult
  primary?: WeaponResult
  secondary?: WeaponResult
  melee?: WeaponResult
  abilities?: AbilityResult[]
}
```

## Implicacion para UI

La UI puede mostrar:
- solo `base` cuando no hay diferencia
- `base -> calculated` cuando el valor cambia

## Pregunta todavia abierta

La granularidad final del output sigue abierta:
- solo resultados finales
- o tambien breakdowns, pools y metadata intermedia

Ver:
- `../../features/builder-engine/questions.md`

