# Reload

> Estado: activo
> Rol: fórmula de recarga y fuentes de Reload Speed para el engine v1
> Fuente de verdad de: cálculo de Total Reload Time, distinción reload_time (base) vs reload_speed (mod), fuentes ADD
> No usar para: mecánicas de recarga automática por habilidad (Trinity, Carrier, etc.) o reload parcial (escopetas)
> Última actualización: 2026-05-26

## Fórmula base

```text
Total Reload Time = Base Reload Time / (1 + Reload Speed Bonus)
```

Fuente: https://wiki.warframe.com/w/Reload

- `Base Reload Time` — tiempo en segundos del arma sin modificadores (stat intrínseco del arma)
- `Reload Speed Bonus` — suma aditiva de todos los bonuses % de velocidad de recarga

> **Ningún mod modifica el Base Reload Time directamente.** Todos los mods y habilidades dan `Reload Speed Bonus` (porcentual), que divide el tiempo base.

## Escalado inverso (comportamiento crítico)

El reload speed sigue escalado inverso — los penalties son más severos que los bonuses equivalentes:

```text
+30% Reload Speed → ÷ 1.30 → tiempo se reduce un 23%
−30% Reload Speed → ÷ 0.70 → tiempo se incrementa un 43%
```

Esto implica que un penalty de −30% penaliza más que lo que beneficia un bonus de +30%.

## Armas por cartucho (escopetas pump, etc.)

Para armas de recarga por shell (escopeta pump, algunas de lanzagranadas):

```text
Total Reload Time = (Start Delay + Shells × Shell_Time + End Delay) / (1 + Reload Speed Bonus)
```

El divisor de velocidad aplica a todo el ciclo — incluyendo los delays de inicio y fin.

## Mapeo a tokens D-6

| Stat | Token D-6 | Op | Notas |
|---|---|---|---|
| Reload Speed (mods %) | `WEAPON_ADD_RELOAD_SPEED` | ADD | Fast Hands, Primed Fast Hands, Tactical Reload, etc. |
| Base Reload Time | `reload_time` (deuda D-7) | — | Dato puro del arma — no es un token de modificador. Naming pendiente en D-7 Fase 1. |

> Ver `docs/data/decisions.md §D-7` — sub-pregunta abierta: si `reload_time` toma token `WEAPON_STAT_RELOAD_TIME` o se trata fuera del sistema de atributos.

## Fuentes de Reload Speed (ADD)

### Mods

| Mod | Bonus |
|---|---|
| Fast Hands | +30% |
| Primed Fast Hands | +55% |
| Quickdraw | +48% (pistolas) |
| Tactical Reload | variable (recarga parcial) |
| Chilling Reload | +40% (con status Cold) |
| Tactical Pump | (escopetas) |

### Habilidades de warframe

| Fuente | Warframe | Bonus |
|---|---|---|
| Elemental Ward (Toxin) | Chroma | +15–35% |
| Redline | Gauss | +4–50% (escala con batería) |
| Penance | Harrow | +40–70% |
| Speed | Volt | +10–25% |
| Pasiva (pistolas single-hand) | Mesa | +25% |

> Todas las habilidades dan Reload Speed porcentual — mismo token `WEAPON_ADD_RELOAD_SPEED`, operación ADD.

## Interacciones relevantes

| Mecánica | Comportamiento |
|---|---|
| **Tactical Reload** | Recarga sin vaciar el cargador — el tiempo se calcula sobre las balas recargadas, no el cargador completo |
| **Carrier** (sentinel) | Pasiva de auto-recarga al quedarse sin munición en cargador |
| **Quick Thinking** | No afecta reload — es de energía |
| **Energized Munitions** | No afecta reload |

## Fuentes

- https://wiki.warframe.com/w/Reload
- `references/wiki/mechanics/hit-points.md`
- `docs/data/decisions.md §D-7` (sub-pregunta `reload_time`)
