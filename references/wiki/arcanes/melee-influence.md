# Melee Influence

> Estado: activo
> Rol: arcano melee — propaga status elementales del melee a enemigos en radio al proccar Electricity
> Fuente de verdad de: fórmula de daño propagado, tabla de escalado radio/duración por rank, lista de status propagables/excluidos, multiplicador de faction bonus (×2/×3)
> No usar para: catálogo exhaustivo de bugs/interacciones anómalas reportadas
> Última actualización: 2026-07-09
> Fuente: https://wiki.warframe.com/w/Melee_Influence
> Raw: melee-influence.wikitext

## Qué es

**Trigger:** "On Melee Electricity Status: 20% chance for elemental Melee Status Effects to apply
to enemies" en un radio, tras un proc de Electricity en un ataque melee **directo**.

- Chance **fija en 20%** (no escala con rank).
- **No refrescable mientras está activo:** "Cannot refresh while active."

## Escalado por rank (chance fija, radio/duración escalan)

| Rank | Chance | Radio | Duración |
|---|---|---|---|
| 0 | 20% | 10m | 3s |
| 1 | 20% | 12m | 6s |
| 2 | 20% | 14m | 9s |
| 3 | 20% | 16m | 12s |
| 4 | 20% | 18m | 15s |
| 5 | 20% | 20m | 18s |

## Status propagables

- **Primarios:** Cold, Electricity, Heat, Toxin.
- **Secundarios:** Blast, Corrosive, Gas, Magnetic, Radiation, Viral.
- **Excluidos:** Impact, Puncture, Slash, Void, Tau, controles de masa (CC).

## Daño propagado

"Deals damage equal to the amount of the procced elemental damage present on your melee's stat
screen."

**Ejemplo literal de la wiki:** melee con 100 daño base modded con Shocking Touch; si Melee
Influence proccea, inflige 90 daño de Electricity extra al target primario.

### Multiplicador de Faction Damage Bonus (relevante — no es 1×)

"Faction Damage Bonuses are applied **twice** on damage done by Melee Influence and **thrice** on
damaging status procs."

**Caso de ejemplo de la wiki:** Skana + Pressure Point + elementales + 55% faction bonus → 294 daño
directo, procs inflingen 211.2 Electricity/tick.

## Restricciones de trigger

- Solo dispara con ataque melee **directo** (no efectos secundarios).
- No propaga desde campos de toxina independientes.
- Excluye finishers con proc elemental forzado: "0% of the damage dealt is made up of the
  elemental status".
- Ignora el Rift Plane: "ignores the Rift Plane, affecting all enemies".

## Sinergias confirmadas

- **Condition Overload:** "Damage is affected by Condition Overload and critical multiplier."
- **Elementos de habilidades:** "Elemental damage gained through abilities such as Smite Infusion
  will also be spread."
- Proyectiles melee que atraviesan Electric Shield / Mutalist Quanta / Conductive Sphere activan el
  arcano (excepción: Glaive).

## Bugs / interacciones anómalas conocidas

- Electro Pulse y Synergized Prospectus pueden triggerear el arcano pese a no ser melee.
- Elemental Ward con Cold refleja daño de bala como si fuera melee.
- One-hit kills no activan el arcano.
- Mirage clones: patcheado en Update 35.1 (ya no triggerean indebidamente).

## Fuentes

- https://wiki.warframe.com/w/Melee_Influence
