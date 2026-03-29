# Builder Engine Status

> Estado: activo
> Rol: estado operativo del track del motor de calculo
> Fuente de verdad de: implementado, pendiente y bloqueantes del engine
> No usar para: reglas de UI o detalle del pipeline semantico
> Depende de: `../../domains/engine/architecture.md`, `../../decisions/stage-0-architecture-decisions.md`
> Última actualización: 2026-03-28 (Tramos 1-4 mínimos completados; OQ-2 cerrada)

> **Nota arquitectural (2026-03-28)**: las decisiones stage 0 que separan `Loadout`, `Resolver`,
> `Engine` y la frontera React ya quedaron absorbidas por `../../domains/engine/architecture.md`
> y `../../decisions/stage-0-architecture-decisions.md`. El track ya no depende del registro
> temporal para su lectura operativa.

## Objetivo

Implementar un motor puro que calcule un layout de Warframe sin acoplarse a React.

## Alcance real de v1

v1 es un calculador estatico de stats y resultados directos.

No incluye:

- DoT
- simulacion temporal
- dano acumulado por ticks
- enemy-state loops
- kill loops

## Implementado

- `Project/src/features/arsenal/engine/index.ts` — Engine puro. `calculate(resolved: ResolvedLayout, context: CalculationContext): EngineOutput`. Tipos B2+B3 completos.
- `Project/src/features/arsenal/engine/resolver.ts` — Resolver forward. `resolve()`, `resolveAndCalculate()`, `buildWeaponsMap()`, `buildWarframesMap()`. Dependencias inyectadas (C36). 93/93 tests verdes.
- `Project/src/features/arsenal/engine/loadout.ts` — Loadout C37. `LoadoutState`, `EntitySlot`, `EntityConfig`, `ModSlot`. `toResolverInput()`, `createSlot()`, `emptyConfig()`, `equipEntity()`, `unequipEntity()`, `setActiveConfig()`, `setMod()`. Mutaciones puras.
- `Project/src/providers/Loadout/loadout-context.tsx` — integration layer mínima. `LoadoutProvider` con `useReducer`, carga de datasets del Resolver y outputs derivados (`LoadoutInput`, `ResolvedLayout`, `EngineOutput`).
- `Project/src/features/arsenal/ArsenalView.tsx` — consumer mínimo de verificación con preset canónico (Rhino Prime + Braton Prime + Lex Prime + Skana Prime).
- `Project/src/features/hud/HudHeader.tsx` y `Project/src/features/hud/footer/ArsenalFooter.tsx` — resumen real del loadout activo consumido desde el provider.
- `Project/src/features/arsenal/engine/formulas/` — 12 archivos con fórmulas matemáticas canónicas.
- `Project/data/mods/mod-stats.override.json` — schema C12–C28: 639 mods / 86.47% cobertura.

## Implementado (acotado, no es el engine completo)

- `Project/src/lib/abilityCalc.ts`: calculo de valores de stats de habilidad a partir de
  `upgradeBy` + variables de motor (`EngineVars`), resolucion de labels `|valN|` para UI.
  Es util para vistas y herramientas dev; **no** implementa `calculate(layout, context)` ni
  un layout de equipo completo.

## CAT 3 — Eliminados (2026-03-27)

- ~~`Project/src/features/arsenal/engine/index.ts`~~: eliminado en stage 0; reescrito desde cero en Paso 15 (2026-03-28).
- ~~`Project/src/features/dev/engine-v1/EngineV1TextView.tsx`~~: consumer acoplado al engine eliminado.

## No implementado aun

- Backward Resolver (B4) — pendiente de contratos de UI y consumer final
- Persistencia de builds y layouts guardados (Profile / IndexedDB)
- `EngineOutput` consumido de forma transversal por la app más allá del vertical slice actual

## Estado real del codigo

- `Project/src/features/arsenal/engine/index.ts` reescrito (Engine v1 — Paso 15, 2026-03-28)
- `Project/src/features/arsenal/engine/resolver.ts` creado (Resolver — Paso 16, 2026-03-28)
- `Project/src/features/arsenal/engine/loadout.ts` creado (Loadout C37 — Paso 17, 2026-03-28)
- `Project/src/features/arsenal/engine/runtime-deps.ts` creado — carga e indexación reutilizable de datasets para el Resolver en runtime
- `Project/src/providers/Loadout/loadout-context.tsx` creado (Paso 18 — integration layer React)
- `Project/src/features/arsenal/engine/__tests__/` — 4 archivos, 93 tests verdes
- `Project/src/features/arsenal/ArsenalView.tsx` ya no es placeholder nulo: renderiza el consumer mínimo del builder
- `Project/src/features/hud/HudHeader.tsx` muestra el loadout real; `ArsenalFooter` refleja el estado del provider

