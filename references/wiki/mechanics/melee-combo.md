# Melee Combo System

> Estado: activo
> Rol: mecánicas del sistema de combo melee — combo counter, combo multiplier, heavy attack, HAE, duración/decay, wind-up
> Fuente de verdad de: qué escala con el combo multiplier (heavy + mods + habilidades, **NO** normal attacks), tabla heavy 2x–12x, HAE, combo counter/duración/decay, wind-up
> No usar para: catálogo de mods o perks por arma (los mods se listan agrupados por dimensión mecánica, no por build)
> Última actualización: 2026-07-04
> Fuente: https://wiki.warframe.com/w/Melee_Combo

---

## Combo Multiplier — qué escala (y qué NO)

**Regla central (verbatim wiki):** *"Melee Combo Multiplier does not multiply the damage of your normal attacks."*

El combo counter deriva un **combo multiplier** (el tier 2x–12x, ver tabla heavy) que **NO** aplica al ataque normal/light. Es un valor derivado único que distintos consumidores usan distinto:
- **Heavy attacks** — gastan el combo para pegar 2x–12x (ver abajo).
- **Mods combo-scaling** — Blood Rush (crit chance), Weeping Wounds (status chance), sets Gladiator/Jugulus: escalan su bonus por el combo multiplier (`val × combo_mult`). Ver `docs/semantic/conditions.md` (`per_melee_combo_multiplier`).
- **Habilidades** — "Multiplier Ability Damage" escala a ratio **1:0.25** (rinde 1.5x–4x); las que tienen Ability Combo Counter propio reciben el multiplier **completo**.

El ataque normal se beneficia del combo **solo indirectamente** vía esos mods (crit/status), nunca como multiplicador de daño directo. (En Damage 2.0 antiguo el combo sí multiplicaba todo — ya no.)

---

## Melee Combo Counter

**Qué es:** gauge que cuenta los ataques melee de los últimos 5 segundos.

**Cómo escala:**
- Stance attacks: puntos ∝ stance damage multiplier (**100% = 1 punto**; ej. un ataque de 300% añade 3 puntos/hit).
- Blocking: **1 punto** por ataque enemigo bloqueado (cada proyectil individual cuenta).
- Especiales: Rauta genera 2 puntos por pellet que impacta, hasta **28** (14 pellets).

**Initial Combo (innato):** algunas armas arrancan con combo (Synoid Heliocor 20, Furax Wraith 20, Fragor Prime 30). Regeneración de initial combo: **40 puntos/s**. Mods de initial combo: Corrupt Charge, Ready Steel, Melee Crescendo, Galvanized Reflex, Covert Lethality.

**Ganancia extra de combo (mods):** Enduring Strike, Quickening, True Punishment, Relentless Combination, Guardian Derision, Exodia Triumph/Valor (Zaws).

---

## Combo Decay / expiry

- **Default:** el contador se vacía por completo tras **5 s** de inactividad.
- **Naramon Power Spike:** en vez de vaciarse, decae **20 / 15 / 10 / 5** puntos por reset; al cruzar un umbral de tier, baja el multiplier al nuevo valor. A rango máx sin mods de duración: **220 s (44 ticks)** para vaciarse del todo.

---

## Combo Duration

- **Base:** 5 s. **Mínimo:** no baja de 0.1 s.
- **Excepciones por arma:** Guandao Prime 6s, Pulmonars 9s, Vitrica 10s, Xoris infinita; Tenet Livia/Grigori pausan el timer enfundadas.
- **Fuentes:** aditivas; hay **planas** (+Xs sobre los 5s) y **porcentuales** (±X%), distinguibles por el sufijo del valor (`s` vs `%`). Rivens pueden dar valores negativos.
- **Mods de duración:** Body Count, Drifting Contact, Gladiator Rush, Swift Momentum, Melee Guidance, Rising Storm, Primary/Secondary Dexterity, Power Spike (Naramon).

---

## Heavy Attack — daño y multiplicador

**Combo multiplier = tier:** `mult = 1 + floor(hits / 20)`, cap 12x.

| Hits consecutivos | Multiplicador |
|---|---|
| 20 | 2.0x |
| 40 | 3.0x |
| 60 | 4.0x |
| 80 | 5.0x |
| … | +1.0x cada 20 hits |
| 220 | 12.0x (cap general) |

**Excepciones:** Venka Prime 13.0x a 240 hits (pasiva); Dex Nikana 11.0x a 110 hits (reduce los hits requeridos a costa de bajar el cap).

**Consumo por defecto:** 100% del combo counter. Reducible con HAE (ver abajo).

---

## Heavy Attack Efficiency (HAE)

**Comportamiento confirmado:** pool plano, base **0%**, suma directa, cap **90%**.

- Cada fuente **suma directamente** al pool (`+20% + 40.9% = 60.9%`); el "%" es nominal, la operación real es suma de puntos.
- Cap **90%**: con 90%, el heavy consume 10% del combo counter.
- Pasiva innata: **Kullervo 75%** HAE.
- Fuentes (suman al pool): Focus Energy, Focus Radon, Reflex Coil, Galvanized Reflex, Lycath's Hunt (hold).

---

## Heavy Attack Wind-Up Speed

Stat de velocidad — reduce el tiempo de carga del heavy attack.

```text
Tiempo_final = Tiempo_base / (1 + Σ bonus%)
```

**Verificado:** Swift Break (+60%) + Amalgam Organ Shatter (+60%) → `1.99 / 2.20 = 0.91s`.
**Stacking:** aditivo entre todas las fuentes.

---

## Habilidades que escalan con combo (Ability Combo Counter)

Algunas habilidades tienen un **contador de combo propio** (afectado por Ability Duration) y consumen el multiplier: Ash (Blade Storm), Atlas (Landslide), Gara (Shattered Lash), Khora (Whipclaw). "Multiplier Ability Damage" escala a ratio **1:0.25** (1.5x–4x); las de Ability Combo Counter reciben el multiplier **completo**. (Candidata a la "otra mecánica similar" que reusa el factor `combo_count`.)
