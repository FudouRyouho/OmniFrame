# Estado Actual

> Estado: activo
> Rol: snapshot ejecutivo del proyecto y de los tracks principales
> Fuente de verdad de: estado operativo general
> No usar para: detalle de schema, formulas o decisiones historicas
> Depende de: `../features/`
> Ultima actualizacion: 2026-03-22

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
- vista de equipment y shell basico de UI; vista de mods enrutada
- parser semantico `utilities/parse-semantic.mjs` y merge mecanico documentado hacia el override
- split de tipos en `Project/src/lib/types/`
- `npm run build` en verde (TypeScript + Vite) tras el saneamiento minimo de tipos
- `abilityCalc.ts`: calculo acotado de valores de stats de habilidad y labels para UI (no es el engine de builds)

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

- hay shell, HUD y menu basico; equipment y mods usables por ruta
- falta contexto de layout activo y vistas stub (Arcanes, Options, Profile, Arsenal) sin enrutar aun

Documento principal:
- `../features/navigation-shell/status.md`

## Bloqueos estructurales actuales

- cobertura y calidad editorial del markdown semantico siguen siendo el cuello de botella operativo
- el builder engine no tiene el pipeline `calculate(layout, context)` ni provider de layout asociado
- parte del material en `Docs/reference/` y legacy puede desalinearse hasta revision puntual

## Siguiente lectura recomendada

1. `goals-roadmap.md`
2. `reading-guides.md`
3. `migration-status.md`
4. `docs-cutover-plan.md`
5. `../features/semantic-pipeline/status.md`
6. `../features/builder-engine/status.md`
