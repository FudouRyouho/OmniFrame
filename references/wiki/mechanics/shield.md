# Shield

> Estado: activo
> Rol: fórmula de Shields y mecánicas de Shield Gate / recarga
> Fuente de verdad de: cálculo de Total Shields, DR inherente del 50%, recharge rate
> No usar para: mecánicas de Overshield detalladas o simulación de Shield Gate frame-by-frame
> Última actualización: 2026-06-10

## Fórmula base

```text
Total Shields = Base Shields × (1 + Mods% + Abilities%)
```

Fuente: https://wiki.warframe.com/w/Shield

- `Base Shields` — valor del warframe en Rank 0 (+ Rank Bonus sumado antes del multiplicador, igual que Health)
- `Mods%` — suma aditiva de mods porcentuales (Redirection, Primed Vigor, etc.)
- `Abilities%` — habilidades que dan % de shields (Limbo Rift shield, etc.) — mismo pool aditivo que mods

## Fuentes de Shields

| Capa | Fuentes |
|---|---|
| % aditivo de mods | Redirection, Primed Vigor, Physique (aura) |
| Plano post-escala | Azure Archon Shard (+150/+225) |
| Tasa de recarga | Fast Deflection |

## Reducción de daño inherente (50%)

Los shields tienen **50% de DR inherente** contra todos los tipos de daño excepto:

| Bypass total | Bypass parcial |
|---|---|
| **Toxin** — daña salud directamente, ignora shields por completo | — |
| **True damage** — ignora shields | — |

> Magnetic es especialmente efectivo contra shields — inflige daño con +75% modificador y bloquea la recarga.

## Shield Gate

La mecánica de Shield Gate previene que un único hit destruya tanto los shields como la salud en el mismo frame:

- Al recibir un hit que destruye todos los shields, el jugador tiene **mínimo 0.33 segundos** de invulnerabilidad antes de que el daño restante afecte la salud
- El tiempo de Shield Gate **escala** con el max shields — shields altos dan más tiempo
- **No aplica** si los shields ya estaban en 0 antes del hit

## Recarga de shields

```text
Recharge Rate = (15 + 0.05 × Max Shields) × (1 + Shield_Recharge_Bonus%)
```

- Base: `15 + 5% del max shields` por segundo
- Modificado por: Fast Deflection (+15%), habilidades como Limbo (regeneración acelerada)
- **Bloqueos de recarga**:
  - Magnetic status — bloquea recarga completamente durante el status
  - Recibir cualquier daño — reinicia el delay de recarga (por defecto 2s sin daño)

### Delay de recarga

| Condición | Delay antes de que inicie la recarga |
|---|---|
| Daño normal | ~2 segundos sin recibir daño |
| Primed Fast Deflection | Reduce el delay |
| Puncture status (en enemigos) | No aplica a jugador |

## Overshields

Los Overshields son una capa adicional **por encima** del máximo de shields normal:

- Cap: **1200 Overshields** independientemente del max shields del warframe
- No tienen DR inherente como los shields normales — reciben daño completo
- Fuentes: Trinity Energy Vampire, algunas habilidades y arcanos
- Se pierden al recibir daño antes que los shields normales

## Interacciones relevantes

| Mecánica | Comportamiento |
|---|---|
| **Toxin** | Bypasa shields completamente — daña salud directamente |
| **Magnetic** | +75% bonus de daño vs shields; bloquea recarga durante status |
| **Viral** | No interactúa especialmente con shields |
| **Corrosive** | No afecta shields — afecta armor |
| **Shield Gate** | 0.33s mínimo de invulnerabilidad al romper shields |
| **Bleedout** | Los shields no previenen el bleedout si la salud llega a 0 |

## Fuentes

- https://wiki.warframe.com/w/Shield
- `references/wiki/mechanics/health.md`
- `references/wiki/mechanics/overguard.md`
- `references/wiki/mechanics/hit-points.md`
