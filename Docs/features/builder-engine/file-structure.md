# Builder Engine File Structure

> Estado: activo
> Rol: definir la estructura de archivos esperada para el track builder engine
> Fuente de verdad de: ubicacion del motor y sus modulos
> No usar para: formulas o estado de datos
> Depende de: `status.md`
> Ultima actualizacion: 2026-03-21

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

