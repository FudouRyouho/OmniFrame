# Engine — Arquitectura de capas

> Estado: activo — refleja decisiones cerradas C1, C8, C20, C21, C22, C32, C33, C34, C35, C36, C37, C38, C39, C40 y C41
> Rol: contrato conceptual del sistema de 3+1 capas (Loadout / Resolver / Engine + Observer)
> Fuente de verdad de: responsabilidades y límites de Loadout, Resolver, Engine y Observer
> No usar para: implementación (ver features/builder-engine/status.md), fórmulas concretas (ver formula-overview.md)
> Depende de: `../../temp/pre-v1-architecture-2026-03-26.md` (C1–C41)
> Ultima actualizacion: 2026-03-28

## Modelo de 3 capas + Observer

```
┌─────────────────────────────────────────────────────────┐
│                  Observer (transversal)                 │  ← capa 4
│          captura boundaries sin acoplar capas           │
└────────┬──────────────────────────────────┬────────────┘
         │                                  │
       [B1]                               [B3]
         │                                  │
  Loadout  →──[B2]──→  Resolver  →──[B3]──→  Engine
  (capa 1)             (capa 2)  ←──────────  (capa 3)
                           │
                         [B4]
                           ↓
                        UI / consumer
```

**Boundaries observados:**

| ID | Boundary | Qué captura el Observer |
|---|---|---|
| B1 | Loadout → Resolver | Selección del jugador: entidades + mods + ranks |
| B2 | Resolver → Engine | `ResolvedLayout` + `CalculationContext` |
| B3 | Engine → Resolver | `EngineOutput` raw |
| B4 | Resolver → UI | Stats calculados en formato presentable |

El Observer no modifica ningún valor — solo captura para debug/trazabilidad.
Cada capa ignora su existencia.

Dirección de diseño acordada (C8): **bottom-up**. Se define primero qué input mínimo
necesita el Engine para un caso concreto. Ese input define el Layout mínimo.
El espacio entre la selección del usuario y ese input es el Resolver.

## Engine — capa 3

**Responsabilidad**: cálculo puro y determinista. El Engine es el único dueño del conocimiento de mecánicas: sabe qué fórmula aplica `WEAPON_CRIT_CHANCE`, cómo interactúa el crit con el multishot, qué behavior tiene CO según `deliveryType`, y el orden de operaciones (C34). No accede a ningún JSON.

- Recibe `ResolvedLayout` y `CalculationContext` del Resolver
- Agrupa stats por `upgradeType`, suma, aplica fórmulas en orden
- Devuelve `EngineOutput`
- No tiene estado interno ni implícito (C20)
- No depende de React, fetch ni ninguna capa de UI

**Firma (C35):**
```ts
calculate(resolved: ResolvedLayout, context: CalculationContext): EngineOutput
```

`dataset` eliminado de la firma — el Resolver ya hizo el lookup de base stats y valores por rank (C35).

**Supuesto v1** (declarado en `formula-overview.md`): máximo rendimiento asumido.
Todas las condiciones se tratan como activas (`context` vacío = todas activas). No hay simulación temporal ni rotación de estados.

**EngineOutput** (contrato mínimo acordado):
- `final`: resultado calculado — **obligatorio**
- `debug`: desglose de cálculo — **opcional**, producido por Observer (C21)

**Estado actual**: implementado en `Project/src/features/arsenal/engine/index.ts`.
La firma activa es `calculate(resolved: ResolvedLayout, context: CalculationContext): EngineOutput`.
`Project/src/lib/abilityCalc.ts` sigue existiendo como helper acotado de UI/dev para abilities, pero no reemplaza al engine.
Las 12 fórmulas matemáticas en `engine/formulas/` fueron rescatadas como base del nuevo engine v1.

## Resolver — capa 2 (C35, C36)

**Responsabilidad**: capa bidireccional — traduce el estado mutable del Loadout al lenguaje del Engine (forward), y el resultado del Engine al lenguaje de la UI (backward). No contiene lógica de fórmulas ni agrega valores.

### Forward — B1 → B2

**Input del Loadout (B1):**
```ts
interface LoadoutInput {
  warframe?: EquippedEntity
  primaryWeapon?: EquippedEntity
  secondaryWeapon?: EquippedEntity
  meleeWeapon?: EquippedEntity
}

interface EquippedEntity {
  uniqueName: string                         // identifica el item en el dataset
  mods: Array<{ uniqueName: string, rank: number }>
  arcanes?: Array<{ uniqueName: string, rank: number }>
}
```

