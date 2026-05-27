# Damage Reduction

> Estado: activo
> Rol: fórmula de DR total y apilamiento multiplicativo para el engine v1
> Fuente de verdad de: cálculo de DR efectiva, stacking de fuentes independientes, caps por habilidad
> No usar para: mecánicas de armor strip (ver `armor.md`) o cálculo de EHP detallado (ver `hit-points.md`)
> Última actualización: 2026-05-26

## Fórmula completa de daño recibido

```text
Daño recibido = Daño_entrada × (1 − DR_armor) × (1 − DR_hab_1) × (1 − DR_hab_2) × ...
```

Todas las fuentes de DR son **multiplicativas entre sí** — nunca se suman en el mismo pool.

### DR de armor (Tenno)

```text
DR_armor = Armor / (Armor + 300)
```

El coeficiente 300 es el valor de escala estándar para Tenno. Algunos enemigos usan coeficientes distintos.

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

> Nota: `AM` negativo reduce armor efectiva del objetivo; `PR` es la DR de habilidades/arcanos — independiente del pool de armor.

## Fuentes de DR y sus pools

| Fuente | Pool | Cap | Notas |
|---|---|---|---|
| Armor | `DR_armor` — único por objetivo | ~97% a armor muy alta (asintótico) | `Armor / (Armor + 300)` |
| Iron Skin (Rhino) | `DR_hab` — multiplicativa | 100% (absorción completa mientras dure) | HP buffer, no DR directa |
| Adaptation (Arcano) | `DR_hab` — multiplicativa | 90% | Stacks con daño recibido del mismo tipo |
| Baruuk — Serene Storm | `DR_hab` — multiplicativa | 90% | Activa con Restraint bajo |
| Citrine — Crystallize | `DR_hab` — multiplicativa | 90% | Escala con Ability Strength |
| Ember — Immolation | `DR_hab` — multiplicativa | 50–90% | Escala con calor acumulado |
| Overguard | Capa independiente pre-shield | Sin DR% — actúa como HP buffer | Ver `overguard.md` |

## Stacking de DR: regla crítica

**Todas las fuentes de DR se multiplican entre sí**, nunca se suman. Ejemplo:

```text
DR_armor = 66.7%  (Oberon R30 con mod ×2)
DR_adapt = 60%    (Adaptation a 60% stacks)

DR_total = 1 − (1 − 0.667) × (1 − 0.60)
         = 1 − 0.333 × 0.40
         = 1 − 0.133
         = 86.7%
```

Si se sumaran (incorrecto): `66.7% + 60% = 126.7%` → resultado imposible.

## Armor strip (reducción de DR de armor)

Mecánicas que reducen el armor del objetivo — afectan `AR` en la fórmula:

| Mecánica | Método | Magnitud |
|---|---|---|
| Corrosive (status) | Stack-based — hasta 80% | `GameLaws.corrosive_max_stacks` |
| Shattering Impact (mod) | Por impacto — plano (reducción permanente en combate) | -6 armor / impacto |
| Fracting Crush (mod Bonewidow) | % strip por impacto | variable |
| Terrify (Nekros) | % strip basado en Ability Strength | hasta 100% |

## Mapeo a tokens D-6

Las fuentes de DR de ability/arcano son **triggers**, no modificadores de atributo estático. No tienen token D-6 activo en el vocabulario UPGRADE_* — pertenecen a `GameLaws` o al sistema de habilidades.

| Fuente | Categoría | Estado engine |
|---|---|---|
| DR de armor | Calculada desde `armor` attr | ✅ Engine calcula |
| DR de Adaptation | Trigger/arcano | Fuera de scope v1 |
| DR de habilidades | GameLaw / trigger | Fuera de scope v1 |

## Fuentes

- https://wiki.warframe.com/w/Damage_Reduction
- https://wiki.warframe.com/w/Armor
- `references/wiki/mechanics/armor.md`
- `references/wiki/mechanics/hit-points.md`
