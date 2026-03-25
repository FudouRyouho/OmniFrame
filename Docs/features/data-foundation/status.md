# Data Foundation Status

> Estado: activo
> Rol: estado operativo de gaps y estabilidad de la base de datos del proyecto
> Fuente de verdad de: gaps activos del dataset y proximos focos de datos
> No usar para: formulas del builder o backlog de UI
> Depende de: `../../domains/data/ssot.md`
> Ultima actualizacion: 2026-03-24

## Objetivo

Consolidar las fuentes de verdad y exponer claramente que gaps del dataset siguen
abiertos antes de que el builder dependa de ellos.

## Estado actual

- metadata principal de warframes, armas y mods ya existe
- `ability-stats.override.json` sigue siendo la capa activa de override para habilidades
- `passives.json` existe hoy como artefacto generado local publicado a runtime
- la semantica de categorias de mods ya esta normalizada
- `companions.json` generado desde `Pets` + `Sentinels` de `warframe-items` — 83 items
- `archwing-weapons.json` generado desde `Arch-Gun` + `Arch-Melee` de `warframe-items` — 28 items
- `vehicles.json` generado desde Necramechs (filtrados de `Warframes`) + `Archwing` — 7 items (2 necramechs, 5 archwings)
- `warframes.json` depurado: Necramechs excluidos via `NECRAMECH_UNIQUE` — 114 warframes
- `arcanes.json` ya existia; tipo `Arcane` formalizado en `lib/types/arcane.ts`
- tipos nuevos: `Arcane`, `Companion`, `ArchwingWeapon`, `Vehicle` en `Project/src/lib/types/`
- `Kind` en `base.ts` extendido: `arcane | companion | archgun | archmelee | necramech | archwing`
- para datos distintos de `ability-stats` puede seguir habiendo ambiguedad operativa entre
  `Project/data/` y `Project/public/data/` hasta alinear cada artefacto al patron documentado

## Gaps activos

### DF-G1 - Rank bonuses post-30

- no modelados
- Nidus es el caso confirmado mas importante
- impactan directamente el pool del builder

### DF-G2 - Rank scaling de warframes

- parcialmente entendido
- los stats base y los bonos extra no deben mezclarse

### DF-G3 - Valores numericos de mods

- `levelStats` sigue siendo texto
- el builder necesita una fuente estructurada

### DF-G4 - Companion compatibility

- `compatName` ya esta preservado en datos de mods
- falta formalizar su uso en filtrado jerarquico

### DF-G5 - Roles de archivos de datos

- la taxonomia y el patron de `ability-stats` ya estan documentados (`data-layer-roles.md`,
  `override-pattern.md`, estabilizacion S1)
- puede seguir habiendo convivencia transicional entre `Project/data/` y `Project/public/data/`
  en otros archivos hasta migrarlos al mismo patron

### DF-G6 - Vehicles sin fuente de datos ✓ resuelto

- Necramechs (`Bonewidow`, `Voidrig`) estaban en `category: 'Warframes'` en `warframe-items`
- Archwings en `category: 'Archwing'` — JSON separado disponible
- ambos filtrados a `vehicles.json` en el pipeline; excluidos de `warframes.json` via `NECRAMECH_UNIQUE`
- K-Drives siguen sin fuente — fuera de scope por decision del usuario

### DF-G7 - Tipos nuevos sin cobertura de stats para el builder

- `Arcane`, `Companion`, `ArchwingWeapon`, `Vehicle` tienen metadata basica (imagen, nombre, masteryReq)
- sus stats numericos relevantes para el builder no estan modelados aun
- no es bloqueante para la vista de browsing, si para el builder engine

### DF-G8 - Scope de `all` en use-items

- `useItems("all")` solo incluye warframes, weapons y mods (scope builder v1)
- arcanes, companions, vehicles y archwing-weapons excluidos hasta que el builder los consuma
- decision intencional — no es un bug; ver comentario en `use-items.ts`

### DF-G9 - Helminth en warframes.json ✓ resuelto

- `Helminth` aparecia en `Warframes.json` de `warframe-items` con `category: 'Warframes'`
- filtrado en `generate-data.mjs` por uniqueName `/Lotus/Powersuits/Infestation/Helminth`
- no es un warframe jugable — excluido del pipeline
- resuelto: 2026-03-24

### DF-G10 - Type guards para kinds nuevos

- `base.ts` tiene type guards para `weapon`, `warframe`, `mod`
- faltan guards para `arcane`, `companion`, `archgun`, `archmelee`, `necramech`, `archwing`
- decision de diseño pendiente: ¿guards individuales por kind o guards agrupados (isVehicle, isArchwingWeapon)?
- esta decision afecta directamente a la arquitectura de filtrado (D-4 en navigation-shell) y al builder
- no implementar hasta resolver la arquitectura de `use-items-filters` — discusion pendiente
- no bloqueante para browsing; necesario antes de que el builder consuma estos tipos

### DF-G11 - fetchSingle para loaders nuevos ✓ resuelto

- `companionData`, `vehicleData`, `archwingWeaponData`, `arcaneData` necesitaban `fetchSingle`
- `fetchCompanion`, `fetchVehicle`, `fetchArchwingWeapon`, `fetchArcane` añadidos
- buscan por `uniqueName` con fallback a `name` (case-insensitive), igual que `fetchWarframe`
- resuelto: 2026-03-24

## Desbloquea

- `../builder-engine/status.md`
- `../navigation-shell/status.md`

## Documento complementario

- `../../domains/data/data-layer-roles.md`
