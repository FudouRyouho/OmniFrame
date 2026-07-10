# Melee Afflictions

> Estado: activo
> Rol: arcano melee — añade stacks de Status Effect a enemigos derribados/lanzados por melee
> Fuente de verdad de: fórmula de daño del Affliction Hit + tabla de restricciones por CC-state + exclusiones de mods elementales
> No usar para: catálogo exhaustivo de todas las stances que fuerzan Ragdoll
> Última actualización: 2026-07-09
> Fuente: https://wiki.warframe.com/w/Melee_Afflictions

## Qué es

Arcano melee: cuando un enemigo afectado por Status Effects es **derribado o lanzado por un ataque
melee** (Knockdown, Ragdoll o Lifted), gana stacks adicionales de esos mismos status.

**Efecto base (Rank 5):** "Enemies affected by Status Effects gain 6 additional stacks when they're
knocked down or flung by melee attacks."

## Fórmula de daño (Affliction Hit)

El daño del "hit" que genera los stacks se calcula en 4 pasos:

1. **Daño por proc individual (MBD):**
   `Proc MBD = Weapon Base Damage × (1+Weapon Base Damage Bonus) × (1+Weapon Faction Damage Bonus) × (1+Weapon Status Damage Bonus) × (Additional Multipliers)`
2. **Promedio por tipo de status:** se suman todos los MBD de cada tipo de efecto activo y se divide
   entre la cantidad de procs de ese tipo.
3. **Daño de Affliction Hit:** suma de todos los promedios por status, multiplicado por
   bonificadores de facción del arma melee.
4. **Daño Over Time por status generado:**
   `Affliction Damage Tick = Affliction Damage × Status Effect Multiplier × (1+Melee Faction Damage Bonus) × (1+Melee Status Damage Bonus) × (1+Elemental on Melee of Status Effect)`

## Restricciones por CC-state del enemigo

Qué CC del enemigo permite el trigger de Melee Afflictions:

| Estado enemigo | Knockdown | Ragdoll | Lifted |
|---|---|---|---|
| Overguard activo | ❌ | ❌ | ❌ |
| Cold freeze | ❌ | ✔️ | ❌ |
| Heat panic | ✔️ | ✔️ | ✔️ |
| Electricity stun | ✔️ | ✔️ | ✔️ |

**Restricciones por habilidad de warframe que genera el CC:** no triggerea con Petrify, Crystallize,
Blood Altar, Condemn, Stasis, Well of Life (excepción: Khora Ensnare sí triggerea). **Excepción
documentada:** Slash Dash "can knockdown Frozen targets and still trigger Melee Afflictions."

## Exclusiones por tipo de daño de los stacks nuevos

- **Toxin y Electricity:** SÍ se benefician de mods elementales combinados en los stacks nuevos.
- **Heat:** NO se benefician mods de Heat, salvo que el arma melee haya sido la fuente del primer
  proc de Heat ("Heat Inherit").
- **Gas:** no aplica Affliction Damage a los stacks nuevos; tope de 10 stacks.
- **Blast:** no usa Affliction Damage para calcular el daño de los nuevos procs.

## Interacciones documentadas

- **Exalted weapons:** pueden stackear con Arcane Impetus e Ice Storm; triggerean Archon Vitality
  (+6→+7, no duplica), Archon Continuity (solo 1 Corrosive si hay Toxin presente), Archon Stretch
  (con Electric).
- **Lifted bug (conocido):** los procs de Lifted añaden 12 stacks en vez de 6.
- **Faction/Status Damage Bonus:** "can highly increase the damage... exponentially scale.
  Probably a bug" — sin confirmar si sigue vigente.
- **Blast en instancias aisladas:** comportamiento post-Update 43.0 sin confirmar ("unconfirmed").

## Sinergias recomendadas (comunidad)

- Gas + Melee Afflictions: eficiente por el cap de 10 stacks + reemplazo automático de los viejos.
- Stances que fuerzan Ragdoll: más eficientes para triggerear (ignoran la mayoría de restricciones
  de CC-state).
- Slams/Heavy Slams: buenos para forzar Lifted/Knockdown.
- Heat compounding vía Heat Inherit para escalar el daño de múltiples procs.

## Ambigüedades / no documentado

- El bug de "exponential scaling" con Faction/Status Damage Bonus no está confirmado como fix o
  vigente.
- Comportamiento exacto de Blast en instancias aisladas post-43.0.

## Fuentes

- https://wiki.warframe.com/w/Melee_Afflictions
