# Multishot

> Estado: activo
> Rol: fórmula de multishot, fuentes y casos especiales
> Fuente de verdad de: cálculo de projectile count, fracción probabilística, interacción con crit/status
> No usar para: catálogo completo de armas con multishot innato o mecánicas de spread/accuracy
> Última actualización: 2026-06-10

## Fórmula base

```text
Total Projectiles = Base Projectile Count × (1 + Multishot Modifier)
Guaranteed        = floor(Total Projectiles)
Extra Chance      = frac(Total Projectiles)   → probabilidad de un proyectil adicional
```

Fuente: https://wiki.warframe.com/w/Multishot

Ejemplos:
- `1.0` → 1 proyectil siempre
- `2.8` → 2 garantizados + 80% de chance de un tercero
- `7.0` → 7 pellets siempre

Los mods de multishot dan **porcentaje aditivo** sobre el base projectile count del arma (Split
Chamber, Hell's Chamber, Barrel Diffusion, etc.).

## Interacción con críticos y status

**Proyectiles / Pellets** — cada instancia es independiente:
- Tirada de crítico propia
- Tirada de status propia
- Puede impactar o fallar por separado

Multishot multiplica las oportunidades de crit y status por disparo — es un multiplicador implícito de DPS y de proc rate.

## Armas de beam / continuous

En beam weapons multishot no crea ticks físicos adicionales — en su lugar escala el daño y la status chance del tick existente:

```text
rolledInstances       = floor(total) + (rand() < frac(total) ? 1 : 0)
beamTickDamage        = baseTickDamage × rolledInstances
effectiveStatusChance = baseStatusChance × rolledInstances
```

Las habilidades de estado que escalan por tick (Slash, Heat, Toxin, Electricity, Gas) se ven especialmente beneficiadas en beams porque multishot amplifica tanto el daño del tick como la frecuencia de procs.

> **Hunter Munitions** en beams: aplica Slash forzado *después* del merge de instancias — evita el doble conteo de multishot en la aplicación de Slash.

## Fuentes de Multishot

### Mods por categoría de arma

| Categoría | Mod | Bonus |
|---|---|---|
| Rifles | Split Chamber | +90% |
| Rifles | Galvanized Chamber | +80% (+110% max) |
| Escopetas | Hell's Chamber | +120% |
| Escopetas | Galvanized Hell | +110% (+140% max) |
| Pistolas | Barrel Diffusion | +120% |
| Pistolas | Lethal Torrent | +60% |
| Pistolas | Galvanized Diffusion | +110% (+140% max) |
| Cualquier | Riven mod | variable (puede ser negativo) |

### Habilidades de warframe

| Fuente | Warframe | Bonus |
|---|---|---|
| Metronome — buff Opera | Octavia | +12–30% (solo armas a distancia) |

## Edge cases

| Caso | Comportamiento |
|---|---|
| **Spearguns** | Multishot no afecta el componente arrojado — solo el disparo de bolt |
| **Acuity mods** (Update 38.0+) | Bloquean modificaciones de multishot — valor fijo mientras el mod está activo; compensan con bonus de daño y crit en weak points |
| **Armas con mechanic de recarga especial** (Bubonico, Dex Pixia) | El conteo de proyectiles funciona igual pero la lógica de recarga es propia del arma — no afecta multishot |

## Implicación para status

Para proyectiles/pellets:
```text
expectedProcsPerTrigger ≈ expectedHitInstances × statusChancePerHit
```

Para beams — la cantidad de ticks no cambia, cambia su peso:
```text
effectiveStatusChance = baseStatusChance × rolledMultishotInstances
```

## Fuentes

- https://wiki.warframe.com/w/Multishot
- [`critical-hits.md`](critical-hits.md)
- [`damage-types.md`](damage-types.md)
