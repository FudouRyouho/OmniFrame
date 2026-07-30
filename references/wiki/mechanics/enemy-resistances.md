# Enemy Resistances — modelo por facción (Update 36.0)

> Estado: activo
> Rol: modelo vigente de vulnerabilidades/resistencias de enemigos — facción×elemento, bypasses de capa, DR de armor enemigo
> Fuente de verdad de: matriz facción×elemento (±50% uniforme), multiplicadores especiales por capa, fórmula de DR de armor enemigo, orden de composición del daño, discrepancia de era con `warframe-items/Enemy.json`
> No usar para: armor/DR del jugador (ver `armor.md`) ni escalado por nivel (ver `enemy-level-scaling.md`)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Damage/Overview_Table + https://wiki.warframe.com/w/Damage/Calculation
> Raw: damage-overview-table.wikitext · damage-calculation.wikitext

## Cambio de era — Update 36.0 (2024-06-18)

Desde **Update 36.0** el modelo de resistencias es **por facción**, no por clase de capa:

- Las 13 clases de salud/armor/shield del modelo viejo (Cloned Flesh, Ferrite Armor,
  Alloy Armor, Fossilized, Proto Shield, Machinery, Infested Sinew, etc.) **ya no rigen**.
- Cada tipo de daño es **vulnerable (+) o resistente (−) contra facciones**, con
  multiplicador **uniforme**: `+ = ×1.5` de daño entrante, `− = ×0.5`. Sin entrada = neutral (×1.0).
- Facciones del modelo — la Overview Table tiene **15 columnas**: **Tenno**, Grineer, Kuva Grineer,
  Corpus, Corpus Amalgam, Infested, Infested Deimos, Orokin, Sentient, Narmer, The Murmur,
  Zariman, Scaldra, Techrot, Anarchs.
- **La columna Tenno está vacía para los 16 tipos de daño.** Los Tenno no tienen vulnerabilidades ni
  resistencias por tipo: todo daño que reciben es neutral (×1.0). Por eso el lado del jugador no
  necesita matriz — sólo armor y DR.

## Matriz facción×elemento

> ✅ **Verificada contra el raw, celda por celda** (16 tipos × 15 facciones). Coincide en 15 de los
> 16 tipos con la verificación visual previa; la única corrección fue **Radiation resistente a
> Orokin**, que faltaba.

| Tipo | Vulnerable (+, ×1.5) | Resistente (−, ×0.5) |
|---|---|---|
| Impact | Grineer, Kuva Grineer, Scaldra, Anarchs | — |
| Puncture | Corpus, Orokin | — |
| Slash | Infested, Narmer | — |
| Heat | Infested | Kuva Grineer |
| Cold | Sentient | Techrot |
| Electricity | Corpus Amalgam, The Murmur, Anarchs | — |
| Toxin | Narmer | — |
| Blast | Infested Deimos | Corpus Amalgam |
| Corrosive | Grineer, Kuva Grineer, Scaldra | Sentient |
| Gas | Infested Deimos, Techrot | Scaldra |
| Magnetic | Corpus, Corpus Amalgam, Techrot | Narmer |
| Radiation | Sentient, The Murmur | **Orokin**, Anarchs |
| Viral | Orokin | Infested Deimos, The Murmur |
| Void | Zariman | — |
| Tau | — | — |
| True | — | — |

## Bypasses y multiplicadores especiales de capa

Independientes de la matriz por facción (mecánicos, no de balance):

| Mecánica | Comportamiento |
|---|---|
| **Toxin** | Bypasa shields — daña salud directamente |
| **Slash (Bleed)** | El tick del proc es daño True — ignora armor |
| **Magnetic** | Daño amplificado contra Shields, Overguard y burbujas de Nullifier; niega recarga de shields; único status con stacking propio contra Overguard (ver `overguard.md`) |
| **Viral** | Amplifica el daño recibido en la capa de salud (ver `status-effects.md` §Infection) |
| **True** | Ignora armor, shields y resistencias; sin proc asociado |

