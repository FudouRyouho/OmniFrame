# Estado Actual

> Estado: activo
> Rol: snapshot ejecutivo del proyecto y de los tracks principales
> Fuente de verdad de: estado operativo general
> No usar para: detalle de schema, formulas o decisiones historicas
> Depende de: `../features/`
> Ultima actualizacion: 2026-03-25

## Resumen

OmniFrame esta en una fase temprana de consolidacion.
La base de datos y la estructura general existen, pero el proyecto todavia no tiene
un motor de builder completo segun `builder-v1.md`. La documentacion de estabilizacion
(`stabilization-backlog.md`) describe el cierre progresivo de S1–S4 y el trabajo pendiente
de S5–S6.

El objetivo inmediato de `Docs/` es separar:
- conocimiento estable
- trabajo activo
- decisiones cross-cutting
- referencias de mecanicas del juego

## Lo que ya funciona

- pipeline de datos principal via `generate-data.mjs`
- `weapons.json`, `warframes.json`, `mods.json` (artefactos esperados del pipeline cuando se publican)
- `ability-stats.override.json` como override activo en runtime
- shell basico de UI con HUD y menu principal
- **sistema de tipos formales en `Project/src/lib/types/` (12 módulos)**:
  - **Core**: `base.ts` (Kind, BaseItem), `ability.ts` (AbilityGroup, AbilityStats), `damage.ts` (DamageType, WeaponAttack)
  - **Equipamiento**: `weapon.ts` (Weapon), `warframe.ts` (Warframe), `mod.ts` (Mod)
  - **Nuevos tipos** (no en docs legacy): `arcane.ts` (Arcane), `companion.ts` (Companion), `archwing-weapon.ts` (ArchwingWeapon), `vehicle.ts` (Vehicle)
  - **Legacy/Transitional**: `legacy.ts` (tipos viejos para retrocompatibilidad)
  - Re-exportados en `index.ts` (barrel export)
- parser semantico `utilities/parse-semantic.mjs` y merge mecanico documentado hacia el override
- split de tipos en `Project/src/lib/types/`
- `npm run build` en verde (TypeScript + Vite) tras el saneamiento minimo de tipos
- `abilityCalc.ts`: calculo acotado de valores de stats de habilidad y labels para UI (no es el engine de builds)
- estructura de rutas anidadas bajo `/equipment/*` con layout route, redirect a `/equipment/warframes` por defecto
- `EquipmentContext` con `hovered`, `search`, `order` compartidos entre toolbar y vistas
- `useViewFilter` hook con soporte de categorias y subcategorias configurables por vista
- toolbar de equipment con tres filas: hover label / tabs de navegacion + orden + busqueda / filtros dinamicos por vista
- sistema de virtualización configurable por vista (`ItemsGrid` + `VirtualizedItemsGrid`) para límites de tamaño de lista altos
  - **WarframesView**: virtualización deshabilitada (threshold: 250, lista pequeña 114 items)
  - **WeaponsView**: virtualización activa (threshold: 100, itemSize: 175px, overscan: 4)
  - **ModsView**: virtualización activa (threshold: 80, itemSize: 180px, overscan: 5)
  - **CompanionsView, VehiclesView, ArcanesView, ArchwingWeaponsView**: virtualización activa (threshold: 100, defaults)
- cache de datos persistente en IndexedDB (`lib/db.ts`, Dexie v1+) con fallback a JSON para soporte offline y carga rápida
  - Versionado automático: `DB_VERSION = 1` con invalidación si cambia

## Decisiones Recientes

- [Virtualización por Vista](../decisions/virtualization-per-view.md): Implementación granular temporal.
- [Estrategia de Versionado en IndexedDB](../decisions/indexeddb-versioning-strategy.md): Persistencia con Dexie.
- [Implementaciones Temporales](../decisions/implementaciones-temporales.md): Registro de cambios pendientes.

## Referencias

- [Open Questions](../decisions/open-questions.md): OQ-6 a OQ-8 agregadas.
  - 8 tablas: warframes, weapons, mods, arcanes, companions, vehicles, archwingWeapons, metadata
- toolbars dedicadas por vista con `FilterIcon` y `useDataState`

## Lo que esta en progreso

### 1. Semantic Pipeline

- hay parser funcional
- la cobertura de los `.md` semanticos sigue siendo parcial
- el merge mecanico de `groups` (parsed -> override editable) esta cubierto por
  `merge-semantic-groups.mjs`; la revision de `upgradeBy` sigue siendo manual
- `upgradeBy` sigue requiriendo asignacion manual tras el merge de `groups`

Documento principal:
- `../features/semantic-pipeline/status.md`

### 2. Data Foundation

- las fuentes de verdad ya estan bastante claras
- siguen abiertos gaps de rank bonuses, scaling y valores numericos de mods
- `compatName` ya esta preservado, pero su explotacion aun no esta cerrada
- nuevos artefactos generados: `companions.json` (83 items), `archwing-weapons.json` (28 items), `vehicles.json` (7 items)
- nuevos tipos formalizados: `Arcane`, `Companion`, `ArchwingWeapon`, `Vehicle` en `lib/types/`
- `Kind` extendido con `arcane | companion | archgun | archmelee | necramech | archwing`
- `vehicles.json` generado desde Necramechs + Archwings; K-Drives fuera de scope

Documento principal:
- `../features/data-foundation/status.md`

### 3. Builder Engine

- existe arquitectura documental base
- no existe implementacion del contrato `calculate(layout, context)` del motor
- existe `abilityCalc.ts` solo para stats de habilidad en contexto de UI
- los datos de mods siguen necesitando una fuente numerica clara para el builder

Documento principal:
- `../features/builder-engine/status.md`

### 4. Navigation Shell

- hay shell, HUD y menu basico
- estructura de rutas anidadas bajo `/equipment/*` implementada con layout route
- toolbar de equipment con contexto, hook de filtros y toolbars dedicadas por vista operativas
- migracion de `dev/example` a `features/equipment/` completada (NS-DT-15 cerrada)
- vistas con datos operativas: Warframes, Weapons, Mods, Arcanes, Companions, ArchwingWeapons, Vehicles (necramechs+archwings)
- todas las 7 vistas de equipment operativas con datos reales
- rutas de detalle placeholder bajo `/equipment/{warframes,weapons,companions,vehicles,archwing-weapons}/:uniqueName`
- `fetchSingle` añadido a los 4 loaders nuevos para resolver items por uniqueName
- pendiente: conectar filtros (bloqueado por discusion de arquitectura D-4), deprecar `arcanes/` y `mods/`

Documento principal:
- `../features/navigation-shell/status.md`

## Bloqueos estructurales actuales

- cobertura y calidad editorial del markdown semantico siguen siendo el cuello de botella operativo
- el builder engine no tiene el pipeline `calculate(layout, context)` ni provider de layout asociado
- parte del material en `Docs/reference/` puede desalinearse hasta revision puntual

## Siguiente lectura recomendada

1. `goals-roadmap.md`
2. `reading-guides.md`
3. `migration-status.md`
4. `docs-cutover-plan.md`
5. `../features/semantic-pipeline/status.md`
6. `../features/builder-engine/status.md`
