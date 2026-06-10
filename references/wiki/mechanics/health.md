# Health

> Estado: activo
> Rol: fórmula de Health, escalado por rank y regeneración
> Fuente de verdad de: cálculo de Total Health, capas pre/post-escala, regen siempre plano
> No usar para: tablas completas de health por warframe o simulación de bleedout detallado
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Health

## Fórmula base

```text
Total Health = (Base Health + Rank Bonus) × (1 + Mod Multiplier) + Flat Bonus
```

- `Base Health` — valor del warframe en Rank 0
- `Rank Bonus` — típicamente +100 en Rank 30. Se añade **antes** del multiplicador de mods
  (amplificado por Vitality, etc.) — es un valor intrínseco del warframe, no de mods
- `Mod Multiplier` — suma aditiva de mods % (Vitality +100%, Physique aura +20%, etc.)
- `Flat Bonus` — valor plano añadido **después** del pool de mods — no se amplifica

## Escalado por rank

El bonus de rank se suma a la salud base **antes** del multiplicador de mods:
```text
(450 base + 100 rank) × (1 + 1.00 Vitality) = 1100
```
Vitality amplifica tanto la salud base como el bonus de rank.

## Regeneración de vida

**Sin regeneración natural** — la wiki confirma que la salud no regenera sola. Excepciones, todas
en valor **absoluto (plano)**:

| Fuente | Tipo |
|---|---|
| Rejuvenation (aura) | regen/s plano |
| Dreamer's Bond (aura) | regen/s plano |
| Azure Archon Shard | +5 / +7.5 Health/s |
| Nidus passive | regen por stacks (mecánica de pasiva) |
| Habilidades (Trinity, Wisp…) | heal instantáneo o regen temporal |

> No existe ninguna fuente conocida de health regen **porcentual** — siempre es un número absoluto.

## Health Orbs

Los orbes de vida restauran una cantidad plana. El stat **Health Orb Efficiency** escala cuánto
restaura cada orbe:
```text
Salud restaurada = valor_base_del_orbe × (1 + Health Orb Efficiency)
```
Fuentes de Health Orb Efficiency: Amber Archon Shard (+100% / +150% Tauforged), mods y arcanos.

## Interacciones relevantes

| Mecánica | Comportamiento |
|---|---|
| **Toxin** | Bypasa shields — daña salud directamente |
| **Viral** | Incrementa el daño recibido contra salud (status) |
| **Bleedout** | Al llegar a 0 health → 20s para ser revivido |
| **EHP** | `EHP = Health / (1 − DR)` donde `DR = Armor / (Armor + 300)` |

## Fuentes

- https://wiki.warframe.com/w/Health
- https://wiki.warframe.com/w/Healing
