# Damage Types

> Estado: activo
> Rol: resumen mínimo de damage families y status relevantes para el engine v1
> Fuente de verdad de: clasificación de tipos y fórmulas base de los efectos que más cambian DPS
> No usar para: catálogo completo de resistencias de cada enemigo o simulación full de DoT
> Última actualización: 2026-03-22

## Que es

Para v1, este documento no intenta re-explicar todo el sistema de daño de Warframe.
Solo fija lo que el engine necesita saber para calcular o categorizar:

- qué familias de daño existen
- como se combinan elementos
- cómo se elige el proc cuando hay varios tipos presentes
- qué status cambian daño efectivo de forma fuerte en una implementación futura

## Alcance real de v1

v1 no modela:

- DoT
- ticks por segundo
- daño total acumulado durante 6s
- ramp temporal de Heat
- stacks reales del enemigo a lo largo del tiempo

Para v1, `damage types` solo necesita resolver:

- breakdown de daño por tipo
- combinación elemental
- pesos de proc
- tags y metadata para futuras mecánicas

## Familias

| Grupo | Tipos | Nota para engine v1 |
|---|---|---|
| Physical | `Impact`, `Puncture`, `Slash` | Importa separar IPS porque también pesa en proc chance |
| Elemental primario | `Heat`, `Cold`, `Electricity`, `Toxin` | Se pueden combinar entre sí |
| Elemental secundario | `Blast`, `Corrosive`, `Gas`, `Magnetic`, `Radiation`, `Viral` | Nacen de combinar 2 primarios |
| Special | `Void`, `Tau`, `True` | No siguen la lógica normal de combinación |

## Reglas de combinación

Para mods/bonos elementales de armas, el motor necesita soportar estas combinaciones:

- `Heat + Cold = Blast`
- `Heat + Electricity = Radiation`
- `Heat + Toxin = Gas`
- `Cold + Electricity = Magnetic`
- `Cold + Toxin = Viral`
- `Electricity + Toxin = Corrosive`

`Void`, `Tau` y `True` se tratan como tipos especiales; no entran en el arbol elemental normal.

## Regla de elección de proc

Si un hit puede aplicar estado, el tipo concreto del proc se elige según el peso de daño de cada tipo presente en el hit:

```text
procTypeChance(type) = damageOfType / totalDamage
```

Esto es clave para builder porque:

- subir `Slash` sube la chance de `Bleed`
- subir `Heat` sube la chance de `Ignite`
- la distribución de daño importa aunque el `statusChance` total no cambie

## Status relevantes como referencia futura

Estas formulas siguen siendo utiles, pero no deben interpretarse como alcance real de
v1. Se documentan ahora para no perder la referencia matematica cuando el engine pase
a v2/v3.

### Slash

Lo importante:

- aplica `Bleed`
- el tick usa `True/Cinematic` damage para ignorar armor
- no ignora shields como antes

Fórmula base por tick:

```text
moddedBaseDamage = baseDamage * (1 + baseDamageBonuses) * (1 + factionDamageBonuses)
slashTick = 0.35 * moddedBaseDamage * (1 + factionDamageBonuses) * additionalMultipliers
```

Notas:

- `Slash` proc hace tick durante 6s
- los ticks empiezan tras 1s de delay
- faction damage aplica dos veces
- mods de `Slash` no aumentan el daño del proc; base damage y faction sí

### Heat

Lo importante:

- aplica DoT
- reduce armor hasta 50%
- agrega control breve al enemigo

Fórmula base por tick:

```text
moddedBaseDamage = baseDamage * (1 + baseDamageBonuses) * (1 + factionDamageBonuses)
heatTick = 0.5 * moddedBaseDamage * (1 + heatDamageBonuses) * (1 + factionDamageBonuses) * additionalMultipliers
```

Armor strip máximo:

```text
armorAfterFullHeatRamp = armorBeforeHeat * 0.5
```

Ramp que importa si el engine modela tiempo:

- `0.5s -> 15% strip`
- `1.0s -> 30% strip`
- `1.5s -> 40% strip`
- `2.0s -> 50% strip`

### Toxin

Lo importante:

- el daño directo y el DoT pueden bypass shields
- no bypass armor

Fórmula base por tick:

```text
moddedBaseDamage = baseDamage * (1 + baseDamageBonuses) * (1 + factionDamageBonuses)
toxinTick = 0.5 * moddedBaseDamage * (1 + toxinDamageBonuses) * (1 + factionDamageBonuses) * additionalMultipliers
```

### Corrosive

Lo importante:

- no aumenta daño por sí mismo
- baja armor del objetivo
- dura 8s por stack

Modelo mínimo por stacks:

```text
corrosiveReduction(n) = min(0.26 + 0.06 * (n - 1), 0.80)
armorAfterCorrosive = armorBeforeCorrosive * (1 - corrosiveReduction(n))
```

### Viral

Lo importante:

- aumenta daño recibido por health
- no cambia shields

Modelo mínimo por stacks:

```text
viralBonusToHealth(n) = min(1.00 + 0.25 * (n - 1), 3.25)
healthDamageMultiplier = 1 + viralBonusToHealth(n)
```

En otras palabras:

- `1 stack -> x2.0 vs health`
- `10 stacks -> x4.25 vs health`

### Magnetic

Lo importante:

- aumenta daño a shields y overguard
- corta regeneración de shields

Modelo mínimo por stacks:

```text
magneticBonusToShield(n) = min(1.00 + 0.25 * (n - 1), 3.25)
shieldDamageMultiplier = 1 + magneticBonusToShield(n)
```

### Tau

Lo importante:

- no es un multiplicador de daño directo
- aumenta la chance de recibir nuevos status

Modelo mínimo sugerido como referencia futura:

```text
receivedStatusChanceMultiplier ~= 1 + 0.10 * tauStacks
```

Nota: esta fórmula es una inferencia práctica a partir del texto de la wiki que habla de `10% increased Status Chance per proc`, cap a `100%` en `10` stacks.

## Prioridad real para el engine v1

Si hay que recortar, este es el orden correcto:

1. familias de daño
2. combinación elemental
3. proc weighting
4. tags de damage type requeridos por mods, shards y condiciones simples

El resto puede quedar como metadata, proc tags o control effects hasta que exista simulación más fina.

## Datos mínimos que el engine debería guardar en v1

- `damageBreakdownByType`
- `procWeightByType`
- `statusChance`
- `combinedElementTypes`
- `damageTypeTags`

## Datos futuros cuando exista v2/v3

- `statusDuration`
- `statusDamage`
- `armorStripState`
- `healthDamageTakenMultiplier`
- `shieldDamageTakenMultiplier`
- `receivedStatusChanceMultiplier`

## Fuentes

- `https://wiki.warframe.com/w/Damage`
- `https://wiki.warframe.com/w/Status_Effect`
- `https://wiki.warframe.com/w/Damage_2.0/Slash_Damage`
- `https://wiki.warframe.com/w/Damage_2.0/Heat_Damage`
- `https://wiki.warframe.com/w/Damage_2.0/Toxin_Damage`
- `https://wiki.warframe.com/w/Damage_2.0/Corrosive_Damage`
- `https://wiki.warframe.com/w/Damage_2.0/Tau_Damage`
- `../modules/damage-types-data.md`
