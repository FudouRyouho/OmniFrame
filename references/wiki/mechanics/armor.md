# Armor

> Estado: activo
> Rol: fórmula de armor, reducción de daño (Tenno y enemigo) y fuentes (planas vs porcentuales)
> Fuente de verdad de: cálculo de Total Armor, las **dos** fórmulas de DR por armor, EHP, clamps del armor enemigo, taxonomía de armor stripping, distinción flat post-escala vs porcentaje
> No usar para: tablas completas de armor por warframe · cálculo de Effective Health detallado (→ `health.md`) · fuentes de DR que no son armor (→ `damage-reduction.md`)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Armor
> Raw: armor.wikitext

## Fórmula base

```text
Total Armor = Base Armor × (1 + Mod Multiplier) + Flat Bonus
```

- `Base Armor` — valor base del warframe. **No cambia con el rank**, con la excepción de Nidus,
  Lavos y Kullervo.
- `Mod Multiplier` — suma de todos los mods porcentuales. Se **suman entre sí** antes de multiplicar
  por el base.
- `Flat Bonus` — se suma **después** del pool de mods, así que no se amplifica. La wiki escribe esta
  forma para los arcanos (`Total Armor = Base Armor(1 + Mod Multiplier) + Arcane Bonus`); los shards
  y Stone Skin se comportan igual.

## Reducción de daño — son DOS fórmulas, no una

La wiki las separa por **sujeto**. Confundirlas es el error fácil: difieren mucho en el rango de
armor que aparece en juego.

### Tenno

```text
DR = Net Armor / (Net Armor + 300)
```

300 de armor reduce el daño a la mitad; 600 deja pasar el 33%; 900 deja pasar el 25%.

### Enemigo (cálculo NPC estándar), con `Net Armor ≤ 2700`

```text
DR = 90% × √(Net Armor / 2700)
```

Es **algebraicamente idéntica** a `√(3 × armor) / 100` — la forma que usa el calculador de la propia
wiki. No son dos fórmulas rivales:

```text
0.9 / √2700  =  0.0173205…  =  √3 / 100
```

La página `Damage/Calculation` la escribe como multiplicador de daño y coincide:
`DM = 1 − 0.9·√(AR/2700)`.

### Enemigo con `Net Armor > 2700`

Condición excepcional. Cae de vuelta a la forma del Tenno:

```text
DR = Net Armor / (Net Armor + 300)
```

### Clamps del armor enemigo

El escalado por nivel acota el armor **inicial** del enemigo entre **200 y 2700**. El armor stripping
**sí** puede bajarlo por debajo de 200. El cap de 2700 equivale exactamente al 90% de DR
(`0.9 × √(2700/2700) = 0.9`).

Steel Path **no** aumenta el armor.

### Piso de 1 de daño — por tipo de daño

> *"When damage is reduced from armor, each damage type has a minimum damage of 1."*

El piso se aplica **por cada tipo de daño de la instancia**, no por la instancia. La wiki lo ejemplifica:
una Braton siempre inflige **mínimo 3** de daño contra un objetivo con armor, sin importar cuánto
armor tenga, porque reparte su daño en 3 tipos.

**Las fuentes de DR que no son armor no tienen este piso.**

## Effective Health

```text
EHP = Nominal Health / (1 − DR)
```

Con la DR del Tenno se simplifica a:

```text
EHP = Nominal Health × (Net Armor + 300) / 300
```

Ejemplos de la wiki: 1000 de health con 100 de armor → DR 25% → ~1.333 EHP; con 600 de armor →
DR 67% → ~3.000 EHP.

> La simplificación **sólo vale para la forma `A/(A+300)`**. Con la DR de enemigo hay que pasar por
> `1/(1−DR)`.

## Fuentes de Flat Bonus (plano post-escala)

> ℹ️ **Ejemplo construido por el proyecto**, no citado de la wiki. La *ley* sí es de la wiki
> (`Total Armor = Base Armor(1 + Mod Multiplier) + Arcane Bonus`); los valores también (Oberon 450,
> Umbral Fiber +100%, Tauforged Azure +225). Lo propio es el armado del caso.

```text
450 × (1 + 100% Umbral Fiber) = 900
900 + 225 (Tauforged Azure Shard) = 1125
```

Si fuera pre-escala: `(450 + 225) × 2 = 1350` — resultado que el juego no produce.

| Fuente | Valor |
|---|---|
| Azure Archon Shard | +150 cada uno |
| Tauforged Azure Archon Shard | +225 cada uno |
| Stone Skin (Focus — Unairu) | +50 / 100 / 150 / 200 |
| Arcanos de armor | Guardian, Reaper, Tanker, Ultimatum, Melee Fortification · Magus Husk (solo Operator) |

