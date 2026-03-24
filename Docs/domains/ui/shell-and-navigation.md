# Shell And Navigation

> Estado: activo
> Rol: definir el rol de la UI shell y sus responsabilidades
> Fuente de verdad de: limites de la capa UI
> No usar para: calculo del builder o SSoT de datos
> Ultima actualizacion: 2026-03-22

## Principios

- la UI renderiza, no calcula
- la UI no redefine semantica de datos
- la UI consume estado resuelto por providers y capas de datos
- el shell global debe poder mostrar el layout activo sin acoplarse al motor

## Piezas actuales

- HUD basico
- menu/dialogo principal
- EquipmentView
- vistas parciales de mods

## Pendientes estructurales

- caja de layout activo
- rutas y componentes para Arcanes, Options, Profile, Arsenal (contrato en `../../overview/placeholder-minimums.md`)
- wiring definitivo hacia el builder

## Dependencias

- `../integration/runtime-composition.md`
- `../../features/navigation-shell/status.md`
- `../../overview/placeholder-minimums.md`

