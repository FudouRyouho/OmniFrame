---
Estado: "activo"
Rol: "Definir el rol de la UI shell y sus responsabilidades"
Version: "v0.0.2"
Impacto_ID: "UI-UX-Shell"
Fidelidad_Fisica: "Project/src/providers/Shell/"
Fecha_de_creacion: "2026-04-01"
Fecha_de_actualizacion: "2026-04-20"
---

# Shell And Navigation

## Principios

- la UI renderiza, no calcula
- la UI no redefine semantica de datos
- la UI consume estado resuelto por providers y capas de datos
- el shell global debe poder mostrar el layout activo sin acoplarse al motor
- toolbars, vistas y filtros visibles no convierten por si solos un vocabulario visual en contrato taxonomico compartido
- `subCategory` puede existir como lenguaje de UI mientras la semantica inferior compartida siga abierta en integration/data

## Piezas actuales

- HUD basico
- menu/dialogo principal
- `EquipmentLayout` con rutas anidadas bajo `/equipment/*` (7 sub-rutas)
- `OmniToolbar` con tres filas: hover label / tabs de navegacion + orden + busqueda / filtros dinamicos por vista
- `EquipmentContext` con `hovered`, `search`, `order`
- toolbars dedicadas por vista con `FilterIcon`, `useDataState` y estado visual local via `use-view-filter`
- 7 vistas de equipment operativas con datos reales bajo `domains/equipment/view/`
- `EquipmentView` — reemplazada por arquitectura de vistas en `view/*` (Completado)
- `domains/arcanes/` — eliminada (2026-04-14)

## Pendientes estructurales

- conectar `search` y `order` del contexto a los hooks de filtrado (Generalización de Toolbars — D-4 Completado)
- mantener la estructura genérica de toolbars como estándar de integración
- no confundir estado visual local de toolbar con filtrado real de dataset: hoy `use-view-filter`, `use-items-filters` y `EquipmentContext` siguen separados
- caja de layout activo en HUD
- rutas y componentes para Options, Profile, Arsenal (lectura vigente en `./shell-status.md`)
- wiring definitivo hacia el builder

## Dependencias

- `../integration/README.md`
- `./shell-status.md`
- `../engine/status.md`
