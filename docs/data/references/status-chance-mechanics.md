---
Estado: "referencia"
Rol: "Mecánica de Status Chance per-proyectil — base para modelado en engine"
Impacto_ID: "REF-StatusChance"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-05-29"
Fecha_de_actualizacion: "2026-07-09"
Fuente: "https://wiki.warframe.com/w/Status_Effect"
---

# Status Chance — Mecánica por Proyectil

## Definición

El `status_chance` que muestra el Arsenal es la **probabilidad individual de proc por pellet/proyectil**, no por disparo. Cada proyectil tira su propio dado independientemente.

> Ejemplo: Strun Wraith muestra 12% de status. Cada uno de sus 10 pellets tiene 12% de probabilidad de aplicar un proc de forma independiente.

---

## Fórmulas

### Procs promedio por disparo

```
procs_por_disparo = multishot × (procs_forzados + status_per_projectile)
```

### Procs promedio por segundo

```
procs_por_segundo = procs_por_disparo × fire_rate
```

### Distribución de tipo de proc

```
probabilidad_tipo = daño_tipo / daño_total
```

La proporción se calcula sobre el daño base. No la alteran los modificadores de resistencia de enemigos, pero sí las inmunidades a procs específicos.

---

## Implicaciones para el engine

### Status chance en armas multi-pellet (shotguns)

El atributo `WEAPON_ADD_STATUS_CHANCE` en el grafo de atributos representa la probabilidad **por pellet**. Los mods que dicen "+X% Status Chance" aumentan este valor per-pellet directamente, porque el juego ya muestra el valor per-pellet en el Arsenal.

### Bonuses de evolución Incarnon (mecánica especial)

Los bonuses de evolución que afectan Status Chance se comportan diferente a los mods:

- Se aplican como **flat post-escala** (bucket `total_flat`, operación `ADD_FLAT`)
- El valor declarado en DE es el **total del arma**, no per-pellet
- Para convertir a per-pellet: `bonus_per_pellet = bonus_total / base_multishot`

**Ejemplo — Felarx, Racking Wrath (+20% Status Chance):**
- Normal Attack (base_multishot = 4): `20 / 4 = 5%` per pellet, ADD_FLAT
- Incarnon Form (base_multishot = 1): `20 / 1 = 20%` per pellet, ADD_FLAT
- Fuente: [wiki Felarx](https://wiki.warframe.com/w/Felarx) — "Status Chance bonus is divided by the base multishot of 4"

**Fórmula resultante con mods:**
```
status_per_pellet = base × (1 + mods_add_pct / 100) + evolution_flat_per_pellet
```

Esto mapea exactamente al Stat Accumulator:
```
V = ((Base + 0) × (1 + ModsAddPct/100) + TotalFlat) × 1
```

Donde `TotalFlat = evolution_bonus / base_multishot`.

### Deuda activa

El perfil activo (Normal vs Incarnon) determina cuál `base_multishot` usar para calcular `evolution_flat_per_pellet`. Hoy el `IncarnonRepository` aplica un valor único sin distinción de perfil. Requiere OQ-ENGINE-2 (profile switching en runtime) para modelarse correctamente.

---

## Tabla de referencia

| Multishot | SC 100% | SC 80% | SC 150% |
|---|---|---|---|
| 1 | 1.0 procs | 0.8 procs | 1.5 procs |
| 2.1 (Felarx Incarnon) | 2.1 procs | 1.68 procs | 3.15 procs |
| 4 (Felarx Normal) | 4.0 procs | 3.2 procs | 6.0 procs |
| 8.4 (Felarx + GH estático) | 8.4 procs | 6.72 procs | 12.6 procs |

> "100% status per pellet" = 1 proc esperado por pellet en promedio. Por encima de 100%, cada pellet
> puede aplicar procs "únicos" adicionales — el tipo de cada proc adicional se sortea de forma
> **independiente** (puede repetirse el mismo tipo). La wiki **no especifica** un mecanismo de
> "garantizado + priorización por daño" (verificado contra la fuente 2026-07-09; afirmación previa
> de este doc era incorrecta). Ver `references/wiki/mechanics/status-effects.md` §Aplicación para la
> captura verificada.
