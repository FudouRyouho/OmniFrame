# Enemy Level Scaling

> Estado: activo
> Rol: fórmulas de escalado de stats de enemigos por nivel
> Fuente de verdad de: curva S post-Update 27.2, coeficientes por facción, EHP derivado
> No usar para: drops, afinidad de jugador o mecánicas de spawn
> Última actualización: 2026-07-19 (re-captura vía `?action=raw` — corrige tablas health/shield stale:
> grupos Murmur/Unaffiliated/Anarchs, coefs exactos 16.0998/15.0998, contradicción Anarchs del wiki)
> Fuente: https://wiki.warframe.com/w/Enemy_Level_Scaling (raw en `raw/enemy-level-scaling.wikitext`)
> Fuente actualizada: 2026-07-29
> Raw: enemy-level-scaling.wikitext

## Fórmula base universal

```
Stat Actual = Stat Base × (1 + Coeficiente × (Nivel Actual − Nivel Base)^Exponente)
```

Donde `Δx = Nivel Actual − Nivel Base`.

## Curva S — Update 27.2

Desde Update 27.2 el escalado sigue una **curva S**. La región se elige por **Δx = (Nivel Actual −
Nivel Base)**, NO por nivel absoluto:
- **Δx < 70**: `f1` — crecimiento rápido (exponente alto)
- **Δx > 80**: `f2` — crecimiento lento (exponente bajo)
- **70 ≤ Δx ≤ 80**: **smoothstep** entre `f1` y `f2` (no lineal):
  ```
  T = (Δx − 70) / 10        S = 3T² − 2T³        mult = f1 + (f2 − f1)·S
  ```

Cada facción tiene coeficientes distintos para las dos mitades de la curva.

## Health por facción

Los tab-headers del wiki agrupan facciones que comparten coeficientes (`Corrupted` = tipo Void, facción
**Orokin**; no es una facción propia).

| Grupo (tab del wiki) | Fórmula < 70 | Fórmula > 80 |
|---|---|---|
| Grineer / Scaldra | `1 + 0.015(Δx)^2.12` | `1 + 10.7332(Δx)^0.72` |
| Corpus | `1 + 0.015(Δx)^2.12` | `1 + 13.4165(Δx)^0.55` |
| Infested | `1 + 0.0225(Δx)^2.12` | `1 + 16.0998(Δx)^0.72` |
| Anarchs* / Corrupted (=Orokin) | `1 + 0.015(Δx)^2.1` | `1 + 10.7332(Δx)^0.685` |
| Murmur / Sentient / **Unaffiliated (default)** / Anarchs* | `1 + 0.015(Δx)^2` | `1 + 10.7332(Δx)^0.5` |
| Techrot | `1 + 0.02(Δx)^2.12` | `1 + 15.0998(Δx)^0.7` |

> **⚠️ Anarchs (health): el wiki se contradice.** Aparece a la vez en el tab "Anarchs, Corrupted"
> (`^2.1/^0.685`) y en la prosa del grupo "Murmur, Sentient, Anarchs, Unaffiliated" (`^2/^0.5`). Sin
> resolver — adoptar lo más honesto y verificar por medición, como ya se hizo con la DR de armadura
> enemiga. En **shields
> no hay ambigüedad**: Anarchs = grupo Corrupted.
>
> **Default para facción no reconocida = "Unaffiliated" → grupo `^2/^0.5` (el de Sentient), NO Grineer.**
> Relevante porque el motor cae a Grineer por defecto (delta código↔fuente).

## Shields por facción

| Grupo (tab del wiki) | Fórmula < 70 | Fórmula > 80 |
|---|---|---|
| Corpus | `1 + 0.02(Δx)^1.76` | `1 + 2(Δx)^0.76` |
| Anarchs / Corrupted (=Orokin) | `1 + 0.02(Δx)^1.75` | `1 + 2(Δx)^0.75` |
| Grineer / Sentient | `1 + 0.02(Δx)^1.75` | `1 + 1.6(Δx)^0.75` |
| Techrot | `1 + 0.02(Δx)^1.76` | `1 + 3.5(Δx)^0.76` |

Infested no lleva escudo (sin fila). El wiki no documenta grupo Unaffiliated para shields.

## Armor — fórmula única para todas las facciones

```
< 70:  1 + 0.005(Δx)^1.75
> 80:  1 + 0.4(Δx)^0.75
```

**Aplicación (orden exacto, del gadget `ext.gadget.enemyinfoboxslider`, RESUELTO 2026-07-06):**
```
armor = floor(base_armor × armor_multi)
if (armor > 0) { armor = min(armor, 2700); armor = max(armor, 200); }   // clamp SOLO si tiene armor
```
El **floor de 200 aplica siempre** que `armor>0` — incluso a nivel base (Arid Butcher base 5 → 200; el 5 es
nominal). Un enemigo con base armor 0 (sin armadura) NO recibe el floor (queda 0).

