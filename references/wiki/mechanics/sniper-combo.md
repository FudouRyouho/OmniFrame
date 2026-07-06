# Sniper Shot Combo Counter

> Estado: activo
> Rol: mecánica del Shot Combo Counter de sniper rifles — cómo sube el counter, la tabla de multiplicador logarítmica, qué escala, decay/duración, minimum combo por arma
> Fuente de verdad de: fórmula del multiplier sniper (logarítmica base 3), minimum combo, qué cuenta como hit, decay 1-a-1, duración 2s (Lanka 6s), gate scoped
> No usar para: combo de melee (es lineal, otra mecánica — ver `melee-combo.md`); catálogo de mods sniper
> Última actualización: 2026-07-05
> Fuente: https://wiki.warframe.com/w/Sniper_Rifle#Shot_Combo_Counter

---

## Qué es (y en qué difiere del melee)

El **Shot Combo Counter** sube al encadenar tiros **con mira (scoped)** que impactan. Cada sniper tiene un
**Minimum Combo** (nº de hits para que el counter se active, arrancando en **1.5x**). Es **pasivo**: todo tiro
scoped que pega usa el multiplier — **no** hay gate tipo "heavy". Difiere del melee en tres cosas:

- **Fórmula logarítmica base 3** (el melee es lineal `1+floor(n/20)`).
- **Parámetro por-arma** (`Minimum Combo`) — el melee usa la misma tabla para todas.
- **Multiplicative sobre total damage** (igual bucket que el heavy), pero **pasivo + gateado por scope**.

## Fórmula del multiplier (verbatim)

```text
Damage Multiplier = 1.5 + 0.5·⌊log₃(Combo Count / Minimum Combo)⌋
Combo Required     = Minimum Combo × 3^[2·(Damage Multiplier) − 3]     (inversa)
```

Cada +0.5x pide **3× más hits**. Ejemplo con `Minimum Combo = 4`:

| Hits | Multiplier |
|---|---|
| 4   | 1.5x |
| 12  | 2.0x |
| 36  | 2.5x |
| 108 | 3.0x |
| 324 | 3.5x |

**Sin cap explícito** (tope teórico 4 294 967 295 = u32). Bajo `Minimum Combo` → counter inactivo → ×1.

## Qué cuenta como hit

- Impactos directos, Punch Through, ricochet.
- **Cada bala de Multishot cuenta por separado** ("dos balas de un multishot al mismo target = dos hits").
- **NO** cuentan: AoE ni daño por DoT.

## Decay / duración

- Duración estándar **2 s**; **excepción Lanka: 6 s**. Solo el mod **Harkonar Scope** la extiende.
- Decay **1 a la vez** al vencer la duración (no reset total). **1 removido por miss** (no reset).
- **Gate:** construir y beneficiarse del multiplier requiere estar **scoped** (excepción angosta: mod Collective Curse).

## Minimum Combo por arma (muestras)

| Arma | Minimum Combo |
|---|---|
| Perigale / Sporothrix / Rubico / Vadarya Prime | 1 |
| **Lanka** | **2** |
| Snipetron | 3 |

> **No está en `@wfcd/items`** — es dato por-arma que hay que capturar/overridear. En el proyecto va al
> `weapon-stats.override.json` (campo `min_combo`).
