# Builder Engine File Structure

> Estado: activo
> Rol: definir la estructura de archivos esperada para el track builder engine
> Fuente de verdad de: ubicacion del motor y sus modulos
> No usar para: formulas o estado de datos
> Depende de: `status.md`
> Ultima actualizacion: 2026-03-22

## Estructura objetivo

```text
features/arsenal/
  ArsenalView.tsx
  engine/
    index.ts
    weapon.ts
    warframe.ts
    abilities.ts
```

## Regla de ubicacion

- el motor vive en `features/arsenal/engine/`
- no vive en `src/lib/` porque es feature-specific
- `ArsenalView` es su consumidor principal en v1

## Desarrollo inicial (S6)

- la **vista** de inspeccion y prueba vive bajo rutas `/dev/*` (ver `s6-horizontal-minimum.md`)
- el **codigo** del motor puede seguir esta estructura desde el primer merge; si hiciera falta un
  prototipo temporal, no debe desviar el destino objetivo de `engine/` bajo arsenal

