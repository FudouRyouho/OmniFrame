---
Estado: "activo"
Rol: "Documentar la semántica de attacks[] en armas"
Version: "v0.0.2"
Impacto_ID: "D-Weapons-Attacks"
Fidelidad_Fisica: "Project/src/lib/types/weapon.ts"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
---

# Weapon Attack Structure

## Regla base

`attacks[]` es una estructura abierta. `name` es la clave semantica del ataque.
No existe un set fijo de nombres universal.

## Campos esperados por ataque

| Campo | Nota |
|---|---|
| `name` | clave semantica del modo de ataque |
| `damage` | mapa de tipos de dano del ataque |
| `crit_chance` | chance critica del ataque |
| `crit_mult` | multiplicador critico |
| `status_chance` | chance de estado |
| `speed` | opcional |
| `shot_type` | hitscan, projectile, aoe, thrown, etc. |
| `flight` | velocidad de proyectil cuando aplica |
| `falloff` | caida de dano si aplica |
| `slide` | dano de slide en melee normal attack |
| `charge_time` | tiempo de carga cuando aplica |

## Casos importantes

- Incarnon agrega ataques nuevos, no un flag estructural especial
- launchers separan impacto y explosion en ataques distintos
- melee conserva `heavyAttackDamage` top-level para el heavy attack estandar
- glaives y gunblades usan nombres de ataque propios y multiples explosiones

## Regla para consumers

La UI o el engine no deben asumir que `attacks[0]` es siempre el ataque principal ni
que todos los ataques comparten la misma forma.

