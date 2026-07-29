# Wiki Mechanics

> Estado: activo
> Rol: índice de mecánicas profundas del juego para simulación y cálculo
> Fuente de verdad de: ubicación de futuras notas técnicas basadas en wiki
> Última actualización: 2026-07-09

## URLs base útiles

### Core combat

- `https://wiki.warframe.com/w/Damage`
- `https://wiki.warframe.com/w/Critical_Hit`
- `https://wiki.warframe.com/w/Multishot`
- `https://wiki.warframe.com/w/Calculating_Bonuses`
- `https://wiki.warframe.com/w/Faction_Damage_Bonus`

### Defensas y supervivencia

- `https://wiki.warframe.com/w/Armor`
- `https://wiki.warframe.com/w/Health`
- `https://wiki.warframe.com/w/Shield`
- `https://wiki.warframe.com/w/Overguard`

### Movimiento y maniobras

- `https://wiki.warframe.com/w/Movement_Speed`
- `https://wiki.warframe.com/w/Sprint_Speed`
- `https://wiki.warframe.com/w/Maneuvers`

### Mecánicas candidatas de builder

- `https://wiki.warframe.com/w/Condition_Overload_(Mechanic)`
- `https://wiki.warframe.com/w/Status_Effect`

## Damage types

### Página general

- `https://wiki.warframe.com/w/Damage`

### Ejemplos verificados de páginas por tipo

- `https://wiki.warframe.com/w/Damage_2.0/Heat_Damage`
- `https://wiki.warframe.com/w/Damage_2.0/Corrosive_Damage`
- `https://wiki.warframe.com/w/Damage_2.0/Tau_Damage`

### Nota de extracción futura

Cuando toque documentar physical, elemental primario, elemental secundario o special,
conviene crear documentos separados por familia:

- physical: impact, puncture, slash
- elemental primario: heat, cold, electricity, toxin
- elemental secundario: blast, corrosive, gas, magnetic, radiation, viral
- special: tau, true, void

## Candidatos iniciales

- `damage-types.md`
- `critical-hits.md`
- `multishot.md`
- `condition-overload.md`
- `status-effects.md`
- `armor-scaling.md`
- `dots-and-procs.md`
- `ability-formulas.md`
- `ability-scaling-and-caps.md`

## Documentos activos

### Defensas y hit-points
- [armor.md](./armor.md) — fórmula de armor, fuentes ADD vs ADD_FLAT, DR de armor
- [health.md](./health.md) — fórmula de health, escalado por rank, regen sources
- [shield.md](./shield.md) — fórmula de shields, Shield Gate, recharge, Overshields
- [overguard.md](./overguard.md) — capa pre-shield, CC immunity, Magnetic stacking
- [damage-reduction.md](./damage-reduction.md) — DR total, stacking multiplicativo, caps
- [hit-points.md](./hit-points.md) — modelo unificado de capas, EHP, bleedout

### Armas — mecánicas de disparo
- [reload.md](./reload.md) — fórmula de recarga, reload_time vs reload_speed, fuentes ADD

### Melee
- [melee-combo.md](./melee-combo.md) — HAE (pool plano BASE_FLAT, cap 90%), combo counter, duración, heavy attack multiplier, wind-up speed

### Daño ofensivo
- [damage-types.md](./damage-types.md)
- [critical-hits.md](./critical-hits.md)
- [multishot.md](./multishot.md)
- [condition-overload.md](./condition-overload.md)
- [enemy-resistances.md](./enemy-resistances.md) — modelo U36: matriz facción×elemento (±50%), bypasses de capa, DR de armor enemigo, discrepancia de era con `Enemy.json`
- [faction-damage.md](./faction-damage.md) — mods Bane/Primed: multiplicador total, double-dip en DoTs (Slash/Heat/Toxin/Gas), excepciones de mapeo

### Arcanos (residuo `upgrade_type:null`, barrido OQ-ENGINE-17)
- [arcane-melee-afflictions.md](./arcane-melee-afflictions.md) — fórmula de 4 pasos, tabla CC-state×enemy-state, exclusiones de mods elementales por tipo
- [arcane-melee-duplicate.md](./arcane-melee-duplicate.md) — chance por rank, reroll independiente de crit/status, exclusiones (Shield Gating, Seeking Talons)
- [arcane-melee-influence.md](./arcane-melee-influence.md) — chance fija 20%, Faction Damage Bonus ×2/×3, lista de status propagables/excluidos
- [arcane-camisado.md](./arcane-camisado.md) — lista canónica de qué cuenta como "summoned minion"; fuera de scope hasta modelar minions
- [arcane-persistence.md](./arcane-persistence.md) — cap de daño/s por rank, umbral de Armor, comportamiento bajo Overguard
- [arcane-universal-fallout.md](./arcane-universal-fallout.md) — chance permanente-por-stack de Radiation, cap 60%, persistencia tras vencer el status

## Estado editorial

Las páginas se extraen de la wiki de forma progresiva, a medida que se necesita verificar una
mecánica o fórmula concreta.

## Plantilla sugerida

Cada documento debería incluir:
- definición de la mecánica
- fórmula o reglas verificadas
- excepciones y edge cases
- fuentes wiki exactas
