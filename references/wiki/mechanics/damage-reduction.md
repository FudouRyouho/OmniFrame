# Damage Reduction

> Estado: activo
> Rol: fórmula de DR total, apilamiento multiplicativo, resistencias por tipo y Adaptation
> Fuente de verdad de: cálculo de DR efectiva, stacking de fuentes independientes, caps por habilidad
> No usar para: mecánicas de armor strip (ver `armor.md`) o cálculo de EHP detallado (ver `hit-points.md`)
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Damage_Reduction · https://wiki.warframe.com/w/Adaptation

## Fórmula completa de daño recibido

```text
Daño recibido = Daño_entrada × (1 − DR_armor) × (1 − DR_hab_1) × (1 − DR_hab_2) × ...
```

Todas las fuentes de DR son **multiplicativas entre sí** — nunca se suman en el mismo pool.

### DR de armor (Tenno)

```text
DR_armor = Armor / (Armor + 300)
```

El coeficiente 300 es el valor de escala estándar para Tenno. Algunos enemigos usan coeficientes
distintos.

### Fórmula expandida (wiki)

```text
Daño = D_in × (1+HM) × (1+AM) × (1−PR) × [300 / (300 + AR×(1−AM))]
```

| Variable | Significado |
|---|---|
| `HM` | Hit Multiplier — críticos, headshots, bonuses de facción |
| `AM` | Armor Modifier — Corrosive strip, Shattering Impact, Fracting Crush |
| `PR` | Protection Reduction — DR de habilidades (Iron Skin, Adaptation, etc.) |
| `AR` | Armor actual del objetivo (pre-modificadores de `AM`) |

## Tipos de DR y su stacking

| Tipo | Aplica a | Stacking | Notas |
|---|---|---|---|
| **Armadura** | Solo salud | Bonus aditivos entre sí; multiplicativo vs otras DR | `300/(300+Armor)` |
| **Pure DR** (habilidades) | Escudos + salud | Multiplicativo | Temporal; cap habitual 90% |
| **Type Modifiers** (resistencias por tipo) | El tipo específico | Multiplicativo dentro del tipo | `+45% Toxin Resistance` → toxin × (1−0.45) |
| **Energy-as-Health** | Energía (ratio 2:1) | Multiplicativo | Quick Thinking / Gladiator Finesse |
| **Damage Attenuation** | Salud del **enemigo** | Multiplicativo, escala con DPS | Lado enemigo |

**Cap habitual: 90%** (Desolate Hands, Preserving Shell, Immolation, Self Portrait, Adaptation, etc.).

### Fuentes de Pure DR (habilidades)

| Fuente | Cap | Notas |
|---|---|---|
| Iron Skin (Rhino) | 100% (absorción mientras dure) | HP buffer, no DR directa |
| Adaptation (Arcano) | 90% | Stacks con daño recibido del mismo tipo (ver abajo) |
| Baruuk — Serene Storm | 90% | Activa con Restraint bajo |
| Citrine — Crystallize | 90% | Escala con Ability Strength |
| Ember — Immolation | 50–90% | Escala con calor acumulado |
| Overguard | sin DR% — HP buffer | Ver [`overguard.md`](overguard.md) |

## Stacking de DR: regla crítica

**Todas las fuentes de DR se multiplican entre sí**, nunca se suman. Ejemplo:

```text
DR_armor = 66.7%  (Oberon R30 con mod ×2)
DR_adapt = 60%    (Adaptation a 60% stacks)

DR_total = 1 − (1 − 0.667) × (1 − 0.60)
         = 1 − 0.333 × 0.40
         = 86.7%
```

Si se sumaran (incorrecto): `66.7% + 60% = 126.7%` → resultado imposible.

## Adaptation — DR adaptativa por tipo

| Propiedad | Comportamiento |
|---|---|
| Trigger | Al recibir daño de cualquier fuente (no auto-daño) |
| Stacking | **Separado por tipo de daño**, cada tipo hasta **90%** independiente |
| Por golpe | +10% a rank máximo (+5% rank 0); refresca el stack del mismo tipo |
| Decay | 10s (rank 0) → 20s (rank 10) por stack |
| Tipo afectado | El del **componente de mayor daño** del ataque ("un ataque → un tipo de resistencia") |
| Interacción | Multiplicativo con otras DR; no aplica a Overguard; no apila con el pasivo de Caliban |

No es `+X% [elemento] Resistance` estático: gana resistencia al elemento que acaba de golpear,
apilando, con decay, capeado por tipo — el tipo es dinámico.

## Armor strip (reducción de DR de armor)

Mecánicas que reducen el armor del objetivo — afectan `AR` en la fórmula:

| Mecánica | Método | Magnitud |
|---|---|---|
| Corrosive (status) | Stack-based | hasta 80% |
| Shattering Impact (mod) | Por impacto — reducción permanente en combate | −6 armor / impacto |
| Fracting Crush (mod Bonewidow) | % strip por impacto | variable |
| Terrify (Nekros) | % strip basado en Ability Strength | hasta 100% |

## Fuentes

- https://wiki.warframe.com/w/Damage_Reduction
- https://wiki.warframe.com/w/Adaptation
- [`armor.md`](armor.md) · [`hit-points.md`](hit-points.md)
