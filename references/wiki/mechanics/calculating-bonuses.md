# Calculating Bonuses

> Estado: activo
> Rol: taxonomía de operaciones de bonus, stacking aditivo vs multiplicativo, orden de operaciones y orden de aplicación del daño de armas
> Fuente de verdad de: los 4 `OperationType` internos del juego, pools de stacking, orden de operaciones, orden de aplicación del daño, combinación de elementos, comportamiento real de multishot
> No usar para: escalado de nivel de enemigos (→ `enemy-level-scaling.md`) · DR de armor (→ `armor.md`) · fórmulas de DPS del Arsenal (**no están en esta página** — ver §Nota de procedencia)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Calculating_Bonuses
> Raw: calculating-bonuses.wikitext

## Concepto base: Percent Bonus → Multiplicador

```text
Net Multiplier = 1 + (Net Percent Bonus / 100)
```

Un bonus de +165% se aplica como `× 1.65` sobre el valor base. La wiki representa los porcentajes
como decimales y usa `1 + Net Percent Bonus` en todas sus fórmulas.

## Los cuatro `OperationType` del juego

La wiki documenta los **nombres internos** de las operaciones. Conviene usarlos: son el vocabulario
del dato, no una clasificación de terceros.

| Operación sobre el stat base | Stacking | `OperationType` | Contexto típico |
|---|---|---|---|
| Adición | **Aditivo** | `ADD` | Valores planos o *puntos porcentuales*: ±X Energy Rate, ±X Health, ±X Punch Through |
| Multiplicación | **Aditivo** | `STACKING_MULTIPLY` | El más común — casi todo bonus porcentual: ±X% Ability Strength, Armor, Energy Max, Fire Rate, Health |
| Multiplicación | **Multiplicativo** | `MULTIPLY` | Bonus de Damage Reduction, de Affinity, de Resource Drop Chance |
| Override | **No apila** | `SET` | Muy raro: fija el stat ignorando todo modificador |

Ejemplos textuales de cada uno:

```text
ADD                Final Status Chance = Base Status Chance + 20 (Entropy Burst)
ADD (negativo)     Final Critical Chance = Base Critical Chance − 10 (perk Elemental Excess del Laetum)
STACKING_MULTIPLY  Final Damage = Base Damage × (1 + 1.65 Serration + 1.65 Heavy Caliber)
MULTIPLY           Damage Taken = Initial Toxin Damage × (0.55 Antitoxin × 0.85 Toxin Resistance)
SET                No Current Leap fija energy rate en 0 · Primary Acuity fija el multishot al base del arma
```

> Ojo con `STACKING_MULTIPLY`: **multiplica** el stat base pero **apila aditivamente** con sus pares.
> El nombre describe la operación, no el stacking.

### Cuando un stat tiene ambas formas

Existen stats con bonus planos **y** porcentuales a la vez. El porcentual va primero, el plano
después:

```text
Final Magazine Capacity = 14 (Viper) × (1 + 0.3 Slip Magazine) + 40 (Stinging Truth)
```

## Stacking aditivo

Todos los bonus del mismo pool se suman **antes** de multiplicar el base.

```text
Stat Final = Base × (1 + Bonus₁ + Bonus₂ + … + Bonusₙ)
```

**Ejemplo canónico:** Serration (+165%) + Heavy Caliber (+165%)

```text
Damage = Base × (1 + 1.65 + 1.65) = Base × 4.3   →  +330%
```

**Diminishing returns relativos:** cuantos más bonus en el mismo pool, menos aporta cada nuevo en
términos *relativos* (el absoluto siempre sube).

| Bonus acumulado | Nuevo mod +90% | Ganancia relativa |
|---|---|---|
| +0% (base) | → +90% | +90% |
| +165% (Serration) | → +255% | +54.5% |
| +330% (+ Heavy Caliber) | → +420% | +27.3% |

## Stacking multiplicativo

Bonus de **pools distintos** se multiplican entre sí, sin diminishing returns.

