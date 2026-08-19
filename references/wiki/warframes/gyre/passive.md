# Gyre — Pasiva

> Estado: activo
> Rol: pasiva de Gyre — crit chance de habilidad escalado por stacks de Electricity en el enemigo objetivo, per-enemigo
> Fuente de verdad de: la fórmula de crit chance/damage de la pasiva · su cap · su relación aditiva con Cathode Grace · sus exclusiones (Helminth, torretas de Railjack)
> No usar para: los valores de las habilidades numeradas de Gyre (ver el `.md` de cada una) · la fórmula general de crit tiers (ver [`../../mechanics/critical-hits.md`](../../mechanics/critical-hits.md))
> Última actualización: 2026-08-19
> Fuente: https://wiki.warframe.com/w/Gyre/Abilities/Passive
> Fuente actualizada: 2025-11-03
> Raw: passive.wikitext

## Cómo funciona

*"Gyre's abilities gain a flat **10%** Critical Chance per active Electricity status proc affecting
an individual enemy to deal **2.0x** Critical Damage against that enemy."*

```
critChance(enemy) = 10% × stacksElectricity(enemy)     — por ENEMIGO, no global
critDamageBase = 2.0×                                  — no 1.5×
```

- **Es condition-scaled, no un flat siempre-activo.** El input es el conteo de stacks de Electricity
  en el enemigo objetivo — cero stacks, cero crit chance. Escala aditiva per-N (10% por stack,
  lineal), no un bonus absoluto siempre-activo.
- **Por enemigo, no global.** El stack de Electricity es un estado del target — dos enemigos con
  distinto conteo de stacks dan distinto crit chance a la misma habilidad en el mismo cast.
- **Cathode Grace suma al mismo pool, no es un término aparte.** *"Bonus stacks additively with
  Cathode Grace, increasing the overall ability critical chance at lower Electricity status stack
  counts"* — el augment reduce cuántos stacks hacen falta para los mismos breakpoints, no agrega un
  segundo eje independiente.
- **Cap:** pasiva + Cathode Grace combinadas topean en **300%** de crit chance. Sólo con la pasiva,
  30 stacks de Electricity alcanzan el cap (30 × 10% = 300%, consistente con el per-stack lineal).
- **Tiers de crit.** La fuente nombra tres multiplicadores según el tier alcanzado: 2.0× (base),
  3.0× ("orange", desde 11 stacks / 110% crit chance) y 4.0× ("red", desde 21 stacks / 210% crit
  chance) — sólo con la pasiva, sin Cathode Grace.
  ⚠️ Los breakpoints de stacks para el 2º y 3er tier (11/21) no son múltiplos redondos de 10 como el
  1er tier (10 stacks = 100%) sugeriría — no se fuerza una marca de tipo (no encaja en ninguno de los
  4 tipos de `wiki/README.md` §La marca: no es un dato desactualizado, ni un conflicto entre dos
  páginas, ni una discrepancia medida, sólo una inconsistencia interna de fraseo de la fuente). Queda
  sin resolver.
- **Exclusiones declaradas:** habilidades subsumidas por Helminth y las torretas de Railjack (ej.
  *Seeker Volley*) **no** se benefician de esta pasiva — la excepción tiene su propia excepción.

## Fuentes

- https://wiki.warframe.com/w/Gyre/Abilities/Passive
