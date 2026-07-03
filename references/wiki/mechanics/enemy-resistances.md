# Enemy Resistances — modelo por facción (Update 36.0)

> Estado: activo
> Rol: modelo vigente de vulnerabilidades/resistencias de enemigos — facción×elemento, bypasses de capa, DR de armor enemigo
> Fuente de verdad de: matriz facción×elemento (±50% uniforme), multiplicadores especiales por capa, fórmula de DR de armor enemigo, orden de composición del daño, discrepancia de era con `warframe-items/Enemy.json`
> No usar para: armor/DR del jugador (ver `armor.md`) ni escalado por nivel (ver `enemy-level-scaling.md`)
> Última actualización: 2026-07-02
> Fuente: https://wiki.warframe.com/w/Damage/Overview_Table + https://wiki.warframe.com/w/Damage/Calculation

## Cambio de era — Update 36.0 (2024-06-18)

Desde **Update 36.0** el modelo de resistencias es **por facción**, no por clase de capa:

- Las 13 clases de salud/armor/shield del modelo viejo (Cloned Flesh, Ferrite Armor,
  Alloy Armor, Fossilized, Proto Shield, Machinery, Infested Sinew, etc.) **ya no rigen**.
- Cada tipo de daño es **vulnerable (+) o resistente (−) contra facciones**, con
  multiplicador **uniforme**: `+ = ×1.5` de daño entrante, `− = ×0.5`. Sin entrada = neutral (×1.0).
- Facciones del modelo (columnas de la Overview Table): Grineer, Kuva Grineer, Corpus,
  Corpus Amalgam, Infested, Infested Deimos, Orokin, Sentient, Narmer, The Murmur,
  Zariman, Scaldra, Techrot, Anarchs.

## Matriz facción×elemento

> ✅ **Verificada visualmente por el usuario (2026-07-02)** contra la Overview Table.
> Reemplaza una transcripción inicial vía fetch que estaba corrida de columnas
> (lección: tablas anchas por fetch automatizado = siempre gate visual).

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
| Radiation | Sentient, The Murmur | Anarchs |
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

## DR de armor enemigo — fórmula lineal (post-U36)

```text
DM = 1 − 0.9 × AR / 2700
```

- `AR` = armor tras strips/debuffs (Corrosive, Heat, Corrosive Projection).
- Cap de armor enemigo: **2700** → DR máxima **90%** (consistente con `enemy-level-scaling.md` §Armor).
- **No confundir** con la DR del jugador (`armor/(armor+300)`, ver `armor.md`) — coexisten.

> ⚠️ **Contradicción abierta entre páginas de la wiki:** `enemy-level-scaling.md` (fuente:
> Enemy_Level_Scaling) deriva EHP enemigo con el coeficiente viejo `/300`
> (`EHP = Health × (1 + Armor/300)`), mientras Damage/Calculation da la DR lineal de arriba.
> Ambas capturas son fieles a su página fuente; la wiki misma está desincronizada.
> **Decisión provisional (usuario, 2026-07-02):** el engine adopta la fórmula más actual
> (la DR lineal U36 de arriba); el EHP se deriva de ella (`EHP = Health / DM`). La revisión
> estructural EHP-enemigo vs EHP-jugador (la DR compone distinto en cada lado) queda
> pendiente como tema propio.

## Orden de composición del daño (Damage/Calculation)

```text
Daño base → Cuantización → Mods físicos/elementales → Multiplicadores (crit, faction)
  → Modificadores de tipo (matriz ±) → DR de armor → capa golpeada
```

- **Cuantización:** `escala = daño_base_modificado / 32`; cada tipo de daño se redondea a
  múltiplos de esa escala **antes** de los multiplicadores. (Detalle de precisión fina —
  presupuestar si se modela o se ignora; error esperable < un dígito porcentual.)
- Los modificadores de tipo multiplican valores ya cuantizados; no participan de la
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
