# Wiki Mechanics

> Estado: activo
> Rol: índice de mecánicas profundas del juego para simulación y cálculo
> Fuente de verdad de: ubicación de futuras notas técnicas basadas en wiki
> Última actualización: 2026-03-22

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

- [damage-types.md](./damage-types.md)
- [critical-hits.md](./critical-hits.md)
- [multishot.md](./multishot.md)
- [condition-overload.md](./condition-overload.md)

## Estado editorial

Este índice ya tiene un primer bloque útil para engine v1:

- `damage-types.md`
- `critical-hits.md`
- `multishot.md`
- `condition-overload.md`

El resto puede seguir entrando como extracción progresiva desde la wiki cuando el
engine realmente necesite esa matemática o esa mecánica.

`Status Effect` sigue siendo una referencia fuerte para crecer después, pero hoy no
hace falta convertir toda la página en documentación local si el objetivo todavía es
cerrar la capa base del engine.

## Plantilla sugerida

Cada documento debería incluir:
- definición de la mecánica
- fórmula o reglas verificadas
- excepciones y edge cases
- implicación para el builder
- campos o estructuras que el engine necesitaría
- fuentes wiki exactas