**Operación del Resolver (forward):**
1. Para cada `EquippedEntity`: buscar stats base en el dataset de items por `uniqueName`
2. Para cada mod equipado: buscar en `mod-stats.override.json` por `uniqueName` → extraer `stat.values[0].baseValue[rank]` por cada stat
3. Emitir un `ResolvedStat` por stat de cada mod — sin agrupar, sin sumar
4. Construir `ResolvedLayout` (ver Boundary B2)
5. Construir `CalculationContext` — v1: objeto vacío (= todas las condiciones activas)

**El Resolver NO suma ni agrupa.** Entrega una entrada por stat de cada mod (C35).

**Acceso a datos:** el Resolver es la única capa que toca los JSONs. Recibe las fuentes de datos como dependencias (no las importa hardcoded): `modOverrideMap` y `itemDataset`. Esto permite remplazar las fuentes en tests sin cambiar la lógica.

**Output al Engine (B2):** `ResolvedLayout` + `CalculationContext` — ver sección dedicada.

### Backward — B3 → B4

- Recibe `EngineOutput` raw del Engine
- Traduce a formato consumible por la UI: labels con valores formateados, estructura por canal
- **Contrato B4 pendiente** — depende de los requerimientos de la UI (Paso 14)

El Resolver es el único punto que conoce tanto el lenguaje del Engine como el de la UI.
Ni el Engine ni el Loadout dependen entre sí directamente.

**Estado actual**: forward implementado en `Project/src/features/arsenal/engine/resolver.ts`.
API activa: `resolve()`, `resolveAndCalculate()`, `buildWeaponsMap()` y `buildWarframesMap()`.
La parte backward (B4) sigue pendiente de contrato y consumer UI.

## Loadout — capa 1 (PA-N / C37)

**Responsabilidad**: estado mutable de la selección del jugador. Produce el `LoadoutInput` que el Resolver consume.

### Modelo de datos (PA-N cerrado como contrato mínimo — C37)

```ts
// Estado interno del Loadout
interface LoadoutState {
  warframe?: EntitySlot
  primaryWeapon?: EntitySlot
  secondaryWeapon?: EntitySlot
  meleeWeapon?: EntitySlot
  // companion: fuera de v1 (C19-Gap4)
}

// Un slot de entidad: qué está equipado y en qué config activa
interface EntitySlot {
  uniqueName: string                // identifica el item en el dataset
  activeConfigIndex: number         // índice de la config activa (default 0)
  configs: EntityConfig[]           // mínimo 1, máximo 3 (A, B, C — estándar del juego)
}

// Una config: set de mods + arcanos propios de esa config
interface EntityConfig {
  label?: string                    // "Config A" por default, editable
  mods: Array<ModSlot | null>       // null = slot vacío
  arcanes?: Array<ArcaneSlot | null>
}

interface ModSlot {
  uniqueName: string
  rank: number
}

interface ArcaneSlot {
  uniqueName: string
  rank: number
}
```

### Lo que el Loadout expone al Resolver

Al inicio de un cálculo, el Loadout serializa su estado activo como `LoadoutInput` (C36):

```ts
function toResolverInput(state: LoadoutState): LoadoutInput {
  // Para cada canal: tomar la config activa y filtrar slots nulos
  // Produce: { warframe?, primaryWeapon?, ... } con mods[] ya sin nulls
}
```

El Loadout **no evalúa fórmulas ni accede a overrides** — solo mantiene qué está equipado.

### Notas de diseño (PA-N, 2026-03-28)

- **Entity vs Instance**: la misma entidad (`uniqueName`) puede tener 3 configs. No son instancias separadas de la entidad — son configuraciones de la misma.
- **Exaltadas y Venari**: capacidades de la entidad, no canales del Loadout. El slot de arma exaltada no existe en `LoadoutState` — el cálculo de la exaltada se deriva del warframe equipado al evaluar habilidades.
- **Whitelist de mods (C7)**: el Loadout no valida si un mod es compatible — eso es responsabilidad de la UI. `toResolverInput()` pasa lo que está equipado sin filtrar.

**Estado actual**: implementado en `Project/src/features/arsenal/engine/loadout.ts`.
`LoadoutProvider` integra este contrato en runtime y `ArsenalView.tsx` actua como consumer minimo de verificacion.
El contrato mínimo de C37 ya no está solo documentado: está activo en codigo.

## Boundary B1 — shape del Loadout al Resolver (C36)

Lo que el Loadout entrega al Resolver para iniciar un cálculo:

```ts
// Ejemplo: Rhino + Intensify rank 3 + Steel Fiber rank 0, sin arma
const loadoutInput: LoadoutInput = {
  warframe: {
    uniqueName: "/Lotus/Powersuits/Rhino/Rhino",
    mods: [
      { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarAbilityStrengthMod",  rank: 3 }, // Intensify
      { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarArmourMod",           rank: 0 }, // Steel Fiber
    ]
  }
}
```