## Avance operativo del track

### Tramo 1 - Data readiness para mods

Estado: **COMPLETADO (Paso 11 — 2026-03-28)**

- `mod-stats.override.json` en schema C12–C28
- 639 mods / 86.47% cobertura
- Labels con placeholder `|val1|` generadas automáticamente
- 94 mods `Flawed` excluidos; 100 rechazados por edge cases

Pendiente (no bloqueante para Tramo 2/3):
- anotar `condition` manualmente en mods condicionales
- resolver edge cases del reporte
- completar metadata puntual (`damageType`, `misc`)

### Tramo 2 - Engine core v1

Estado: **COMPLETADO (Pasos 15-17 — 2026-03-28)**

- Engine: `calculate(resolved, context): EngineOutput` — `engine/index.ts`
- Resolver: `resolve()`, `resolveAndCalculate()` — `engine/resolver.ts`
- Loadout: `toResolverInput()` + mutaciones puras — `engine/loadout.ts`
- 93/93 tests verdes. TypeScript limpio. Sin deps React.

### Tramo 3 - Integration state + wiring

Estado: **COMPLETADO (Paso 18 — 2026-03-28)**

Condicion de entrada:
- ~~engine core ejecutable en aislamiento~~ ✓ MET
- ~~cierre de OQ-2 para enfoque del provider React~~ ✓ MET

Lectura operativa actual:
- `LoadoutProvider` dedicado con `useReducer` + hooks pequeños alrededor (decisión OQ-2 cerrada)
- datasets del Resolver cargados en runtime vía `engine/runtime-deps.ts`
- provider montado en `main.tsx` por encima de HUD y rutas para compartir layout activo entre shell y Arsenal

### Tramo 4 - Consumer mínimo en HUD/Arsenal

Estado: **COMPLETADO (vertical slice mínimo — 2026-03-28)**

Condicion de entrada:
- ~~layout activo resuelto en integration (Tramo 3)~~ ✓ MET

Resultado actual:
- `ArsenalView` consume el provider y expone un preset de verificación para probar la cadena completa
- `HudHeader` y `ArsenalFooter` muestran el layout activo derivado del provider

### Tramo 5 - Endurecimiento y extension controlada

Estado: **PENDIENTE**

Condicion de entrada:
- vertical slice mínimo funcionando

## Bloqueantes

- Backward Resolver (B4): pendiente de contratos de UI
- `mod-stats.override.json`: cobertura 86.47% — edge cases pendientes (no bloquea v1 core)

## Objetivo medio v1 vigente

El objetivo medio actual del track no es Arsenal final ni HUD final.

Es este corte verificable:
- ~~engine core puro y acotado~~ ✓ HECHO
- ~~capa mínima de integration para layout + contexto~~ ✓ HECHO
- ~~consumer de verificación en ArsenalView~~ ✓ HECHO

Queda fuera de este objetivo medio:
- UI final de producto
- persistencia completa de builds
- companions, vehicles y arcanes como scope del engine v1
- timeline, dots, enemy-state loops y simulacion avanzada

## Bloqueantes externos

- [data] fuente numerica de mods parcial: segundo corte generado, edge cases pendientes
- [integration] faltan seleccion real desde equipment, persistencia y wiring de Profile/Options sobre el vertical slice actual

## Dependencias fuertes

- `../semantic-pipeline/status.md`
- `../../domains/integration/runtime-composition.md`
- futura referencia de mecanicas del juego en `../../reference/wiki/`
- `archon-shards-integration.md` para entrada gradual de shards

## Desbloquea

- Arsenal real
- layout activo en HUD
- comparacion de builds por resultados directos

## Referencias legacy utiles

- `../../reference/audits/runtime-layer-map.md`
- `../../reference/audits/repo-structure-snapshot.md`
- `../../reference/audits/component-usage-audit.md`

## S6 — minimo horizontal

Vision del corte (dev, engine acotado, capa intermedia, UI texto): eliminada como doc activa. El criterio util sobreviviente ya esta absorbido por `../../domains/engine/architecture.md` y `../../decisions/stage-0-architecture-decisions.md`.

## Lectura operativa del track

- `../../overview/placeholder-minimums.md` para entrada, salida y consumer esperado antes de implementacion completa
- `file-structure.md` para ubicacion del motor
- `archon-shards-integration.md` para entrada gradual de shards
- `../../../Project/data/overrides/mods/mod-stats.report.json` para edge cases del parser de mods
- `../../domains/data/mods/upgrade-taxonomy.md` para semantica de mods
- `../../domains/data/weapons/` para limites reales de armas
- `../../domains/data/abilities/` para vocabulario y formulas de habilidades
