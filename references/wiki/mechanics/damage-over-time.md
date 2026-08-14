# Damage over Time

> Estado: activo
> Rol: ley general de los efectos de daño sobre tiempo — cuántos ticks hay, qué buffs escalan el tick y cuáles no, y qué los detona
> Fuente de verdad de: fórmula de conteo de ticks, la lista de qué escala un DoT (y las excepciones que sorprenden), detonación anticipada
> No usar para: el efecto de cada status por separado (→ `status-effects.md`) · el double-dip de facción en particular (→ `faction-damage.md`)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Damage_over_Time
> Fuente actualizada: 2026-08-04
> Raw: damage-over-time.wikitext

## Cuántos ticks

```text
Total Ticks = ⌊ Tick Rate × (Duration − Delay Time) ⌋ + 1
Total Damage over Time = Damage per Tick × Total Ticks
```

- Los **status effects** tickean **1 vez por segundo**. Un Bleed de 6 segundos hace 6 ticks.
- Las **habilidades de warframe** suelen tickear **2 veces por segundo**. Una habilidad de "600 por
  tick" que tickea dos veces por segundo hace 1.200 de DoT.
- Si el tick rate no divide exacto la duración, **se redondea hacia abajo**. Con tick rate 2/s y
  duración 3.4 s: el primer tick va en 0, y los siguientes cada 0.5 s hasta el segundo 3 — el
  siguiente caería en 3.5 s, después del final. **Total: 7 ticks.**

> ⚠️ Conflicto ↔ [`damage-elemental-primary.md`](damage-elemental-primary.md) §Electricity
>
> ⚠️ Conflicto ↔ [`damage-elemental-combined.md`](damage-elemental-combined.md) §Gas

La fórmula reproduce cuatro de los seis DoT documentados, y **falla exactamente en los dos que no
tienen retardo**:

| DoT | Retardo | Duración declarada | Fórmula | Tabla de su subpágina | |
|---|---|---|---|---|---|
| Slash · Toxin · Heat | 1 s | 6 s | 6 | 6 · s1..s6 | ✓ |
| **Electricity · Gas** | 0 s | **6 s** | **7** | **6 · s0..s5** | ✗ |
| Sear (Heat/Railjack) | 0 s | **5 s** | 6 | 6 · s0..s5 | ✓ |

**El desacuerdo no está en la fórmula, está en la duración declarada.** Sear tiene la *misma
ventana* que Electricity y Gas —seis ticks en s0..s5— pero su página la llama **5 s** y las de
Electricity y Gas la llaman **6 s**. Con 5 s, la fórmula acierta en los tres.

La página general se contradice además consigo misma: dice *"Bleed ticks 6 times over a 6 second
duration"*, y por su propia fórmula con retardo 0 eso daría 7.

**Sin resolver.** Se cierra midiendo in-game si la ventana de Electricity dura 5 o 6 segundos — no
cuántos ticks hace, que en eso las tres tablas ya coinciden.

## DoT Damage Scaling — qué escala el tick

La regla general: **si algo afectó al hit inicial, también beneficia al efecto de daño resultante.**

| Escala el DoT | |
|---|---|
| Damage buffs y mods | Furious Javelin, Eclipse, Serration, Vex Armor |
| Debuffs sobre el enemigo | Molecular Prime, Rest & Rage |
| Mods elementales relevantes | Hellfire, Malignant Force |
| Críticos y **Stealth Damage Bonus** | |
| Status Damage | Rifle Elementalist |
| **Melee Combo Counter** y **Sniper Combo Counter** | |
| **Multiplicadores de parte del cuerpo** | → [`enemy-body-parts.md`](enemy-body-parts.md) |
| **Faction Damage Bonus** | Bane of Infested, **Roar** — y se aplica **dos veces** |

### Las excepciones que no son obvias

- **Weakspots de Sonar / Detect Vulnerability**: aumentan **sólo el hit inicial**, **no** el daño del
  proc. Es la diferencia con los multiplicadores de parte del cuerpo, que sí escalan el DoT.
- **Los mods físicos no buffean el DoT físico**: Sawtooth Clip no aumenta el daño de un status de
  Slash. La regla elemental aplica sólo a status **elementales**.
- **Los DoT de status combinados (Gas, Blast) NO se buffean con los mods de sus componentes.**
  Thermite Rounds + Infected Clip no aumentan el DoT de Gas. La única forma es con daño elemental
  **literal**: Leaded Gas, Valence Formation, Thermal Transfer.
- **Y funciona al revés:** usar Toxic Lash con mods de Corrosive (Infected Clip + Stormbringer)
  **sí** buffea el DoT de Toxin forzado.

### El double-dip de facción

El faction bonus ya afectó al hit inicial, y **se aplica una vez más** al calcular el status. Ejemplo
textual de la wiki, con el exponente anotado *"Faction Damage gets applied twice for this"*:

```text
Bleed por tick = 100 × (1 + 1.65 Serration) × 0.35 × (1 + 0.3 Bane)² × (1 + 0.9 Rifle Elementalist)
```

Detalle y evidencia medida en [`faction-damage.md`](faction-damage.md).

## Duración

Mods que extienden la duración de los DoT de status: Augur Seeker, Continuous Misery, Frenzied
Posture, Hunter Track, Lasting Sting, Lingering Torment, Perpetual Agony, Rapid Resilience, Toxic
Sequence.

**Sickening Pulse** no extiende la duración base: crea una **nueva instancia de proc con timers
nuevos**, lo que en la práctica alarga el efecto activo.

## Detonación

Estos efectos **terminan el DoT antes de tiempo** pero aplican **todos sus ticks restantes en una
sola instancia de daño**:

- Expedite Suffering
- Final Verse (Tragedy)
- Divine Retribution
- Ataque pesado de Harmony

## Fuentes

- https://wiki.warframe.com/w/Damage_over_Time
- [`status-effects.md`](status-effects.md) · [`faction-damage.md`](faction-damage.md) · [`enemy-body-parts.md`](enemy-body-parts.md)
