# Navigation Shell Status

> Estado: activo
> Rol: estado operativo del shell, HUD, rutas y layout activo
> Fuente de verdad de: implementado, pendiente y bloqueantes del track de UI shell
> No usar para: contratos del engine o schema de datos
> Depende de: `../../domains/ui/shell-and-navigation.md`
> Ultima actualizacion: 2026-03-22

## Objetivo

Dar al proyecto una shell estable que pueda alojar equipment, arsenal, mods,
arcanes, options y profile sin mezclar navegacion con calculo.

## Implementado

- shell basico con HUD
- menu/dialogo principal
- equipment view funcional

## Pendiente

- caja de layout activo
- rutas faltantes
- vista de arcanos
- wiring real con el futuro builder
- provider de layout visible para la UI

## Bloqueantes

- el builder engine aun no existe
- `layout-context.tsx` sigue como placeholder
- la arquitectura de integracion todavia no esta consolidada

## Lectura operativa del track

- `debt.md` para deuda tecnica local del shell y de las rutas
- `../../reference/audits/runtime-layer-map.md`
- `../../reference/audits/repo-structure-snapshot.md`
