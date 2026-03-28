# Estado Actual

> Estado: activo
> Rol: snapshot ejecutivo del proyecto y de los tracks principales
> Fuente de verdad de: estado operativo general
> No usar para: detalle de schema, formulas o decisiones historicas
> Depende de: `../features/`
> Ultima actualizacion: 2026-03-28

## Resumen

OmniFrame sigue en una fase de consolidacion, pero ya no esta en un estado pre-builder.
La base de datos, la shell y el vertical slice minimo del builder existen.
La documentacion de estabilizacion (`stabilization-backlog.md`) ahora debe concentrarse
en sincronizar `overview/` y `domains/` con el estado real del repo y en dejar claros
los siguientes pendientes posteriores al Paso 18: B4, wiring real y persistencia.

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
- virtualización localizada por vista para listas grandes (`VirtualizedItemsGrid` usado explícitamente por `WeaponsView` y `ModsView`)
  - **ItemsGrid**: grilla simple compartida, sin política de virtualización integrada
  - **WarframesView**: grilla simple (lista pequeña, sin virtualización)
  - **WeaponsView**: virtualización local activa (threshold: 250, minColumnWidth: 180px, overscan: 4)
  - **ModsView**: virtualización local activa (threshold: 80, minColumnWidth: 190px, overscan: 5)
  - **CompanionsView, VehiclesView, ArcanesView, ArchwingWeaponsView**: grilla simple
- cache de datos persistente en IndexedDB (`lib/db.ts`, Dexie v1+) con fallback a JSON para soporte offline y carga rápida
  - Versionado automático: `DB_VERSION = 1` con invalidación si cambia

## Decisiones Recientes

- [Virtualización por Vista](../decisions/virtualization-per-view.md): Implementación granular temporal.
- [Estrategia de Versionado en IndexedDB](../decisions/indexeddb-versioning-strategy.md): Persistencia con Dexie.
- [Implementaciones Temporales](../decisions/implementaciones-temporales.md): Registro de cambios pendientes.
- [Open Questions](../decisions/open-questions.md): OQ-2 cerrada con `LoadoutProvider`; el resto de dudas transversales sigue registrado ahi.

## Referencias

- [Builder Engine status](../features/builder-engine/status.md): fuente de verdad del vertical slice minimo y de los pendientes B4/persistencia.
- [Navigation Shell status](../features/navigation-shell/status.md): fuente de verdad del shell, HUD y wiring real de rutas.
- [Open Questions](../decisions/open-questions.md): decisiones y dudas cross-cutting vigentes.

## Lo que esta en progreso

### 1. Semantic Pipeline

- hay parser funcional
- el runtime de `ability-stats.override.json` no esta migrado por completo al schema objetivo: `verify-ability-stats.mjs` reporta 559 errores estructurales y 260 entradas `schema legacy` en el corte 2026-03-28
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

- existe arquitectura documental base y vertical slice minimo del builder v1
- `abilityCalc.ts` sigue siendo util para UI/dev, pero ya coexiste con el engine real
- existe ya una fuente numerica parcial para mods via `mod-stats.override.json` (639/739 candidatos aceptados; 86.47%)
- `features/arsenal/engine/` ya contiene Engine, Resolver forward y Loadout implementados
- `LoadoutProvider` ya conecta HUD y Arsenal con el layout activo real
- `ArsenalView.tsx` ya no es un stub vacio: actua como consumer minimo de verificacion
- el siguiente pendiente real del track es cerrar B4 (Resolver backward), persistencia y wiring real desde equipment/Profile

Documento principal:
- `../features/builder-engine/status.md`

### 4. Navigation Shell

- hay shell, HUD y menu basico
- estructura de rutas anidadas bajo `/equipment/*` implementada con layout route
- toolbar de equipment con contexto, hook de filtros y toolbars dedicadas por vista operativas
- migracion de `dev/example` a `features/equipment/` completada (NS-DT-15 cerrada)
- vistas con datos operativas: Warframes, Weapons, Mods, Arcanes, Companions, ArchwingWeapons, Vehicles (necramechs+archwings)
- todas las 7 vistas de equipment operativas con datos reales
- `/arsenal` ya no renderiza un stub minimo: actua como consumer minimo del builder
- `HudHeader` y `ArsenalFooter` ya consumen el loadout real via `LoadoutProvider`
- rutas de detalle placeholder bajo `/equipment/{warframes,weapons,companions,vehicles,archwing-weapons}/:uniqueName`
- `fetchSingle` añadido a los 4 loaders nuevos para resolver items por uniqueName
- pendiente: conectar filtros (bloqueado por discusion de arquitectura D-4), deprecar `arcanes/` y `mods/`
- **rutas legacy coexistentes**: `/warframes/:name` y `/weapons/:name` (vistas en `pages/`) siguen activas junto con las rutas nested `/equipment/warframes/:uniqueName` y `/equipment/weapons/:uniqueName`. Son implementaciones distintas; no está decidido cuál deprecar

Documento principal:
- `../features/navigation-shell/status.md`

## Módulos activos no documentados

> Detectados en auditoría 2026-03-27. Estado definido 2026-03-28.

| Módulo | Ruta | Estado |
|---|---|---|
| Herramientas dev | `features/dev/` — 6 vistas bajo `/dev/*`: `ability-stats`, `mod-stats`, `text-format`, `ui-showcase`, `ability-schema`, `engine-v1` | Desfasado respecto a schemas actuales. No es código muerto — evoluciona con los schemas. Retomar cuando schemas piloto sean estables (pre-builder o validación piloto). |
| Options | `features/options/OptionsView.tsx` — ruta `/options` | En pausa. Placeholder funcional. No llevar a producción antes de builder v1. |
| Profile | `features/profile/ProfileView.tsx` — ruta `/profile` | En pausa. Placeholder funcional. No llevar a producción antes de builder v1. |
| i18n / category-icons | `lib/i18n/` — importado por hooks de equipment | Necesita reestructuración cuando se establezca naming-space semántico. Evolucionar en pre-builder o pilotos de schemas. |
| item-details + details panels | `lib/item-details.ts` + `features/equipment/details/` | En proceso, sin definición clara. Plan: componentes específicos por lugar + genéricos compartidos. |

## Artefactos huérfanos detectados

> Detectados en auditoría 2026-03-27.

| Archivo | Estado |
|---|---|
| `features/equipment/toolbar/inventory-toolbar.tsx` | `@deprecated` — sin importadores activos. Posible código muerto. Pendiente revisión manual antes de eliminar. |
| ~~`features/hud/layout-context.tsx`~~ | Eliminado 2026-03-28 — stub vacío (`export {}`), sin consumidores, sin valor como placeholder. |

> `features/mods/ModsView.tsx` y `features/arcanes/ArcanesView.tsx` son work-in-progress válidos — no son huérfanos.

## Bloqueos estructurales actuales

- el cuello operativo ya no es implementar el motor base, sino cerrar B4, wiring real y persistencia
- parte de `overview/` y `domains/` sigue con drift respecto a los Pasos 15-18
- parte del material en `Docs/reference/` puede desalinearse hasta revision puntual

## Siguiente lectura recomendada

1. `goals-roadmap.md`
2. `reading-guides.md`
3. `migration-status.md`
4. `green-checkpoint-plan.md` si la tarea apunta al cierre global del repo
5. `docs-cutover-plan.md`
6. `../features/semantic-pipeline/status.md`
7. `../features/builder-engine/status.md`
