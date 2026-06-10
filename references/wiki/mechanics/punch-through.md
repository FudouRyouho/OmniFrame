# Punch Through

> Estado: activo
> Rol: mecánica de penetración (metros flat), base por arma, mods aditivos
> Fuente de verdad de: definición, innatos por arma, mods flat, comportamiento por tipo de ataque
> No usar para: catálogo completo de armas con punch innato
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Punch_Through

## Definición

**Punch Through** = qué tan lejos puede un disparo atravesar enemigos y objetos antes de
despawnear. Medido en **metros**. Cada blanco atravesado **resta** su "grosor" del potencial de
penetración restante.

Referencias de escala:
- **1.2m** ≈ basta para atravesar un enemigo al menos una vez.
- **2.1m** ≈ atraviesa cuatro Grineer Butcher en fila.

Barreras que **nunca** se penetran: barreras de Arctic Eximus, campos de Nullifier Crewman, ciertos
weakspots de jefes.

## Base por arma (0 = sin punch nato)

La **mayoría** de las armas tienen **0m** nativo. Varias lo traen innato:

| Arma | Punch nato | Nota |
|---|---|---|
| Zenith (Semi) | 99 999m | ≈ infinito |
| Lanka | 5.0m | solo Charged Shot |
| Daikyu / Snipetron Vandal / Phenmor (Incarnon) / Paris Prime | 3.0m | charged / forma incarnon |
| Dread / Miter / Snipetron | 2.5m | charged shot |

- **Charged-shot:** el punch nato suele aplicar solo a carga completa; el disparo sin cargar penetra 0m.
- **Melee:** el golpe regular puede aprovechar punch through para atravesar geometría de nivel.

## Mods — flat aditivo en metros, nunca %

Los mods suman punch through como **valor flat aditivo en metros**. **No existen mods de punch
through porcentual.** El valor del arma y los mods **stackean aditivamente**.

| Mod | Ranks | Rango |
|---|---|---|
| Metal Auger / Seeking Force | 6 | +0.4m → +2.1m |
| Primed Shred | 11 | +0.2m → +2.2m |
| Power Throw | 6 | +0.3m → +2.0m |
| Vigilante Offense | 6 | +0.25m → +1.5m |
| Shred / Merciless Gunfight | 6 | +0.2m → +1.2m |

## Comportamiento por tipo de ataque

- **Hitscan:** aprovecha punch through normalmente.
- **Proyectil no-hitscan:** aplica; al atravesar geometría pierde velocidad pero sigue viajando.
- **Beam:** algunas continuas tienen *infinite body punch through* (Ignis, Ignis Wraith, Fulmin en
  Semi) — atraviesan enemigos ilimitados pero **no** geometría de nivel.
- **Radial / AoE:** con muy pocas excepciones, los proyectiles con componente de área **no**
  penetran — explotan al primer contacto.
- **Melee:** aplica a golpes regulares.

## Casos especiales

- **Infinite body punch through:** Arca Plasmor, Ignis, Ignis Wraith y varias en forma Incarnon
  atraviesan enemigos ilimitados, pero no terreno ni barreras.
- **Cyte-09 (Seek):** 10m de punch through contra cuerpos + infinito contra terreno mientras activa.
