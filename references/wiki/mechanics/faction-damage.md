# Faction Damage Bonus

> Estado: activo
> Rol: mecánica de los mods de daño por facción (Bane/Expel/Cleanse/Smite) — fórmula, double-dipping en DoTs, mapeo de facciones
> Fuente de verdad de: cómo compone el faction bonus, qué facciones tienen mod y con qué particularidades, las excepciones de mapeo
> No usar para: la matriz de vulnerabilidades por facción (→ `enemy-resistances.md`) · el orden general de mods (→ `calculating-bonuses.md`) · la ley completa de escalado de DoT (→ `damage-over-time.md`)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Faction_Damage_Bonus
> Fuente actualizada: 2026-06-23
> Raw: faction-damage.wikitext

## Fórmula

> *"It is calculated as a **total damage multiplier** against the faction in question."*

```text
Daño vs facción = Daño total × (1 + FactionBonus)
```

- Multiplicativo respecto a todo lo demás (Serration, elementales, crit) — coincide con
  [`calculating-bonuses.md`](calculating-bonuses.md) §3.
- Aplica a **todos** los tipos de enemigo de esa facción, **bosses incluidos**.

> ℹ️ Ilustración propia. Base 100, Serration +165%, Bane of Grineer +30% contra Grineer:
> `100 × (1 + 1.65) × (1 + 0.30) = 344.5`.

## Los mods

- **×1.05 por rango**, hasta **×1.30** los regulares y **×1.55** los Primed.
- Existen para los **4 tipos de arma** (rifle, escopeta, pistola, melee) y para **Railjack** donde
  aplica. Polaridad **Madurai**, costo base 4. Todas las facciones tienen variante Primed.

| Facción | Tiene mod |
|---|---|
| Grineer · Corpus · Infested · Orokin · The Murmur | ✔️ los 4 tipos + Railjack |
| **Sentient** | ✔️ **sólo melee**, polaridad **Umbra**, bonus **menor** — con set effect al equipar Sacrificial Pressure + Sacrificial Steel |
| Anarchs · Narmer · Scaldra · Techrot · Stalker · Wild | ❌ ninguno |

**Paracesis** tiene una pasiva innata (que se desbloquea en cada rango sobre 30) que aumenta su daño
contra Sentients.

### Excepciones de mapeo

Los mods de Grineer, Corpus e Infested **no tienen efecto** sobre sus contrapartes **Corrupted** ni
**Narmer**: Bane of Grineer funciona sobre un Lancer, pero no sobre un Corrupted Lancer ni un Narmer
Lancer. Del mismo modo, los mods de **Infested no afectan a Techrot**.

## Double-dipping en DoTs

El faction bonus aumenta el daño crudo del arma **y se aplica una segunda vez** al daño sobre tiempo
de los status que ese arma genere.

```text
tick_vs_facción = tick_base × (1 + FactionBonus)²
```

La wiki lo escribe con este ejemplo, donde el exponente lleva la anotación *"Faction Damage gets
applied twice for this"*:

```text
Bleed por tick = 100 × (1 + 1.65 Serration) × 0.35 × (1 + 0.3 Bane)² × (1 + 0.9 Rifle Elementalist)
```

**Roar cuenta como Faction Damage Bonus** a estos efectos: la wiki lo transcluye en su sección de
*"Faction Damage Bonus Abilities"* y lo nombra junto a Bane of Infested en la ley de escalado.

La ley completa —qué otros buffs escalan el DoT y cuáles no— vive en
[`damage-over-time.md`](damage-over-time.md) §DoT Damage Scaling.

> ⚠️ Discrepancia → [`../../ingame-tests/double-dip.md`](../../ingame-tests/double-dip.md)

La medición del proyecto cubre Slash, Toxin y Heat en 16 tiradas. **Gas y Electricity no fueron
medidos**: se asumen por inducción del mismo patrón, y el test lo declara pendiente.

## Fuentes

- https://wiki.warframe.com/w/Faction_Damage_Bonus
- [`damage-over-time.md`](damage-over-time.md) · [`calculating-bonuses.md`](calculating-bonuses.md) · [`enemy-resistances.md`](enemy-resistances.md)
