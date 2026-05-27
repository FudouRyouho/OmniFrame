# Enemy Level Scaling

> Estado: activo
> Rol: fórmulas de escalado de stats de enemigos por nivel — referencia para EnemyRepository y ScaledEnemy
> Fuente de verdad de: curva S post-Update 27.2, coeficientes por facción, EHP derivado
> No usar para: drops, afinidad de jugador o mecánicas de spawn
> Última actualización: 2026-05-27
> Fuente: https://wiki.warframe.com/w/Enemy_Level_Scaling

## Fórmula base universal

```
Stat Actual = Stat Base × (1 + Coeficiente × (Nivel Actual − Nivel Base)^Exponente)
```

Donde `Δx = Nivel Actual − Nivel Base`.

## Curva S — Update 27.2

Desde Update 27.2 el escalado sigue una **curva S**:
- **< nivel 70**: crecimiento rápido (exponente alto)
- **> nivel 80**: crecimiento lento (exponente bajo)
- **Entre 70-80**: interpolación suave

Cada facción tiene coeficientes distintos para las dos mitades de la curva.

## Health por facción

| Facción | Fórmula < 70 | Fórmula > 80 |
|---|---|---|
| Grineer / Scaldra | `1 + 0.015(Δx)^2.12` | `1 + 10.7332(Δx)^0.72` |
| Corpus | `1 + 0.015(Δx)^2.12` | `1 + 13.4165(Δx)^0.55` |
| Infested | `1 + 0.0225(Δx)^2.12` | `1 + 16.1(Δx)^0.72` |
| Corrupted | `1 + 0.015(Δx)^2.1` | `1 + 10.7332(Δx)^0.685` |
| Sentient / Anarchs | `1 + 0.015(Δx)^2` | `1 + 10.7332(Δx)^0.5` |
| Techrot | `1 + 0.02(Δx)^2.12` | `1 + 15.1(Δx)^0.7` |

## Shields por facción

| Facción | Fórmula < 70 | Fórmula > 80 |
|---|---|---|
| Corpus | `1 + 0.02(Δx)^1.76` | `1 + 2(Δx)^0.76` |
| Corrupted | `1 + 0.02(Δx)^1.75` | `1 + 2(Δx)^0.75` |
| Grineer / Sentient | `1 + 0.02(Δx)^1.75` | `1 + 1.6(Δx)^0.75` |
| Techrot | `1 + 0.02(Δx)^1.76` | `1 + 3.5(Δx)^0.76` |

## Armor — fórmula única para todas las facciones

```
< 70:  1 + 0.005(Δx)^1.75
> 80:  1 + 0.4(Δx)^0.75
```

**Límites:**
- Máximo: 2700 de armor (≈ 90% DR)
- Mínimo inicial: 200 de armor base (para unidades con armor)

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

## Escalado de Eximus

Las unidades Eximus reciben escalado adicional de health/shields con puntos de inflexión en niveles:
**15, 25, 35, 50, 100** — no lineal, depende del tier del Eximus.

## Misiones sin fin

Durante Supervivencia y Defensa el nivel de spawn aumenta exponencialmente hasta nivel 5000 (≈4 horas), luego linealmente hasta el cap de 9999.

**Disrupción:**
```
Nivel = Nivel_Inicial + Σ 2.59 × e^(0.139 × Número_Ronda)
```

## Mapeo al engine

| Stat | Módulo | Estado |
|---|---|---|
| Health escalada | `EnemyRepository.scale()` | ⚠️ Parcial — sin curva S |
| Shield escalada | `EnemyRepository.scale()` | ⚠️ Parcial |
| Armor escalada | `EnemyRepository.scale()` + `EnemyState.getEffectiveArmor()` | ⚠️ Parcial |
| Damage enemigo | No modelado en C1 | ⏸ Fuera de scope C1 |
| Curva S (interpolación) | No implementado | ⏸ Deuda conocida |
| Steel Path | No implementado | ⏸ Deuda conocida |

> Nota: las fórmulas documentadas provienen de testing in-game, no de fuentes oficiales de DE.
