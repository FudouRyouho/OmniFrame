# Navigation Shell Debt

> Estado: activo
> Rol: agrupar deuda tecnica local del shell, rutas, HUD y vistas relacionadas
> Fuente de verdad de: deudas locales del track navigation shell
> No usar para: contrato del engine o formulas
> Depende de: `status.md`
> Ultima actualizacion: 2026-03-21

## Deudas activas

### NS-DT-2 - Locale switching

- falta selector de locale real
- `Options` es el lugar previsto

### NS-DT-3 - `pages/` deprecados

- siguen presentes por compatibilidad
- no deben extenderse

### NS-DT-4 - Mods y Arcanos

- `ModsView` existe pero no esta en rutas
- falta vista de arcanos

### NS-DT-5 - Arquitectura de rutas

- las rutas siguen inline en `App.tsx`

### NS-DT-7 - `Nav.tsx`

- legacy sin uso activo

### NS-DT-8 - Layout activo en HUD

- falta la caja de layout activo
- depende de `layout-context.tsx` y del builder

### NS-DT-9 - Menu incompleto

- faltan rutas y wiring de `Options`

### NS-DT-10 - CSS

- reorganizacion pendiente

### NS-DT-12 - Profile

- falta estructura de layouts/builds del usuario

