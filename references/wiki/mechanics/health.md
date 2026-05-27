# Health

> Estado: activo
> Rol: fórmula de Health y mecánicas de regeneración para el engine v1
> Fuente de verdad de: cálculo de Total Health, escalado por rank, fuentes ADD vs ADD_FLAT
> No usar para: tablas completas de health por warframe o simulación de bleedout detallado
> Última actualización: 2026-05-26

## Fórmula base

```text
Total Health = (Base Health + Rank Bonus) × (1 + Mod Multiplier) + Flat Bonus
```

Fuente: https://wiki.warframe.com/w/Health

- `Base Health` — valor del warframe en Rank 0
- `Rank Bonus` — típicamente +100 en Rank 30. Se añade **antes** del multiplicador de mods (amplificado por Vitality, etc.) — patrón BASE_FLAT
- `Mod Multiplier` — suma aditiva de mods % (Vitality +100%, Physique aura +20%, etc.)
- `Flat Bonus` — valor plano añadido **después** del pool de mods — no se amplifica (patrón ADD_FLAT)

## Mapeo a tokens D-6

| Capa | Token | Op | Fuentes |
|---|---|---|---|
| % aditivo de mods | `AVATAR_ADD_HEALTH_MAX` | ADD | Vitality, Umbral Vitality, Primed Vigor, Physique (aura) |
| Plano post-escala | `AVATAR_FLAT_HEALTH_MAX` | ADD_FLAT | Azure Archon Shard (+150/+225), Arcanos de health flat |

> El Rank Bonus (+100 en R30) es BASE_FLAT en la fórmula — amplificado por mods. Sin embargo, es un valor intrínseco del warframe, no proviene de mods ni overrides. El engine lo recibe como parte del stat base del warframe.

## Escalado por rank

El warframe gana salud al subir de rank. El bonus de rank se suma a la salud base **antes** del multiplicador de mods:
```text
(450_base + 100_rank_bonus) × (1 + 1.00_vitality) = 1100
```
Esto significa que Vitality amplifica tanto la salud base como el bonus de rank.

## Regeneración de vida

**Sin regeneración natural** — la wiki confirma explícitamente que la salud no regenera sola. Excepciones:

| Fuente | Tipo | Token D-6 |
|---|---|---|
| Rejuvenation (aura) | Flat regen/s — valor absoluto | `AVATAR_FLAT_HEALTH_REGEN` |
| Dreamer's Bond (aura) | Flat regen/s — valor absoluto | `AVATAR_FLAT_HEALTH_REGEN` |
| Azure Archon Shard | +5 / +7.5 Health/s | `AVATAR_FLAT_HEALTH_REGEN` |
| Nidus passive | Regen por stacks — mecánica de pasiva | GameLaw / trigger — fuera de scope |
| Habilidades (Trinity, Wisp…) | Heal instantáneo o regen temporal | trigger — fuera de scope |

> No existe ninguna fuente conocida de health regen porcentual — siempre es un número absoluto flat.
> Por eso el token es `AVATAR_FLAT_HEALTH_REGEN` (ADD_FLAT), no ADD.

## Health Orbs

Los orbes de vida restauran una cantidad flat de salud. `AVATAR_ADD_HEALTH_ORB_EFFICIENCY` escala cuánto restaura cada orbe:
```text
Salud restaurada = valor_base_del_orbe × (1 + HEALTH_ORB_EFFICIENCY / 100)
```
Fuentes de `AVATAR_ADD_HEALTH_ORB_EFFICIENCY`: Amber Archon Shard (+100%/+150% Tauforged), mods y arcanos específicos.

## Interacciones relevantes con otras mecánicas

| Mecánica | Comportamiento |
|---|---|
| **Toxin** | Bypasa shields — daña salud directamente |
| **Viral** | Incrementa el daño recibido contra salud (status) |
| **Bleedout** | Al llegar a 0 health → 20s para ser revivido |
| **EHP** | `EHP = Health / (1 - DR)` donde `DR = Armor / (Armor + 300)` |

## No existe módulo Lua

`Module:Health/data` → 404. No hay módulo Lua para esta mecánica en la wiki.
Referencia directa: https://wiki.warframe.com/w/Health · https://wiki.warframe.com/w/Healing
