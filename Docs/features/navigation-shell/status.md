# Navigation Shell Status

> Estado: activo
> Rol: estado operativo del shell, HUD, rutas y layout activo
> Fuente de verdad de: implementado, pendiente y bloqueantes del track de UI shell
> No usar para: contratos del engine o schema de datos
> Depende de: `../../domains/ui/shell-and-navigation.md`
> Ultima actualizacion: 2026-03-24

## Objetivo

Dar al proyecto una shell estable que pueda alojar equipment, arsenal, options y profile
sin mezclar navegacion con calculo.

## Implementado

- shell basico con HUD (`Hud` + area de contenido)
- menu/dialogo principal (`DialogMenu` / `MenuBar`) enlazado a rutas con `label` en `App.tsx`
- `EquipmentView` como landing (marcada como deprecated — ver deuda NS-DT-13)
- el proyecto compila: `npm run build` estable desde la estabilizacion minima de tipos (S2)
- estructura de rutas anidadas bajo `/equipment` implementada en `App.tsx` con layout route
- `EquipmentContext` operativo: `hovered`, `search`, `order` compartidos entre toolbar y vistas
- `useViewFilter` hook con soporte de categorias y subcategorias por vista
- toolbar principal (`EquipmentToolbar`) con tres filas: hover label / tabs + orden + busqueda / filtros dinamicos
- toolbars dedicadas por vista: Warframes, Weapons, Companions, Mods, Arcanes, Vehicles, ArchwingWeapons
- `FilterIcon` como componente compartido para iconos de filtro con `useDataState`
- ruta default `/equipment` redirige a `/equipment/warframes`
- migracion de `features/dev/example/` a `features/equipment/` completada (NS-DT-15 cerrada)
- carpeta `features/dev/example/` eliminada (NS-DT-16 cerrada)
- vistas con datos operativas: Warframes, Weapons (primary+secondary+melee), Mods, Arcanes, Companions, ArchwingWeapons, Vehicles (necramechs+archwings)
- todas las 7 vistas de equipment tienen datos reales
- ruta `/*` captura `/` y redirige a `/warframes` — `EquipmentView.tsx` desconectada de rutas activas (P-1 resuelto)
- ruta `/` redirige a `/equipment/warframes` via `<Navigate>` — estructura `/equipment/*` preservada
- rutas de detalle placeholder bajo `/equipment/{warframes,weapons,companions,vehicles,archwing-weapons}/:uniqueName`
- `fetchSingle` añadido a los 4 loaders nuevos: `companionData`, `vehicleData`, `archwingWeaponData`, `arcaneData`
- Helminth filtrado de `warframes.json` en el pipeline de generacion (DF-G9 resuelto)
- Virtualización de grids en `ItemsGrid` via `VirtualizedItemsGrid` con configuración por vista (`itemSize`, `overscan`, `computeColumnCount`, etc.)
- IndexedDB para cache de datos de equipo en `lib/db.ts`

## Pendiente

- conectar `search` y `order` del contexto a los hooks de filtrado de cada vista (bloqueado por D-4)
- discusion de arquitectura de `use-items-filters` — desacoplamiento en clase con funciones base por kind
- caja de layout activo en HUD
- enrutamiento y wiring de vistas stub (Options, Profile, Arsenal)
- wiring real con el futuro builder
- provider de layout visible para la UI
- deprecar `features/arcanes/` y `features/mods/` — su logica util se migra a `features/equipment/`

## Bloqueantes

- el builder engine aun no existe
- `layout-context.tsx` sigue como placeholder
- la arquitectura de integracion todavia no esta consolidada

## Lectura operativa del track

- `views-architecture.md` para arquitectura técnica de las vistas y hooks
- `../../overview/placeholder-minimums.md` para vistas stub y HUD
- `debt.md` para deuda tecnica local del shell y de las rutas
- `../../reference/audits/runtime-layer-map.md`
- `../../reference/audits/repo-structure-snapshot.md`
