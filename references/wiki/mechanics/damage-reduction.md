# Damage Reduction

> Estado: activo
> Rol: cómo se compone el daño recibido — los seis tipos de DR, su apilamiento, y qué queda fuera de ella
> Fuente de verdad de: la fórmula de daño recibido con armor y modificadores de tipo, la tabla de los 6 tipos de DR y a qué capa aplica cada uno, damage attenuation
> No usar para: la fórmula de armor en sí (→ `armor.md`) · el detalle de cada capa (→ `health.md` · `shield.md` · `overguard.md`)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Damage_Reduction
> Raw: damage-reduction.wikitext · adaptation.wikitext

## Cómo se compone el daño recibido

Toda DR es un **escalar multiplicativo**. La forma general:

```text
Damage Received = Damage Dealt × (1 − DR₁) × (1 − DR₂) × …
```

Con un objetivo **con armor** (jugador o enemigo) se agrega el término del armor:

```text
                                                             300
Damage Received = Damage Dealt × (1 − DR₁) × … × ────────────────────
                                                    300 + Armor
```

Y con **modificadores de tipo de daño**, que se calculan por tipo:

```text
                                       300
Damage Type Received = Type Dealt × … × ─────────── × (1 + DM₁) × (1 + DM₂) × …
                                        300 + Armor
```

> **DM ≠ DR.** El *Damage Type Modifier* no es una reducción: es el término de vulnerabilidad o
> resistencia por tipo, y entra como `(1 + DM)`, no como `(1 − DR)`.

**Los Tenno son neutrales a todos los tipos de daño** desde la versión 27.2. Los modificadores de
tipo del lado del jugador **se agregan** con mods como Toxin Resistance (un tipo) o habilidades como
Kinetic Plating (Impact, Puncture, Slash, Heat, Cold y Blast).

Ejemplo textual de la wiki, contra salud Corpus con 100 de armor y aura de Guardian Eximus (90% DR):

```text
Impact:   50 × (1 − 90%) × (1 − 100/(100+300)) × (1 + 0%)
Puncture: 25 × (1 − 90%) × (1 − 100/(100+300)) × (1 + 50%)
Slash:    25 × (1 − 90%) × (1 − 100/(100+300)) × (1 + 0%)
```

## Los seis tipos de DR

| Tipo | Aplica a | Stacking |
|---|---|---|
| **Armor** | **sólo Health** | `Net Armor / (Net Armor + 300)`. Multiplicativo con los demás tipos; los bonus de armor entre sí son **aditivos** |
| **Pure Damage Reduction** | Shields y Health | multiplicativo con todo. Típicamente de habilidades |
| **Damage Redirection** | **Overguard**, Shields y Health | multiplicativo con todo. Típicamente de habilidades |
| **Damage Type Modifier** | donde aplique | multiplicativo dentro del mismo tipo, y con los demás tipos |
| **Energy as Health** | Energy, a razón de **2 de salud por 1 de energía** | `DR = 1 − 100/Net Efficiency`. Los bonus de eficiencia de Quick Thinking y Gladiator Finesse **se suman entre sí** |
| **Damage Attenuation** | salud del **enemigo** | se adapta al DPS del jugador |

> **Damage Redirection es el único que alcanza al Overguard** — por eso Link, Warding Halo y Shield
> of Shadows sí lo protegen mientras que Adaptation o Splinter Storm no
> (→ [`overguard.md`](overguard.md)).

## Qué queda fuera de la DR

La damage reduction **no tiene efecto** sobre:

- Efectos que **absorben** daño: Iron Skin (Rhino), Snow Globe e Icy Avalanche (Frost).
- **Overguard.**
- **Object health.**
- Warding Halo (Nezha) **durante su ventana de 3 segundos de invulnerabilidad** — pasada esa
  ventana, la DR a la salud funciona con normalidad.

## Adaptation

**Mod de warframe** (no arcano). Otorga resistencia a los tipos de daño **recibidos recientemente**,
apilando hasta **90%**.

## Damage Attenuation

> ⚠️ La wiki marca esta sección con `{{UpdateMe}}`: faltan números exactos y más enemigos.

Ciertos enemigos tienen una reducción propia, **separada del armor y de la pure DR**, que escala con
el **DPS de ráfaga** del arma. Oficialmente se la llama *adaptive damage scaling*, *scaling damage
reduction* o *damage attenuation*.

El juego calcula ese DPS así:

```text
Burst DPS = daño total
          × multiplicador de crítico (si la instancia critea)
          × fire rate / attack speed
          × multishot
          × multiplicadores de parte del cuerpo
```

Todos los términos se toman **después** de mods y buffs (Amp de Octavia o Shock Trooper para daño,
Sharpened Bullets para el crítico, Warcry o Redline para la cadencia, Split Flights para multishot).

> Las armas con **auto-spool** (Gorgon, Kohm) hacen notablemente menos daño por instancia mientras
> su cadencia sube hacia el máximo.

La lista de enemigos con attenuation propia —Archon, Condrix, Eidolons, Guardian Eximus, Juggernaut,
Kuva Thralls, Lephantis, Orphix, Prosecutors, Sentients, Raknoids, Treasurer— está en el raw.

## Fuentes

- https://wiki.warframe.com/w/Damage_Reduction · https://wiki.warframe.com/w/Adaptation
- [`armor.md`](armor.md) · [`health.md`](health.md) · [`shield.md`](shield.md) · [`overguard.md`](overguard.md) · [`enemy-body-parts.md`](enemy-body-parts.md)