## DR de armor enemigo — raíz cuadrada, no lineal

Transcripción literal de `Damage/Calculation`, como multiplicador de daño:

```text
DM = 1 − 0.9 · √(AR / 2700)
```

Es decir `DR = 0.9 · √(AR/2700)`, que es **algebraicamente idéntico** a `√(3·AR)/100`:
`0.9/√2700 = 0.0173205… = √3/100`.

- `AR` = armor tras strips/debuffs (Corrosive, Heat, Corrosive Projection).
- Cap de armor enemigo: **2700** → DR máxima **90%** exacta (`0.9 · √(2700/2700) = 0.9`).
- **No confundir** con la DR del jugador (`armor/(armor+300)`, ver `armor.md`) — coexisten, y la
  página `Armor` las separa explícitamente por sujeto. Ojo: `armor.md` documenta además que un
  enemigo con `AR > 2700` (condición excepcional) usa la forma del jugador.

`Enemy_Level_Scaling` deriva el EHP **enemigo** con el coeficiente 300
(`EHP Multiplier = Health Multiplier × (1 + Base Armor × Armor Multiplier / 300)`) — la forma del
**jugador**, no la de arriba.

> ⚠️ Conflicto ↔ [`enemy-level-scaling.md`](enemy-level-scaling.md) §EHP

## Orden de composición del daño (Damage/Calculation)

```text
Daño base → Cuantización → Mods físicos/elementales → Multiplicadores (crit, faction)
  → Modificadores de tipo (matriz ±) → DR de armor → capa golpeada
```

- **Cuantización:** cada tipo de daño (físico y elemental) se redondea a múltiplos de **1/32** del
  daño base del ataque **antes** de cualquier multiplicación posterior. La regla exacta del raw:

  ```text
  Scale = Modded Base Damage / 32
  Quantized(x) = sign(x) × ⌊|x| × 32 + 0.5⌋ / 32
  Quantized Damage Type Value = Quantized(x) × Modded Base Damage
  ```

  El `+0.5` dentro del piso es redondeo al más cercano, y el `sign()` preserva el signo operando
  sobre la magnitud. El número del **popup** se redondea además a entero — es un segundo redondeo,
  posterior, y no es el valor que usa el cálculo de misión.
- **Un multiplicador no-elemental no rompe la cuantización.** La wiki es explícita: Serration, Bane
  of Grineer y cualquier bonus no-elemental multiplican **tanto el numerador como la Scale**, así que
  actúan como multiplicador simple sobre un total ya cuantizado — no alteran la escala ni la
  composición del daño.
- Los modificadores de tipo (matriz ±) multiplican valores ya cuantizados; no participan de la
  composición de mods.

## Discrepancia de era en `warframe-items/Enemy.json`

Auditado 2026-07-02 (638 enemigos):

- El campo `resistances` trae el modelo **pre-U36** (13 clases: Shield 591×, Ferrite Armor 490×,
  Cloned Flesh 246×, Flesh 180×, Robotic 153×, Alloy Armor 130×, Proto Shield 41×, Fossilized 21×,
  Machinery 14×, Infested Flesh 14×, Infested 10×, Infested Sinew 3×, None 21×) con `affectors`
  de modificadores variados (+0.75/−0.5/etc.) — **era muerta, NO usar como fuente de eficiencias**.
- Siguen siendo válidos como fuente: `health`/`shield`/`armor` (stats base), `type`
  (facción: Grineer 236, Corpus 212, Infestation 53, Orokin 36, Sentient 16…) y `uniqueName`.
- Gotcha: el campo `faction` solo está poblado en 33/638 — la facción real sale de `type`.

## Fuentes

- https://wiki.warframe.com/w/Damage/Overview_Table
- https://wiki.warframe.com/w/Damage/Calculation
- `warframe-items/data/json/Enemy.json` (audit 2026-07-02)
