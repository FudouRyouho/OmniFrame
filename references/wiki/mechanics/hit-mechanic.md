# Hit Mechanic

> Estado: activo
> Rol: modelo de jerarquía de hits, tipos de proyectiles y distribución de daño por disparo
> Fuente de verdad de: HitStruct/HitPtr/DmgSrc hierarchy, multishot per-pellet behavior, interacción hit/status
> No usar para: fórmulas de daño elemental (ver `damage-types.md`) o DR (ver `damage-reduction.md`)
> Última actualización: 2026-05-27
> Fuente: https://wiki.warframe.com/w/Hit_Mechanic

## Jerarquía de estructuras

```
HitStruct (por tick — máximo 2 por tick)
└── HitPtr (por fuente de hit)
    └── DmgSrc (instancia de daño individual)
```

### DmgSrc — unidad mínima de daño

Cada `DmgSrc` contiene:
- Distribución de tipos de daño
- Determinación de crítico (tier)
- Determinación de proc de estado
- Flags de proc forzado
- Otros efectos on-hit

### HitPtr — tres categorías

| Categoría | Tipo | Descripción | Ejemplos |
|---|---|---|---|
| **MainPtr** | Projectile | Hit directo (hitscan o proyectil físico) | Braton, Boltor |
| **MainPtr** | AoE | Área de efecto | Ogris, melee slam |
| **OtherPtr** | Extra Hit | Hits adicionales de habilidades | Xata's Whisper, Toxic Lash |
| **OtherPtr** | Distribution | Redirección de daño | Tornado (1-3), Funnel Clouds (hasta 8) |
| **OtherPtr** | Clone | Hall of Mirrors — no hereda Extra Hits | Hasta 6 clones |
| **StatusPtr** | DoT | Daño de procs de estado | Slash, Toxin, Heat |

### HitStruct — por tick

- Máximo **2 HitStructs por tick**
- Si 2+ MainPtrs impactan en el mismo tick: HitStruct 1 (primer MainPtr) + HitStruct 2 (resto)
- Los StatusPtr se derivan del número de HitStructs

## Métodos de detección

```
Projectile → contacto físico requerido
Hitscan    → línea de visión, daño instantáneo
AoE        → detección circular por radio
Melee      → zonas secuenciales en abanico
```

## Multishot — comportamiento por pellet

Para armas con multishot:
- El daño **se divide** entre proyectiles (no se multiplica)
- `9000 daño × 3 multishot = 3000 por proyectil`
- Cada proyectil = un `DmgSrc` dentro del `HitPtr`
- **Armas continuas**: multishot actúa como multiplicador de daño, no como instancias adicionales

> Distinción crítica para el engine: `WEAPON_ADD_MULTISHOT` divide el daño por pellet en
> `CombatSimulator`, pero el daño total resultante es el mismo que si fuera un solo hit.
> La diferencia importa para la distribución de status (más chances de proc por disparo).

## Fórmulas de conteo de hits

### Por MainPtr

```
SingleMainPtr = 1
Extra Hits    = Xata's Whisper + Toxic Lash + Resupply + Silken Stride + Melee Duplicate  (0-5)
Distribution  = Tornado (0-3) + Funnel Clouds (0-8)  (0-11)
Clone Hits    = clone existe × clone impactó  (0-6, sin Extra Hits heredados)
```

### Status procs por HitStruct

```
Slash / Toxin DoT:  hasta 2 por HitStruct (uno por HitStruct)
Heat / Elec / Gas:  máximo 1 por tipo (mecánicas especiales — Heat Inherit, Tesla Chain, Gas Cloud)
Blast:              cada stack = un HitPtr independiente
```

## Armas continuas (Beam)

- Consumen 0.5 ammo por tick
- 1 ammo = 2 MainPtrs
- Multishot: multiplicador de daño, no instancias adicionales
- Chaining beams: funciona como hitscan, 0.5 ammo por tick

## Hits que aumentan HitPtr count

| Fuente | Tipo | Efecto |
|---|---|---|
| Xata's Whisper | Extra Hit | +1 HitPtr Void por MainPtr |
| Toxic Lash | Extra Hit | +1 HitPtr Toxin por MainPtr |
| Resupply | Extra Hit | +1 HitPtr elemental con proc garantizado |
| Silken Stride | Extra Hit | +1 HitPtr Toxin por MainPtr |
| Melee Duplicate | Extra Hit | +1 copia en crit (20% prob) |
| Tornado | Distribution | 1-3 HitPtr por tornado |
| Funnel Clouds | Distribution | hasta 8 HitPtr (augment) |
| Hall of Mirrors | Clone | 0-6 MainPtr clonados (sin Extra Hits) |
| Blast proc | StatusPtr | stacks = HitPtrs independientes |

## Relevancia para el engine

| Mecánica | Módulo afectado | Estado |
|---|---|---|
| Multishot → pellets | `AtomicSimulator.rollPellets()` | ✅ Implementado |
| Crit tier por pellet | `AtomicSimulator.calculateCritDistribution()` | ✅ Implementado |
| Extra Hits (abilities) | `HitPtr` — no modelado en C1 | ⏸ Scope: Ability System |
| Distribution Hits | `HitPtr` — no modelado | ⏸ Scope: Ability System |
| DoT hit counts | `StatusEngine` | ⚠️ Parcial |
| Blast proc HitPtrs | No modelado | ⏸ Deuda conocida |