```text
Stat Final = Base × (1 + BonusA) × (1 + BonusB) × … × (1 + Bonusₙ)
```

**Ejemplo canónico:** Serration (+165%) vs Bane of Grineer (+30% vs Grineer)

```text
vs Grineer:         Base × (1 + 1.65) × (1 + 0.30) = Base × 3.445  →  +244.5%
si fueran aditivos: Base × (1 + 1.65 + 0.30)       = Base × 2.95   →  +195%
```

## Orden de operaciones

La wiki lo resume en tres pasos, para un mismo stat fundamental:

1. Los bonus que apilan **aditivamente entre sí**.
2. Los bonus que apilan **multiplicativamente** con los anteriores.
3. Los bonus que dan un número plano o puntos porcentuales, apilando aditivamente entre sí.

```text
Resultant Stat = [ Base × (1 + Add₁ + Add₂) × (1 + SeparateAdd₁ + SeparateAdd₂) ] + Flat₁ + Flat₂
```

Y en forma compacta — producto de sumatorias, porque **un pool multiplicativo puede tener
componentes aditivos internos**:

```text
Resultant Stat = [ Base × ∏(1 + Σ Additive Stacking Bonuses) ] + Σ Flat Bonuses
```

> ⚠️ **Lo que este orden implica sobre Bane y Roar, y no es obvio.** El ejemplo textual de la wiki es:
> *"Serration y Heavy Caliber apilan aditivamente **de forma separada de** Bane of Orokin y Roar de
> Rhino, a pesar de afectar el mismo stat de daño"*, y el paso 2 dice que el bonus de Serration y
> Heavy Caliber *"apila multiplicativamente con el bonus de Bane of Orokin y Roar de Rhino"*.
>
> Leído literal: **Bane y Roar están en el mismo pool y se suman entre sí**; es *ese pool* el que
> multiplica al de Serration. No es "cada buff su propio multiplicador".
>
> Punto a verificar contra el juego antes de tratarlo como ley: la redacción es de esta página y el
> raw no la corrobora con un ejemplo numérico completo de los dos juntos.

## Orden de aplicación del daño de armas

Los mods de daño entran por una de cuatro vías: **daño base** (Serration, Hornet Strike), **físico
específico** (Fanged Fusillade, Piercing Caliber), **elemental primario** (Hellfire, Pathogen Rounds)
y **facción** (Bane of Corpus).

### 1 — Bonus de daño base

Se suman y se aplican primero. El daño agregado **mantiene la misma distribución de tipos** que el
arma tiene de forma innata.

```text
Karak (29 base) + Serration:   29 × (1 + 1.65) = 76.85   (el arsenal lo redondea a 76.9)
```

### 2 — Elemental y físico, sobre la base ya modificada

Ambos entran **en el mismo paso** y se calculan sobre el daño base modificado.

```text
+ Hellfire (+90% Heat):   29 × (1 + 1.65) × 0.9 = 69.165 de Heat
Total:                    29 × (1 + 1.65) × (1 + 0.9) = 146.015
```

### 3 — Facción, multiplicativo sobre todos los tipos

```text
+ Bane of Corpus (+30%):  29 × (1 + 1.65) × (1 + 0.9) × (1 + 0.3) = 189.82 vs Corpus
```

> El bonus de facción **no aparece en las stats del arsenal**.

Después de esto el daño puede verse afectado por crítico, armor y otras fuentes de DR.

### Daño físico: sólo sobre su propio tipo

Un mod de daño físico aplica **sólo al daño base del mismo tipo**. La Karak reparte sus 29 en 13
Impact / 8.7 Puncture / 7.3 Slash, así que Fanged Fusillade (+120% Slash) suma `7.3 × 1.2`.

**Si el arma no tiene ese tipo de daño, el mod no tiene efecto** — Fanged Fusillade en un Amprex
(100% Electricity) no aporta nada.

### Daño elemental: sobre todo el daño del arma