> **Stone Skin** no está descripto en la página `Armor` (viene transcluido). Según
> `https://wiki.warframe.com/w/Focus/Unairu`: el bonus es plano, se suma **después de mods y
> habilidades**, y **no acumula con nada**.

### Habilidades con bonus plano de armor

Temporales (duran mientras la habilidad está activa), se suman en el mismo bucket plano:

| Fuente | Warframe | Notas |
|---|---|---|
| Rubble (pasiva) | Atlas | Apila hasta +1500, se pierde si no se alimenta |
| Feast (pasiva) | Grendel | Armor por enemigo engullido |
| Parasitic Armor (augment) | Nidus | Convierte stacks en armor temporalmente |
| Plunder | Yareli | Roba armor de enemigos — plano |

## Fuentes de Mod Multiplier (porcentaje)

| Fuente | Ejemplo |
|---|---|
| Mods % de armor | Steel Fiber (+100%), Umbral Fiber (+100%), Armored Agility (+40%), Stand United, Gladiator Aegis, Health Conversion, Ironclad Charge, Mecha Pulse, los Carapace de Deimos · Shepherd / Link Fiber / Metal Fiber / Synth Fiber (solo companion) |
| Habilidades % de armor | Warcry (Valkyr), Vex Armor / Elemental Ward (Chroma), Roar (multiplicativo) |

**Steel Fiber a rango máximo da +100%** (multiplicador `1.0`), y `1.40` con Armored Agility (+40%)
también equipado.

> ⚠️ **Los ejemplos de cálculo de esta página están desactualizados.** Seis de ellos —Iron Skin,
> Snow Globe, Warding Halo, Tectonics, Rumblers y Crystallize— operan con `2.1` o `+ 1.1`, es decir
> con el **+110% viejo**. La página `Steel Fiber` registra el cambio en su patch history:
> *"Steel Fiber: Reduced from +110% to +100% Armor"*. La oración de esta sección es la correcta; los
> ejemplos quedaron sin actualizar.
>
> Autoridad de la marca: **la wiki se corrige a sí misma** (patch history de
> `https://wiki.warframe.com/w/Steel_Fiber`). No es una contradicción sin ganador.

## No existe armor plano pre-escala

No hay ninguna mecánica conocida que añada armor plano *antes* del pool de mods (es decir,
amplificado por ellos). Todo armor plano es post-escala.

## Armor stripping — tres clases, no una

La distinción es mecánica, no cosmética: define si hay **diminishing returns**.

### 1 — Porcentaje del armor **total** (máximo)

Sin diminishing returns: dos casts de un strip del 50% lo quitan todo.

| Fuente | Cuánto |
|---|---|
| Corrosive Projection (aura) | −18%, hasta **−72%** con escuadra completa |
| Sharpened Claws (Kavat) | −120% |
| Vicious Bond (companion) | −15% con ataques melee |
| Habilidades de warframe | según la habilidad — **siempre sobre el total** |

### 2 — Porcentaje del armor **actual**

**Con** diminishing returns. Sólo Heat y Corrosive.

| Status | Cuánto | Duración |
|---|---|---|
| **Heat** | −50% del armor **actual** | mientras dure el status |
| **Corrosive** | −26% el primer proc, **+6% por proc** adicional, hasta **−80%** (10 stacks) | 8 s |

### 3 — Valor plano del **base armor**

Reduce el base, lo que arrastra el total.

| Fuente | Cuánto |
|---|---|
| Shattering Impact | −6 base armor al infligir Impact |
| Amalgam Argonak Metal Auger | −6 base armor con dagas simples |

## Interacciones relevantes

| Mecánica | Comportamiento |
|---|---|
| **Heat** | Strip del **50% del armor actual**, temporal (ver arriba) |
| **Corrosive** | Strip del armor **actual** en stacks — hasta 80% |
| **Viral** | No afecta armor — amplifica daño a la salud |
| **Magnetic** | No afecta armor — afecta shields |
| **Adaptation** | DR adicional, **no** es armor → `damage-reduction.md` |

## Fuentes

- https://wiki.warframe.com/w/Armor
- https://wiki.warframe.com/w/Damage/Calculation (la misma fórmula de DR enemigo, como multiplicador)
- https://wiki.warframe.com/w/Focus/Unairu (nota de Stone Skin)
- [`damage-reduction.md`](damage-reduction.md) · [`health.md`](health.md) · [`enemy-level-scaling.md`](enemy-level-scaling.md)
