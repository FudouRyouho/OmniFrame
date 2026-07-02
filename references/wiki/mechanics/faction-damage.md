# Faction Damage Bonus

> Estado: activo
> Rol: mecánica de los mods de daño por facción (Bane/Expel/Cleanse/Smite) — fórmula, double-dipping en DoTs, mapeo de facciones
> Fuente de verdad de: cómo compone el faction bonus, qué procs lo double-dipean, qué facciones tienen mod y las excepciones de mapeo
> No usar para: la matriz de vulnerabilidades por facción (ver `enemy-resistances.md`) ni el orden general de mods (ver `calculating-bonuses.md`)
> Última actualización: 2026-07-02
> Fuente: https://wiki.warframe.com/w/Faction_Damage_Bonus

## Fórmula

El bonus es un **multiplicador de daño total** contra la facción del objetivo:

```text
Daño vs facción = Daño total × (1 + FactionBonus)
```

- Multiplicativo respecto a todo lo demás (Serration, elementales, crit) —
  coincide con `calculating-bonuses.md` §Step 3.
- Múltiples fuentes de faction bonus del mismo tipo son **aditivas entre sí**
  dentro del paréntesis.
- Valores de mods: +5% por rango — regulares hasta **+30%**, Primed hasta **+55%**.

Ejemplo (aritmética propia — la página no trae este ejemplo; un fetch inicial alucinó uno,
verificado por el usuario 2026-07-02): base 100, Serration +165%, Bane of Grineer +30%
vs Grineer → `100 × (1 + 1.65) × (1 + 0.30) = 344.5`.

## Double-dipping en DoTs

El faction bonus se aplica **dos veces** en los procs de daño sobre tiempo: una en el
daño inicial que fija la magnitud del proc, y otra en cada tick.

```text
tick_vs_facción = tick_base × (1 + FactionBonus)²
```

- **Procs que double-dipean: Slash (Bleed), Heat (Ignite), Toxin (Poison), Gas (Gas Cloud).**
- Consistente con las fórmulas ya capturadas en `status-effects.md` (el `faction_mult²`
  de Bleed generaliza a los cuatro DoTs).

## Facciones con mod y mapeo

Existen mods de facción para: **Grineer, Corpus, Infested, Orokin, The Murmur**.

Excepciones de mapeo contra las facciones del modelo U36 (ver `enemy-resistances.md`):

| Facción objetivo | ¿Aplica mod de facción? |
|---|---|
| Corrupted | **No** (aunque sean versiones Orokin de unidades Grineer/Corpus) |
| Narmer | **No** (aunque la unidad herede facción base) |
| Techrot | **No** (el mod de Infested no aplica) |
| Anarchs, Scaldra, Stalker, Wild | Sin mod de facción |

## Fuentes

- https://wiki.warframe.com/w/Faction_Damage_Bonus
- `calculating-bonuses.md` §Step 3 — posición en el orden de operaciones
- `status-effects.md` — fórmulas de tick con `faction_mult`