Un mod elemental aplica sobre todo el daño. En raw damage, **+90% elemental supera a +90% físico**
salvo que el arma haga todo su daño en un único tipo físico.

### Combinación de elementos — el orden importa

- Cada **par** de mods elementales distintos se combina en un elemento secundario.
- El orden va **de izquierda a derecha, fila de arriba y después la de abajo**, y el daño elemental
  **innato del arma se agrega al final**.
- Si hay **varios mods del mismo elemento**, sólo el **primero** participa de la combinación; los
  demás sólo aumentan la cantidad del elemento combinado ya formado.

Ejemplos de la wiki, todos sobre Amprex (Electricity innata):

```text
Hellfire + Cryo Rounds        → Blast, sumado a la Electricity base
sólo Hellfire                 → Radiation (Heat se combina con la Electricity innata)
Hellfire + Cryo + Thermite    → Blast + Electricity (el 2º Heat sólo engorda el Blast)
```

## Multishot: el arsenal muestra un promedio

Para armas de múltiples proyectiles, el daño calculado es el **de cada proyectil**. El multishot da
una **chance** de disparar proyectiles adicionales, cada uno con el daño modded completo.

> *"El arsenal muestra los bonus de multishot como aumentos del daño total cuando en realidad no lo
> son. El total del arsenal refleja el daño **promedio** por disparo."*

- Karak con sólo Split Chamber: `29 × 0.9` de aumento → promedio 55.1 por disparo.
- Un arma de un proyectil con Split Chamber (+90%): cada disparo tiene 90% de chance de tirar 2.
- Cernos Prime (3 flechas innatas) + Split Chamber: `3 × 0.9` = +2.7 → **mínimo 5 flechas**, y el 70%
  de los disparos tira 6.
- En armas de haz continuo (Glaxion), el multishot da chance de que un **tick** duplique su daño.

## Update 34 — los mods de stats base aplican al rango actual

> Dato de la wiki, pero **no de esta página**: vive en el patch history de los mods afectados
> (`https://wiki.warframe.com/w/Steel_Fiber` y equivalentes).

Antes del Update 34, los mods de Health/Shield/Energy/Armor aplicaban su multiplicador al stat de
**Rank 0**, no al que se ve en el arsenal — de ahí la "Warframe Math" de que 300 + 440% diera 740.
Desde U34 aplican al stat **en el rango actual**.

Para que el resultado final no cambiara, DE hizo tres ajustes a la vez:

1. **Bajó los multiplicadores** — Vitality y Redirection de +440% a +100%, Flow de +150% a +100%,
   Steel Fiber de +110% a +100%.
2. **Subió los stats base** de los warframes para compensar.
3. **Redujo a la mitad** lo que ganan por rango, transfiriendo esa suma al stat base.

Ejemplo textual de la wiki con Excalibur:

```text
R30 Health = 370  ×  (1 + 100% Vitality)  =  740     ← el mismo total que antes del cambio
```

## Nota de procedencia

Esta página **no contiene** fórmulas de Burst DPS ni Sustained DPS. Las versiones anteriores de este
documento las incluían; no se pudo localizar su página fuente, así que quedan fuera de
`references/wiki/` hasta poder atribuirlas — preservadas en
`.working/references-residuos-no-wiki.md`, no descartadas.

El EHP por armor sí es dato de wiki y vive donde le corresponde: [`armor.md`](armor.md).

La sección `Damage Calculations` de esta página es un transclude de `Damage/Calculation`
(→ [`enemy-resistances.md`](enemy-resistances.md), que la destila).

## Advertencias de la propia wiki

Dos `{{UpdateMe}}` en la sección de armas:

- No cubre las Kuva/Tenet con un tipo de daño primario innato que además puede tener bonus elemental
  de progenitor.
- Falta el bonus de daño elemental de fuentes que **no** son mods (habilidades de warframe) — y con
  él, cuál es la prioridad de tipo elemental en esos casos.

## Fuentes

- https://wiki.warframe.com/w/Calculating_Bonuses