El Resolver traduce esto en `ResolvedLayout` (ver B2) haciendo dos lookups:
1. Stats base del warframe desde el dataset de items (`uniqueName → { health, shield, armor, power, sprintSpeed }`)
2. Valores de cada mod por rank desde `mod-stats.override.json` (`uniqueName, rank → baseValue[rank]`)

## Boundary B2 — shape del Resolver al Engine (C35)

Lo que el Resolver entrega al Engine para un cálculo concreto:

```ts
// Un stat resuelto: baseValue[rank] extraído del override JSON
interface ResolvedStat {
  upgradeType: string      // "WEAPON_CRIT_CHANCE", "AVATAR_HEALTH_MAX", etc.
  value: number            // baseValue[rank] — ya resuelto, sin agrupar
  condition: string | null // de mod-stats.override.json — null = siempre activo
}

// Stats base de un arma (del dataset de items)
interface WeaponBase {
  uniqueName: string
  totalDamage: number
  criticalChance: number
  criticalMultiplier: number
  procChance: number
  fireRate: number
  reloadTime: number
  magazineSize: number
  multishot: number
  deliveryType: AttackDeliveryType  // "hitscan-single" | "projectile-single" | "beam-continuous" | ...
}

// Stats base de un warframe (del dataset de items)
interface WarframeBase {
  uniqueName: string
  health: number
  shield: number
  armor: number
  power: number
  sprintSpeed: number
}

// Un canal de cálculo: base + lista plana de stats por mod
interface ResolvedChannel<TBase> {
  base: TBase
  stats: ResolvedStat[]  // uno por stat de cada mod equipado, sin agrupar
}

// El conjunto completo entregado al Engine (solo los canales presentes en el Loadout)
interface ResolvedLayout {
  warframe?: ResolvedChannel<WarframeBase>
  primaryWeapon?: ResolvedChannel<WeaponBase>
  secondaryWeapon?: ResolvedChannel<WeaponBase>
  meleeWeapon?: ResolvedChannel<WeaponBase>
}
```

Ejemplo concreto — Rhino + Intensify rank 3 + Steel Fiber rank 0:

```ts
{
  warframe: {
    base: { uniqueName: "/Lotus/.../Rhino", health: 300, shield: 450, armor: 190, power: 188, sprintSpeed: 1.0 },
    stats: [
      { upgradeType: "AVATAR_ABILITY_STRENGTH", value: 30, condition: null }, // Intensify rank 3
      { upgradeType: "AVATAR_ARMOUR",           value: 110, condition: null }, // Steel Fiber rank 0
    ]
  }
}
```

El Engine recibe esto, agrupa los stats por `upgradeType`, suma, y aplica `base * (1 + sum/100)`.

## CalculationContext

Construido por el Resolver junto con el `ResolvedLayout`. Contiene todas las condiciones activas para el cálculo (C20).
El Engine no asume ningún estado implícito — lo que no está en el contexto no afecta el cálculo.

**v1**: contexto vacío = todas las condiciones activas (supuesto de máximo rendimiento). El Engine no filtra por condición en v1.

Shape base definido en `Docs/domains/data/conditions-baseline.md`:
- `ConditionDefinition`: qué condición existe (id, familia, tipo de valor, source)
- `ConditionState`: valor actual de la condición para este cálculo

## Observer — capa 4 transversal (C21)

Capa separada que captura inputs/outputs en cada boundary sin acoplarse a ninguna capa.
Ninguna capa sabe que está siendo observada — no hay callbacks, no hay flags de debug.

**Qué produce**: trazabilidad del flujo completo para un cálculo concreto:
- Selección entrada (B1)
- `CalculationContext` construido (B2)
- `EngineOutput` raw (B3)
- Resultado traducido para UI (B4)

**Cuándo activa**: solo en entorno dev o cuando se solicite explícitamente.
No afecta el camino crítico de producción.

**Estado**: no implementado. Prerequisito: contratos de Engine y Resolver formalizados (Pasos 12-13).

## Orden de mecánicas (C22)

Ningún orden de aplicación de mecánicas se asume sin fuente confirmada.
El orden se define por auditoría tripartita: fórmulas existentes → wiki → usuario.
Prerequisito del Paso 12.

## Relación con otros documentos

| Documento | Relación |
|---|---|
| `formula-overview.md` | Fórmulas estáticas que el Engine v1 aplica |
| `Docs/domains/data/conditions-baseline.md` | Shape de `ConditionDefinition` y `ConditionState` |
| `Docs/domains/data/mods/schema.md` | Contrato del input de mods al Resolver |
| `Docs/features/builder-engine/status.md` | Estado operativo: implementado, pendiente, bloqueantes |
| `Docs/temp/pre-v1-architecture-2026-03-26.md` | Historial de decisiones C1–C41 y orden de trabajo |
