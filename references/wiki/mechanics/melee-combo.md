# Melee Combo System

> Estado: activo
> Rol: mecánicas del sistema de combo melee — HAE, contador, duración, daño pesado, wind-up
> Fuente de verdad de: comportamiento de Heavy Attack Efficiency, combo counter/duration, multiplicadores de heavy
> No usar para: catálogo de mods o perks por arma
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Melee_Combo

---

## Heavy Attack Efficiency (HAE)

**Comportamiento confirmado en juego:** pool plano, base 0, suma directa, cap 90%.

- Base: **0%** en todas las armas melee (salvo pasivas innate — ver abajo)
- Cada fuente **suma directamente** al pool: `+20% + 40.9% = 60.9%`
- **No es multiplicativo** — el "%" es nominal; la operación real es suma de puntos a un pool
- Cap: **90%**. Con 90% de eficiencia, el heavy attack consume 10% del combo counter
- Excepción de pasiva innate: Kullervo tiene 75% HAE innato

---

## Melee Combo Counter

**Cómo escala:** los ataques de stance añaden puntos proporcionales al multiplicador de daño del
stance (`100% stance multiplier = 1 punto`). Blocking: 1 punto por ataque enemigo bloqueado.

**Decaimiento:** sin Naramon Power Spike → se vacía completamente a los **5 segundos** de
inactividad. Con Power Spike → decae en ciclos: −20/−15/−10/−5 puntos por ciclo.

**Initial Combo (innate):** algunas armas tienen combo inicial innato (Synoid Heliocor 20, Furax
Wraith 20, Fragor Prime 30). Regeneración de initial combo: 40 puntos/segundo.

---

## Combo Duration

- **Base:** 5 segundos (barra gris debajo del contador)
- **Mínimo:** no puede bajar de 0.1 segundos
- **Excepciones:** Xoris (infinita), Pulmonars (9s base), Vitrica (10s base)

Hay dos tipos de fuente: las que **suman segundos planos** (+Xs, sobre la base de 5s) y las que
**modifican por porcentaje** (±X%), distinguibles por el sufijo del valor (`s` vs `%`).

---

## Heavy Attack — Daño y multiplicador

**Rango base:** 2x – 12x daño según tier de combo.

| Hits consecutivos | Multiplicador |
|---|---|
| 20 | 2.0x |
| 40 | 3.0x |
| 60 | 4.0x |
| … | +1.0x cada 20 hits |
| 220 | 12.0x (cap general) |

**Excepciones:** Venka Prime (cap 13.0x a 240 hits), Dex Nikana (cap 11.0x a 110 hits).

**Consumo por defecto:** 100% del combo counter. Reducible con HAE (ver arriba).

---

## Heavy Attack Wind-Up Speed

Stat de velocidad — reduce el tiempo de carga del heavy attack.

```text
Tiempo_final = Tiempo_base / (1 + Σ bonus%)
```

**Verificado:** Swift Break (+60%) + Amalgam Organ Shatter (+60%) → `1.99 / 2.20 = 0.91s`.
**Stacking:** aditivo entre todas las fuentes.
