# Navigation Shell Questions

> Estado: activo
> Rol: registrar preguntas abiertas locales del track navigation shell
> Fuente de verdad de: decisiones pendientes del shell y su frontera con integration
> Ultima actualizacion: 2026-03-26

## NS-Q1 - D-4 Arquitectura de filtros por kind (UI + Integration)

Pregunta:
- como desacoplar la logica de filtrado por kind para conectar `search` y `order` sin cargar responsabilidad extra al shell

Nota de dominio:
- shell: expone estado de UI (`hovered`, `search`, `order`) y navegación
- integration: aplica filtrado, ordenamiento y composición por kind

Opciones de debate:
1. punto -> opcion A: funciones puras reutilizables por kind (`filterByName`, `filterByMasteryReq`, etc.) y composición por vista
2. punto -> opcion B: hook unico de integration (`useItemsFilter(kind, items, params)`) que encapsula reglas por kind
3. punto -> opcion C: extender `use-items-filters` actual con configuración declarativa por kind

Impacto en D-5:
- define cómo se conecta `EquipmentContext.search/order` a cada vista
- define dónde vive la semántica de filtros de browsing

## NS-Q2 - Contrato de selección `onSelect` para detalle/build

Pregunta:
- el shell debe solo emitir `onSelect(item)` o también exponer un contrato de navegación/estado para detalle y builder

Opciones de debate:
1. punto -> opcion A: shell solo emite `onSelect`; integration resuelve navegación y estado
2. punto -> opcion B: shell emite `onSelect` y `onNavigateToDetail`; integration resuelve estado de builder
3. punto -> opcion C: shell emite eventos tipados (`select`, `open-detail`, `queue-build`) y integration decide consumo

Impacto:
- afecta integración con rutas de detalle
- afecta frontera con estado de layout del Arsenal
