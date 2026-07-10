# Melee Duplicate

> Estado: activo
> Rol: arcano melee — chance de repetir el golpe en un critical hit base, como instancia de daño separada con reroll de crit/status
> Fuente de verdad de: tabla de chance por rank + reglas de reroll + exclusiones (Shield Gating, Seeking Talons)
> No usar para: catálogo de todas las armas/stances compatibles
> Última actualización: 2026-07-09
> Fuente: https://wiki.warframe.com/w/Melee_Duplicate

## Qué es

**Trigger:** "On Base Critical Hits: 100% chance for your attack to strike a second time" (Rank 5).

## Chance por rank

| Rank | Chance |
|---|---|
| 0 | 25% |
| 1 | 40% |
| 2 | 55% |
| 3 | 70% |
| 4 | 85% |
| 5 | 100% |

## Comportamiento del golpe duplicado

Genera "a separate damage instance that will reroll the chance to apply status and also the
critical tier." Consecuencias:
- El tier de crítico se re-rollea (puede salir no-crítico, Tier 1 amarillo o Tier 2 naranja) —
  **no hereda** el tier del golpe original.
- El status también se re-rollea de forma independiente.

## Fórmula de crit óptimo (Rank 5)

`Critical Chance = (3 × Critical Damage Multiplier − 4) ÷ (2 × Critical Damage Multiplier − 2)`

Con multiplicadores de crit damage bajos, otros arcanos (ej. Melee Exposure) rinden más que
Duplicate.

## Exclusiones y limitaciones

- **Toxic Lash / Xata's Whisper:** el arcano duplica la *instancia de daño extra* de esas
  habilidades, no el golpe base.
- **Shield Gating:** la instancia de daño AoE separada generada por el duplicado "does not bypass
  enemy Shield Gating".
- **Seeking Talons:** el golpe duplicado "will not apply a forced status" de ese mod.
- **Exodia Contagion:** se procesa a menos que "the first burst of damage kills the enemy".

## Sinergias directas

- Los procs de status forzado de mods melee se aplican también al golpe duplicado.
- Compatible con slam attacks y explosiones (con el caveat de Shield Gating de arriba).

## Fuentes

- https://wiki.warframe.com/w/Melee_Duplicate
