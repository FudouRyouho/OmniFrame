# Navigation Shell Debt

> Estado: activo
> Rol: agrupar deuda tecnica local del shell, rutas, HUD y vistas relacionadas
> Fuente de verdad de: deudas locales del track navigation shell
> No usar para: contrato del engine o formulas
> Depende de: `status.md`
> Ultima actualizacion: 2026-03-28

## Deudas activas

### NS-DT-2 - Locale switching

- falta selector de locale real
- `Options` es el lugar previsto

### NS-DT-3 - `pages/` deprecados

- siguen presentes por compatibilidad
- no deben extenderse

### NS-DT-5 - Arquitectura de rutas

- las rutas siguen inline en `App.tsx`
- las rutas anidadas de `/equipment/*` ya estan como nested routes; el resto sigue plano

### NS-DT-18 - Vistas de detalle placeholder

- `features/equipment/detail/` contiene placeholders minimos para Warframe, Weapon, Companion, Vehicle, ArchwingWeapon
- cada vista resuelve el item por `uniqueName` via `fetchSingle` del loader correspondiente
- el contenido real (panel de stats, wiring con loadout activo) se implementa cuando el vertical slice actual cubra seleccion real, B4 y persistencia
- `pages/WarframeDetail.tsx` y `pages/WeaponDetail.tsx` siguen activas bajo `/warframes/:name` y `/weapons/:name` (legacy)
- las rutas legacy se mantienen hasta que las vistas de detalle nuevas sean funcionales

### NS-DT-7 - `Nav.tsx`

- legacy sin uso activo

### NS-DT-8 - Layout activo en HUD

- `HudHeader` ya consume un resumen real del loadout activo
- falta endurecer su presentacion final y conectarlo con seleccion real desde equipment y persistencia de Profile

### NS-DT-9 - Menu incompleto

- `Options` y `Profile` siguen sin wiring real
- `Arsenal` ya existe como ruta activa, pero sigue en consumer minimo del builder
- `DialogMenu` consume `routes` plano de `App.tsx`; en el futuro debe entender jerarquia de rutas para poder navegar a sub-rutas de equipment

### NS-DT-10 - CSS

- reorganizacion pendiente

### NS-DT-12 - Profile

- falta estructura de layouts/builds del usuario

### NS-DT-13 - EquipmentView deprecada

- `features/equipment/EquipmentView.tsx` marcada como deprecated
- reemplazada por la estructura de vistas bajo `features/equipment/view/`
- mantener hasta que todas las vistas nuevas esten operativas con datos reales

### NS-DT-14 - features/arcanes/ y features/mods/ deprecadas

- `features/arcanes/ArcanesView.tsx` — stub sin implementacion; deprecada
- `features/mods/ModsView.tsx` — implementada pero su logica util se migra a `features/equipment/view/`
- ambas carpetas se mantienen hasta completar la migracion a `features/equipment/`

### NS-DT-19 - Tippy.js incompatible con React 19

- `@tippyjs/react` v4.2.6 usa la API de `ref` antigua eliminada en React 19
- genera warning en consola: `Accessing element.ref was removed in React 19`
- no es bloqueante hoy, pero puede romperse en futuras versiones de React
- `CustomPopover.tsx` es el consumer principal — cualquier refactor pasa por ahí
- opciones: esperar actualización de Tippy, migrar a Floating UI o Radix Tooltip
- no tocar hasta que sea necesario o hasta que Tippy publique soporte para React 19

### NS-DT-13 - EquipmentView deprecada ✓

- `features/equipment/EquipmentView.tsx` reemplazada por la estructura de vistas bajo `features/equipment/view/`
- condicion de cierre cumplida: todas las 7 vistas operativas con datos reales
- `EquipmentView.tsx` se mantiene en disco para extraccion manual de codigo util — NO eliminar hasta revision manual
- desconectada de rutas activas: `App.tsx` ya no la importa ni la usa
- la ruta `/` redirige a `/equipment/warframes` via `<Navigate>` — estructura `/equipment/*` preservada
- cerrada: 2026-03-24

### NS-DT-15 - Migracion de dev/example a equipment ✓

- todo el codigo de `features/dev/example/` fue movido a `features/equipment/` segun la estructura definida
- nomenclatura `.dev.tsx` eliminada en el proceso
- cerrada: 2026-03-24

### NS-DT-16 - Carpetas residuales de dev/example ✓

- `features/dev/example/` eliminada completamente
- cerrada: 2026-03-24

### NS-DT-17 - VehiclesView sin fuente de datos ✓

- Necramechs y Archwings identificados en `warframe-items` y filtrados a `vehicles.json`
- `VehiclesView` operativa con datos reales (2 necramechs + 5 archwings)
- K-Drives fuera de scope por decision del usuario
- cerrada: 2026-03-24

## Deudas Recientes

### NS-DT-20 - Virtualización Temporal

- Implementación en fase de pruebas; sujeta a cambios estructurales.
- la virtualización ya quedó localizada en `WeaponsView` y `ModsView`; resta validar si `VirtualizedItemsGrid` sigue valiendo como primitiva compartida o si termina absorbido por cada vista
- Referencia: [Docs/decisions/implementaciones-temporales.md](../../decisions/implementaciones-temporales.md)

### NS-DT-21 - Tipado Nuevo Pendiente

- Nuevos tipos (Arcane, Companion, etc.) requieren documentación de overrides.
- Semántica cambiada de warframe-items; documentar cambios.
- Referencia: [Docs/decisions/implementaciones-temporales.md](../../decisions/implementaciones-temporales.md)

### NS-DT-22 - ShellProvider transicional

- `ShellProvider` centraliza header/footer/zone desde routing y convive con `LoadoutProvider` como frontera de integracion actual
- actualmente deriva estado desde `pathname` y usa `footerKind` para resolver placeholders de shell (`item-details`, `arsenal`)
- pendiente: mover la resolucion de shell hacia metadata de rutas o una frontera mas estable sin reabrir OQ-2
