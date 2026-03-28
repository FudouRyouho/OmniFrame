# Navigation Shell Status

> Estado: activo
> Rol: estado operativo del shell, HUD, rutas y layout activo
> Fuente de verdad de: implementado, pendiente y bloqueantes del track de UI shell
> No usar para: contratos del engine o schema de datos
> Depende de: `../../domains/ui/shell-and-navigation.md`
> Ultima actualizacion: 2026-03-28 (LoadoutProvider integrado en HUD + Arsenal)

## Objetivo

Dar al proyecto una shell estable que pueda alojar equipment, arsenal, options y profile
sin mezclar navegacion con calculo.

## Implementado

- shell basico con HUD (`Hud` + area de contenido)
- menu/dialogo principal (`DialogMenu` / `MenuBar`) enlazado a rutas con `label` en `App.tsx`
- `DialogMenu` actualizado con rutas principales (`Arsenal`, `Equipment`, `Profile`, `Options`) y grupo `Dev` expandible inline en el mismo modal
- `DialogMenu` cierra al navegar (click de link) y también al detectar cambio de `pathname` como respaldo
- `EquipmentView` como landing (marcada como deprecated — ver deuda NS-DT-13)
- el proyecto compila: `npm run build` estable desde la estabilizacion minima de tipos (S2)
- estructura de rutas anidadas bajo `/equipment` implementada en `App.tsx` con layout route
- `EquipmentContext` operativo: `hovered`, `search`, `order` compartidos entre toolbar y vistas
- `useViewFilter` hook con soporte de categorias y subcategorias por vista
- toolbar principal (`EquipmentToolbar`) con tres filas: hover label / tabs + orden + busqueda / filtros dinamicos
- toolbar de equipment visible solo en rutas de listado (`/equipment/<vista>`); en rutas de detalle (`/equipment/<vista>/:id`) se oculta para evitar filtros sin contexto
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
- rutas de detalle de equipment usan slug basado en `name` para URL amigable; la resolucion del item mantiene `uniqueName` como identificador principal (via `state`) con fallback por slug/segmento final/identificador para recarga directa
- Warframe detail operativo con header (imagen, nombre, descripcion), bloque de stats con `StatRow`, grilla de habilidades con `FormattedText` y CTA de retorno
- separacion aplicada para detalle de equipment: `features/equipment/detail/` contiene vistas de detalle; `features/equipment/details/` concentra componentes compartidos
- `fetchSingle` añadido a los 4 loaders nuevos: `companionData`, `vehicleData`, `archwingWeaponData`, `arcaneData`
- Helminth filtrado de `warframes.json` en el pipeline de generacion (DF-G9 resuelto)
- `ItemsGrid` reducido a grilla simple; ya no decide virtualización ni expone knobs técnicos de rendimiento
- virtualización localizada solo en `WeaponsView` y `ModsView` via `VirtualizedItemsGrid`, con contrato visual mínimo (`minColumnWidth`, `gap`, `overscan`)
- Warframes y el resto de vistas mantienen grilla simple; esto preserva que el layout actual siga siendo transicional y no diseño final
- IndexedDB para cache de datos de equipo en `lib/db.ts`
- `HudHeader` estabilizado con bloque izquierdo fijo de `48px`; overlays de usuario/layout en `hover/open` ya no empujan el título ni el contenido principal
- `HudHeader` muestra título de página derivado de ruta (placeholder transicional) para `equipment`, `details`, `arsenal`, `profile`, `options` y `dev`
- `HubFooter` reorganizado bajo `features/hud/footer/` como footer principal de shell; muestra `Back` en toda zona distinta de `home` y delega acciones contextuales a sub-footers por `footerKind`
- `ItemsDetailsFooter` agregado para rutas de detalle (`Build`, `Similar`, `Wiki`) y `ArsenalFooter` activado como placeholder funcional para la ruta `/arsenal`
- `ContextualActionsProvider` reemplazado por `ShellProvider` — centraliza toda resolución de `useLocation()` con contrato tipado: `zone`, `view`, `isDetail`, `entityId`, `footerKind`, `pageTitle`. La lógica de `resolvePageTitle` movida desde `HudHeader` a función pura `resolveShell()` en `providers/Shell/shell-context.tsx`. El archivo residual de `providers/ContextualActions/` ya fue eliminado.
- `LoadoutProvider` integrado en runtime con jerarquía `DataState → Loadout → Menu → Shell → Theme → App`
- `HudHeader` consume el loadout activo real desde el provider y reemplaza el texto hardcodeado del layout
- `ArsenalFooter` consume el estado del provider (cargando / error / canales activos)
- `ArsenalView` deja de ser stub vacío y actúa como consumer mínimo de verificación del builder

## Pendiente

- [integration] conectar `search` y `order` del contexto a los hooks de filtrado de cada vista (bloqueado por D-4)
- [integration] discusion de arquitectura de `use-items-filters` — desacoplamiento por kind sin mezclar responsabilidades con shell
- wiring real de `Options` y `Profile`; extender `Arsenal` desde consumer minimo a UI operativa
- extender el vertical slice actual del builder con seleccion real desde equipment y persistencia
- deprecar `features/arcanes/` y `features/mods/` — su logica util se migra a `features/equipment/`
- conectar handlers reales de acciones contextuales del `HubFooter` (actualmente placeholder visual)

## Bloqueantes

- [externo/integration] el builder sigue siendo un vertical slice mínimo; faltan selección real desde equipment, persistencia y wiring de Profile/Options
- [externo/engine] Backward Resolver (B4) pendiente de contratos de UI

## Lectura operativa del track

- `views-architecture.md` para arquitectura técnica de las vistas y hooks
- `questions.md` para decisiones locales de filtros y frontera con integration
- `../../overview/placeholder-minimums.md` para vistas stub y HUD
- `debt.md` para deuda tecnica local del shell y de las rutas
- `../../reference/audits/runtime-layer-map.md`
- `../../reference/audits/repo-structure-snapshot.md`