**DR desde armor (⚠️ NO es `armor/(armor+300)` — esa está obsoleta):**
```
DR = √(3 × armor) / 100          (cap: armor 2700 → 90%)
```
El gadget la redondea a 4 decimales para display/EHP. `EHP = health/(1 − DR) + shields + overguard`.

> ✅ Validado: Arid Butcher (Grineer, base 50 hp / 5 armor) @215 → health **25.612,14**, armor **200**,
> DR **24,49%**, EHP **33.918,87** — los 4 campos del calculador, exactos (`enemy-scaling.test.ts`). El
> script del gadget es el oráculo (el juego no muestra HP numérico). Confirmar la DR contra un popup en #1.

## Modificadores de base y ORDEN de aplicación (del gadget)

El health/shield BASE se modifica ANTES del escalado por nivel, en este orden exacto:

1. **Base** de la unidad (o `eximus_*` base si es Eximus — algunos enemigos tienen base distinta; el
   Codex NO refleja el incremento Eximus). Overguard base Eximus = **12** (default).
2. **Steel Path** (si aplica): `base_health += steel_path_health_bonus` (flat por-enemigo); idem shield.
3. **Empowered/Archimedea** (si aplica): `base_health += archimedea_health_bonus` (flat).
4. **Eximus** (si aplica): escalado piecewise de health/shield (ver §Escalado de Eximus).
5. **Steel Path ×2.5**: `base_health ×= 2.5`, `base_shield ×= 2.5`.
6. **Empowered ×N** por player_count: 1→**2.5**, 2→**3.0**, 3→**3.5**, 4→**4.0** (health y shield).
7. **Recién ahora** el escalado por nivel (curva-S `f1/f2/smoothstep`) sobre la base ya modificada.

**Overguard:** misma forma que health pero con transición **45-50** (no 70-80): `1 + og_f1 + (og_f2−og_f1)·smoothstep(45,50,Δx)`.

**Affinity:** `floor(base_affinity × (coef + √(NivelActual) × 0.1425))`, `coef = 1` normal / **3** Eximus.

> Fuente autoritativa de TODO lo anterior: `references/temp/ext.gadget.enemyinfoboxslider-script-0.js`
> (el gadget del calculador del wiki). Diferido en el engine hasta abrir el frente Eximus/SP (gate de
> honestidad — Arid Butcher normal primero).

## Damage (daño de enemigos)

```
Estándar:              1 + 0.015(Δx)^1.55
Corpus/Grineer/Techrot: transición suave de 1+0.015(Δx)^1.75 a 1+0.0075(Δx)^1.55
```

Multiplicadores adicionales por facción:
- Corpus / Grineer / Techrot: ×2
- Infested: ×3

## Affinity (afinidad)

Fórmula especial — **no resta nivel base**:

```
Affinity = 1 + 0.1425 × Nivel^0.5
Eximus:    3 + 0.1425 × Nivel^0.5
```

## Estadísticas derivadas — EHP

```
Solo health:           EHP = Health
Health + shields:      EHP = Health + Shields × (Shields_Base / Health_Base)
Health + armor:        EHP = Health × (1 + Armor_Base × Armor_Mult / 300)
Los tres:              combinación de las dos fórmulas anteriores
```

> ⚠️ Conflicto ↔ [`enemy-resistances.md`](enemy-resistances.md) §DR de armor enemigo

## Escalado de Eximus

Los Eximus usan el escalado de health de su facción **más un incremento de health base SEPARADO,
dependiente del nivel** (`x` = level difference). El health del Codex NO es el base del Eximus antes de
este incremento. Piecewise (`Base Health` = health base de la unidad):

**Con Shields o Armor** (coeficiente 0.25):
```
x ≤ 15:        max(BH×1.1, 0.25×(BH+900))
15 < x ≤ 25:   max(BH×1.1, 0.25×(BH+900)×[1 + 0.025×(x−15)])
25 < x ≤ 35:   max(BH×1.1, 0.25×(BH+900)×[1.25 + 0.125×(x−25)])
35 < x ≤ 50:   max(BH×1.1, 0.25×(BH+900)×[2.5 + (2/15)×(x−35)])
50 < x ≤ 100:  max(BH×1.1, 0.25×(BH+900)×[4.5 + 0.03×(x−50)])
x > 100:       max(BH×1.1, 0.25×(BH+900)×6)
```

**Sin Shields ni Armor**: idéntico pero con coeficiente **0.375** en vez de 0.25.

> Diferido en el engine (gate de honestidad): modelamos Arid Butcher **normal** primero; Eximus (+
> overguard) y Steel Path son capas aparte, se activan con su propio caso/dato. Ver Eximus + The Steel Path.

## Misiones sin fin

Durante Supervivencia y Defensa el nivel de spawn aumenta exponencialmente hasta nivel 5000 (≈4 horas), luego linealmente hasta el cap de 9999.

**Disrupción:**
```
Nivel = Nivel_Inicial + Σ 2.59 × e^(0.139 × Número_Ronda)
```

> Nota: las fórmulas documentadas provienen de testing in-game, no de fuentes oficiales de DE.
