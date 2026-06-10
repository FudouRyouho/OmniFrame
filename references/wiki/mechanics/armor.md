# Armor

> Estado: activo
> Rol: fórmula de armor, reducción de daño y fuentes (planas vs porcentuales)
> Fuente de verdad de: cálculo de Total Armor, DR por armor, EHP, distinción flat post-escala vs porcentaje
> No usar para: tablas completas de armor por warframe o cálculo de Effective Health detallado
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Armor

## Fórmula base

```text
Total Armor = Base Armor × (1 + Mod Multiplier) + Flat Bonus
```

- `Base Armor` — valor base del warframe (no cambia con el rank, excepto Nidus, Lavos y Kullervo)
- `Mod Multiplier` — suma de todos los mods porcentuales (Steel Fiber, Gladiator Aegis, etc.)
- `Flat Bonus` — valor plano añadido **después** del pool de mods — no se amplifica

## Reducción de daño (DR)

```text
DR  = Armor / (Armor + 300)
EHP = Health × (Armor + 300) / 300
```

Coeficiente de escala para Tenno: **300**. Esta fórmula ignora fuentes de DR adicionales
(habilidades, Adaptation, etc.) — ver [`damage-reduction.md`](damage-reduction.md).

## Fuentes de Flat Bonus (plano post-escala)

El flat bonus se suma **después** del pool de mods (no se amplifica). Ejemplo con Oberon (base 450):

```text
450 × (1 + 100% Umbral Fiber) = 900
900 + 225 (Tauforged Azure Shard) = 1125
```

Si fuera pre-escala: `(450 + 225) × 2 = 1350` — resultado incorrecto (no es así en el juego).

### Pasivas y mods planos

| Fuente | Valor |
|---|---|
| Azure Archon Shard | +150 / +225 (Tauforged) |
| Stone Skin (Focus — Unairu) | +50 / +100 / +150 / +200 |
| Arcanos de armor | variable |

> *"Armor bonus from Stone Skin is added at the end, making it not increase in value with neither
> armor Mod multiplier nor Warframe abilities armor multiplier."* — wiki

### Habilidades con bonus plano de armor

Temporales (duran mientras la habilidad está activa), se suman en el mismo bucket plano:

| Fuente | Warframe | Notas |
|---|---|---|
| Rubble (pasiva) | Atlas | Apila hasta +1500, se pierde si no se alimenta |
| Feast (pasiva) | Grendel | Armor por enemigo engullido |
| Parasitic Armor (augment) | Nidus | Convierte stacks en armor temporalmente |
| Plunder | Yareli | Roba armor de enemigos — plano |

## Fuentes de Mod Multiplier (porcentaje)

| Fuente | Ejemplo |
|---|---|
| Mods % de armor | Steel Fiber (+110%), Umbral Fiber (+110%) |
| Habilidades % de armor | Warcry (Valkyr), Roar (multiplicativo) |

## No existe armor plano pre-escala

No hay ninguna mecánica conocida que añada armor plano *antes* del pool de mods (es decir,
amplificado por ellos). Todo armor plano es post-escala.

## Interacciones relevantes

| Mecánica | Comportamiento |
|---|---|
| **Corrosive** | Strips armor en stacks — hasta 80% reducción |
| **Viral** | No afecta armor — afecta salud directamente |
| **Magnetic** | No afecta armor — reduce shields |
| **Adaptation** | DR adicional hasta 90% — aplica **multiplicativamente** sobre la DR de armor |
| **Warcry** (Valkyr) | +% armor temporal |

## Fuentes

- https://wiki.warframe.com/w/Armor
- https://wiki.warframe.com/w/Damage_Reduction
- [`damage-reduction.md`](damage-reduction.md)
