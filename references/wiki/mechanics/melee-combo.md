# Melee Combo System

> Estado: activo
> Rol: mecánicas del sistema de combo melee — HAE, contador, duración, daño pesado
> Fuente de verdad de: tokens WEAPON_BASE_HEAVY_EFFICIENCY, WEAPON_BASE_COMBO_*, WEAPON_ADD_COMBO_*
> Fuente wiki: https://wiki.warframe.com/w/Melee_Combo
> Última actualización: 2026-05-28

---

## Heavy Attack Efficiency (HAE)

**Comportamiento confirmado en juego (2026-05-28):** pool plano base=0, suma directa, cap=90%.

- Base: **0%** en todas las armas melee (salvo excepciones de pasiva/innate — ver abajo)
- Cada fuente suma directamente al pool: `perk +20% + mod +40.9% = 60.9%` ✅
- **No es multiplicativo** — el "%" es nominal, la operación real es suma de puntos a un pool
- Cap: **90%**. Con 90% de eficiencia, el heavy attack consume 10% del combo counter.
- Excepción de pasiva innate: Kullervo tiene 75% HAE como pasiva — **no modelado aún** (scope warframe, no weapon)

**Token en D-6:** `WEAPON_BASE_HEAVY_EFFICIENCY` (BASE_FLAT) — mismo token para mods e Incarnon perks.  
Por qué BASE_FLAT y no ADD: HAE no escala sobre una base, suma directamente. ADD implicaría multiplicación sobre base, que no ocurre aquí.

**Mods con este token (override):** Focus Energy, Reflex Coil (Radiation Efficiency Melee), Killing Blow (Charge Rate).  
**Incarnon perks con este token:** Overhand (Furax MK1), Templar's Wrath, Guardian's Promise, Blood Anointed, etc. (8 perks mapeados).

---

## Melee Combo Counter

**Cómo escala:** Los ataques de stance añaden puntos proporcionales al multiplicador de daño del stance (`100% stance multiplier = 1 punto`). Blocking: 1 punto por ataque enemigo bloqueado.

**Decaimiento:** Sin Naramon Power Spike → se vacía completamente a los **5 segundos** de inactividad.  
Con Power Spike → decae en ciclos: -20/-15/-10/-5 puntos por ciclo.

**Initial Combo (innate):** Algunas armas tienen combo inicial innato:
- Synoid Heliocor: 20
- Furax Wraith: 20
- Fragor Prime: 30

Regeneración de initial combo: 40 puntos/segundo.

**Token relevante:** `WEAPON_BASE_COMBO_INITIAL` — mods y Incarnon perks que suman al initial combo count.

---

## Combo Duration

**Base:** 5 segundos (barra gris debajo del contador).  
**Mínimo:** No puede bajar de 0.1 segundos.  
**Excepciones:** Xoris (infinita), Pulmonars (9s base), Vitrica (10s base).

**Tokens relevantes:**
- `WEAPON_BASE_COMBO_DURATION` — mods que suman segundos planos (+Xs). BASE_FLAT sobre la base de 5s.
- `WEAPON_ADD_COMBO_DURATION` — mods que reducen/aumentan por porcentaje (±X%). ADD multiplicativo.

> Nota: DE usa el mismo token interno (`WEAPON_MELEE_COMBO_DURATION_BONUS`) para ambas operaciones. El split en D-6 es deliberado — discriminar por label en el override (`s` → BASE, `%` → ADD).

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

**Excepciones:**
- Venka Prime: cap 13.0x a 240 hits
- Dex Nikana: cap 11.0x a 110 hits

**Consumo por defecto:** 100% del combo counter. Reducible con HAE (ver arriba).

---

## Heavy Attack Wind-Up Speed

**Comportamiento confirmado en juego (2026-05-28):** speed stat — reduce el tiempo de carga.

**Fórmula:** `Tiempo_final = Tiempo_base / (1 + Σ_ADD / 100)`  
**Verificado:** HATE + Swift Break (+60%) + Amalgam Organ Shatter (+60%) → `1.99 / 2.20 = 0.91s` ✅  
**Stacking:** aditivo entre todas las fuentes (Incarnon perks + mods).

**Token en D-6:** `WEAPON_ADD_HEAVY_CHARGE_SPEED` (ADD). Mismo token para mods e Incarnon perks.

---

## Implicaciones para el engine (deuda pendiente)

| Mecánica | Deuda |
|---|---|
| HAE cap 90% | `CapStrategy` especial en el AttributeNode cuando se implemente |
| Combo Duration base 5s | Innate en `innate_dna` — NO en override de stats |
| Initial Combo innate (Fragor Prime etc.) | Innate DNA o override weapon-level |
| Kullervo HAE pasiva 75% | Fuera de scope weapon sim — scope warframe passives |
