# Calculating Bonuses

> Estado: activo
> Rol: stacking aditivo vs multiplicativo, orden de operaciones y fórmulas de DPS del Arsenal
> Fuente de verdad de: pools de stacking, orden de operaciones de mods, fórmulas de DPS/EHP
> No usar para: escalado de nivel de enemigos (ver `enemy-level-scaling.md`) o DR de armor (ver `damage-reduction.md`)
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Calculating_Bonuses

## Concepto base: Percent Bonus → Multiplicador

```
Net Multiplier = 1 + (Net Percent Bonus / 100)
```

Un bonus de +165% se aplica como `× 1.65` sobre el valor base.

## Cuatro tipos de operación

| Tipo | Stacking | Ejemplo |
|---|---|---|
| Flat Value | Aditivo entre sí | ±X Energy Rate, ±X Health |
| Percent Bonus | Aditivo entre sí | ±X% Damage, ±X% Ability Strength |
| Conditional Percent | Multiplicativo entre sí | Faction bonuses, procs de estado |
| Override | Reemplaza — no apila | valor fijo |

---

## Stacking aditivo (porcentaje)

Todos los bonuses del mismo pool se suman **antes** de multiplicar el valor base.

```
Stat Final = Base × (1 + Bonus1 + Bonus2 + ... + BonusN)
```

**Ejemplo canónico:** Serration (+165%) + Heavy Caliber (+165%)
```
Damage = Base × (1 + 1.65 + 1.65) = Base × 4.3  →  +330%
```

**Diminishing returns aditivos:** a mayor cantidad de bonuses en el mismo pool, cada nuevo bonus
aporta menos valor *relativo* (aunque el valor absoluto siempre aumenta).

| Bonus acumulado | Nuevo mod +90% | Ganancia relativa |
|---|---|---|
| +0% (base) | → +90% | +90% |
| +165% (Serration) | → +255% | +54.5% |
| +330% (+ Heavy Cal) | → +420% | +27.3% |

---

## Stacking multiplicativo

Bonuses de **pools distintos** (condiciones diferentes) se multiplican entre sí.

```
Stat Final = Base × (1 + BonusA) × (1 + BonusB) × ... × (1 + BonusN)
```

**Sin diminishing returns.** Cada multiplicador mantiene su potencia independientemente.

**Ejemplo canónico:** Serration (+165%) vs Bane of Grineer (+30% vs Grineer)
```
vs Grineer: Base × (1 + 1.65) × (1 + 0.30) = Base × 3.445  →  +244.5%
Si fueran aditivos: Base × (1 + 1.65 + 0.30) = Base × 2.95  →  +195%
```

El multiplicativo siempre da mayor resultado cuando ambos pools son positivos.

**Ejemplos de multiplicativos independientes:**
- Bane of Grineer / Corpus / Infested / Orokin (faction mods)
- Rhino Roar
- Eclipse
- Viral proc (hasta ×4.25 en health)
- Headshot (×2)
- Procs de estado (Viral, Heat, etc.)

---

## Orden de operaciones — implementación canónica

```
1. Bonuses aditivos del primer pool (todos los ADD del mismo tipo)
2. Multiplicativos independientes (MULTIPLICATIVE, uno a la vez)
3. Flat bonuses post-escala (ADD_FLAT)
```

**Fórmula completa:**

```
Stat = [Base × (1 + ΣAdd_Pool1) × (1 + ΣAdd_Pool2) × (1 + Mult1) × (1 + Mult2) ...] + ΣFlat
```

O de forma compacta:
```
Stat = [Base × ∏(1 + ΣAdditive_por_pool)] + ΣFlat
```

---

## Orden de aplicación para daño de armas

### Step 1 — Base Damage bonus (porcentaje aditivo)
```
Modified_Base = Base × (1 + BaseDamageBonus%)
```
*Pool: Serration, Hornet Strike, Primed Point Blank, etc.*

### Step 2 — Elemental y Physical damage (porcentaje sobre la base modificada)
```
Elemental_Damage = Modified_Base × ElementalBonus%
Physical_Specific = Modified_Base × PhysicalTypeBonus% (solo si el arma tiene ese tipo)
```

### Step 3 — Faction bonus (multiplicativo sobre el total)
```
Total_vs_Faction = (Modified_Base + Elemental + Physical) × (1 + FactionBonus%)
```

**Ejemplo completo:** Karak (29 base damage) con Serration (+165%), Hellfire (+90% Heat), Bane of Corpus (+30%)
```
Step 1: 29 × (1 + 1.65) = 76.85 Impact/Slash/Puncture
Step 2: 76.85 × 0.90 = 69.165 Heat  →  Total: 146.015
Step 3: 146.015 × 1.30 = 189.82 daño total vs Corpus
```

---

## Daño Físico — regla importante

Los mods de daño físico específico (Fanged Fusillade para Slash, etc.) aplican **solo al base damage del mismo tipo**. Si el arma no tiene ese tipo de daño innato, el mod **no tiene efecto**.

```
New_Slash = Slash_Base × (1 + SlashBonus%)
```

---

## DPS Formulas del Arsenal

### Total Damage (Arsenal display, sin críticos, sin facción)

```
Arsenal_Total = Base × [1 + ElementalBonus + (Impact% × ImpactBonus) + (Slash% × SlashBonus) + (Puncture% × PunctureBonus)]
              × (1 + DamageBonus)
              × [Base_Multishot × (1 + MultishotBonus)]
```

### Average Shot (disparo promedio con críticos)

```
Average_Shot = Total_Damage × (1 + Crit% × (CritMult − 1))
```

### Burst DPS

```
Burst_DPS = Average_Shot × Fire_Rate
```

### Sustained DPS

```
Sustained_DPS = Burst_DPS × (Shots_Per_Mag / (Shots_Per_Mag + Fire_Rate × Reload_Time))
```

---

## Armor y EHP

```
EHP_armor = Nominal_Health × (Base_Armor + 300) / 300
```

- Cada 300 puntos de armor = +100% effective health
- El armor escala linealmente el EHP (sin diminishing returns en EHP, solo en DR%)

---

## Update 34.0 — mods de stats base de Warframe

Los mods de Health/Shield/Energy/Armor ahora aplican al stat **en rango actual** (no al stat de Rank 0).

```
Vitality (+100%) sobre Excalibur R30 = 370 health → +370 = 740 total
(igual resultado final que antes del update, pero la fórmula mental es más intuitiva)
```
