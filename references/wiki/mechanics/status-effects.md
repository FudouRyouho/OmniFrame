# Status Effects (Procs)

> Estado: activo
> Rol: mecánicas de efectos de estado — fórmulas de DoT, stacks de debuff, CC
> Fuente de verdad de: comportamiento de procs en el engine de simulación temporal
> No usar para: probabilidad de activación de proc — ver `damage-types.md` §Regla de elección de proc
> Última actualización: 2026-05-26

## Distinción fundamental

Un **efecto de estado** (proc) es independiente del tipo de daño que lo activa.

- `heat` → tipo de daño (componente de la distribución de daño del arma)
- `Ignite` → efecto de estado aplicado al enemigo al triggerear un proc de calor

Fuente canónica de nombres en código: `Project/src/shared/types/damage.ts`, campo `statusLabel`.

---

## Tabla de tipos → procs

| Tipo de daño | Proc (statusLabel) | Categoría |
|---|---|---|
| `impact` | Stagger | CC |
| `puncture` | Weakened | Debuff |
| `slash` | Bleed | DoT |
| `heat` | Ignite | DoT + Debuff |
| `cold` | Freeze | CC |
| `electricity` | Tesla Chain | CC |
| `toxin` | Poison | DoT |
| `blast` | Detonation | CC |
| `corrosive` | Corrosion | Stack Debuff |
| `gas` | Gas Cloud | DoT (AoE) |
| `magnetic` | Disruption | Stack Debuff |
| `radiation` | Confusion | CC |
| `viral` | Infection | Stack Debuff |
| `void` | Bullet Attraction | CC |
| `tau` | Tau | Debuff |
| `true` | — | — |

---

## Procs de tipo DoT

### Bleed (Slash)

```
tick_damage = 0.35 × modded_base_damage × faction_mult²
```

- 7 ticks en 6s (primer tick tras ~1s de delay)
- Tipo de daño del tick: **True** — bypasa armor y shields
- `modded_base_damage` = daño base total × (1 + bonos de daño base) × faction_mult
- Los mods de daño Slash no aumentan el tick — sí lo hacen base damage y faction

### Ignite (Heat)

```
tick_damage = 0.5 × modded_base_damage × heat_power × avg_crit_mult × faction_mult
heat_power   = heat_node.final / heat_node.base
```

- 7 ticks en 6s
- Tipo de daño del tick: Heat — afectado por armor del enemigo
- Efecto adicional: reduce armor hasta 50% (ver §Corte de armor por Heat)

### Poison (Toxin)

```
tick_damage = 0.5 × modded_base_damage × toxin_power × avg_crit_mult × faction_mult
toxin_power  = toxin_node.final / toxin_node.base
```

- 7 ticks en 6s
- Tipo de daño del tick: Toxin — bypasa shields, no bypasa armor

### Gas Cloud (Gas)

Proc de AoE: aplica Poison (Toxin) a todos los enemigos en un radio alrededor del objetivo impactado. La fórmula de tick es idéntica a Poison. El cloud dura ~6s.

---

## Procs de stack (Debuff acumulable)

### Corrosion (Corrosive)

Reduce el armor del enemigo de forma permanente por stack. Cada stack dura 8s.

```
armor_strip(n)   = min(0.26 + 0.06 × (n − 1), 0.80)
effective_armor  = base_armor × (1 − armor_strip(n))
```

| Stacks | Strip |
|---|---|
| 1 | 26% |
| 5 | 50% |
| 10 | 80% (máximo) |

### Infection (Viral)

Multiplica el daño recibido en la capa de salud (health layer únicamente, no shields ni overguard).

```
multiplier = 1 + initial_bonus + (stacks − 1) × stack_bonus
```

| Parámetro | Valor |
|---|---|
| `initial_bonus` | 1.00 (×2.0 total en 1 stack) |
| `stack_bonus` | 0.25 por stack adicional |
| Cap | 3.25 extra → ×4.25 total a 10 stacks |

### Disruption (Magnetic)

Multiplica el daño recibido en la capa de shields (y overguard). Misma fórmula de stacks que Infection.

```
multiplier = 1 + initial_bonus + (stacks − 1) × stack_bonus
  (mismos parámetros que Viral)
```

Adicionalmente: retrasa la recarga de shields por la duración del proc.

### Corte de armor por Heat (Ignite — efecto secundario)

Ramp de 2s iniciado al primer proc de calor activo. No se acumula con múltiples stacks:

| Tiempo desde primer proc | Armor strip |
|---|---|
| 0.5s | 15% |
| 1.0s | 30% |
| 1.5s | 40% |
| 2.0s | 50% (máximo) |

Límite absoluto: 50% — independientemente del número de stacks de Heat activos.

---

## Procs de CC

| Proc | Tipo fuente | Efecto |
|---|---|---|
| Stagger | Impact | Interrumpe acción del enemigo, aumenta threshold de Mercy finisher |
| Weakened | Puncture | Reduce daño del enemigo, aumenta crit chance sobre él |
| Freeze | Cold | Reduce velocidad de movimiento/ataque; aumenta daño crítico recibido |
| Tesla Chain | Electricity | Stun + cadena de daño a enemigos cercanos |
| Detonation | Blast | Knockback, reduce accuracy del enemigo |
| Confusion | Radiation | Causa que el enemigo ataque a aliados temporalmente |
| Bullet Attraction | Void | Atrae proyectiles entrantes hacia el objetivo |
| Tau | Tau | Aumenta la status chance recibida por el enemigo (~+10% por stack) |

---

## Nota de implementación

El engine modela procs de DoT en `EnemyState.dot_pools` y stacks de debuff en `EnemyState.stacks`. Las claves actuales (`damage_slash_proc`, `damage_corrosive`, etc.) son identificadores de runtime independientes de los tokens D-6 de daño — **no son el mismo vocabulario**. Su renombre es deuda separada de D-7b Fase 2 (que solo afecta los attr IDs de daño del arma, no los estados del enemigo).

---

## Fuentes

- https://wiki.warframe.com/w/Status_Effect
- https://wiki.warframe.com/w/Damage#Status_Effects
- `references/wiki/mechanics/damage-types.md` — probabilidad de proc por tipo de daño
