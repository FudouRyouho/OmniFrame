---
Estado: "referencia"
Rol: "Contrato del override JSON de Incarnon Genesis / Incarnon nativo"
Version: "v1.0.0"
Impacto_ID: "SSoT-Data-Incarnon"
Fidelidad_Fisica: "Project/public/data/incarnon-evolutions.override.json"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-05-27"
---

# Schema: incarnon-evolutions.override.json

Datos de perks de evolución Incarnon. Indexado por `unique_name` del arma.

## Estructura

```json
{
  "<unique_name>": {
    "evolutions": {
      "<tier>": {
        "<perk_id>": [
          { "upgrade_type": "<token>", "value": <number> },
          { "upgrade_type": null, "condition": "<cond>", "note": "<gap>" }
        ]
      }
    }
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `tier` | string (número) | EVO tier: "2", "3", "4". EVO I es la transformación base — no tiene perks elegibles. |
| `perk_id` | string (snake_case) | ID único del perk. Coincide con `evolution_perks[tier]` en `SlotIntention`. |
| `upgrade_type` | string \| null | Token D-6 del vocabulario `UPGRADES`. Si es `null` → perk con gap conocido, se omite. |
| `value` | number | Valor absoluto del modificador (porcentaje para CHANCE, unidades para DAMAGE). |
| `condition` | string? | Flag de condición del motor. Presente solo en perks condicionales. |
| `note` | string? | Documentación del gap. Solo aparece cuando `upgrade_type` es null. |

## Tokens usados (nuevos, 2026-05-27)

| Token | Mapea a | Operación |
|---|---|---|
| `WEAPON_BASE_DAMAGE` | `WEAPON_DAMAGE` | `BASE_FLAT` |
| `WEAPON_BASE_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | `BASE_FLAT` |
| `WEAPON_BASE_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | `BASE_FLAT` |
| `WEAPON_BASE_MAGAZINE_MAX` | `WEAPON_ADD_MAGAZINE_MAX` | `BASE_FLAT` |

`BASE_FLAT` se suma al `base` del atributo antes de aplicar mods porcentuales — se amplifica por Serration/Hornet Strike/etc.

## Semántica de valores

- `WEAPON_BASE_DAMAGE`: unidades absolutas de daño (ej. +4 = cuatro puntos de daño total)
- `WEAPON_BASE_CRIT_CHANCE`: puntos porcentuales (ej. +14 = 14 puntos sobre la CC base)
- `WEAPON_BASE_STATUS_CHANCE`: puntos porcentuales
- `WEAPON_ADD_RELOAD_SPEED`: porcentaje (ej. +60 = +60%)

## Gaps conocidos

| Perk | Token pendiente | Motivo |
|---|---|---|
| Hunter's Mantra — Punch Through (condicional) | `WEAPON_ADD_PUNCH_THROUGH` | Token no en vocabulario D-6 |
| Hunter's Mantra — Accuracy (condicional) | `WEAPON_ADD_ACCURACY` | Token no en vocabulario D-6 |
| Crimson Overture — on-kill stacking | N/A | Buffer dinámico, no modelable en snapshot estático |
| Swift Deliverance — Projectile Speed | `WEAPON_ADD_PROJECTILE_SPEED` | Token no en vocabulario D-6 |
| Condiciones en general | — | `context.flags` no implementado para flags de combate |

## Consumer

`IncarnationRepository.getModifiers(uniqueName, evolutionPerks, targetId)` resuelve
`evolution_perks: Record<number, string>` → `Modifier[]` via UPGRADE_MAP.

El repository se carga en el `beforeAll` de los tests y debe cargarse en el
bootstrap de la app (pendiente: integrar con `DataRegistry` o `useSimulation`).

## Convención de variantes per-arma

Si Boltor / Telos Boltor / Boltor Prime tienen valores distintos para el mismo perk
(ej. Hunter's Mantra +18 vs +4), cada arma tiene su propia entrada en el JSON.
No existe un campo de "variante": la key del objeto ES el `unique_name`.

## Referencia implementada

Boltor Genesis (3 variantes): EVO II–IV, todos los perks de la wiki excepto los gaps listados.
Fuente: `references/wiki/systems/incarnon/raw/boltor-incarnon-genesis.wikitext`
