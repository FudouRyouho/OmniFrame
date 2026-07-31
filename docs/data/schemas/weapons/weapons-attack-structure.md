---
Estado: "activo"
Rol: "Documentar la semántica de attacks[] en armas"
Impacto_ID: "data-weapons-attacks"
Fidelidad_Fisica: "Project/src/shared/types/weapon.ts"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-07-31"
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

## Override `co_behavior` (Condition Overload)

`weapon-stats.override.json` admite, por ataque, un campo `co_behavior` (`adding` | `multiplying`
| `none`) que decide a qué bucket compone un bonus CO/GunCO. Es **terminal**: si está presente
gana; si ausente, el engine lo deriva del `shot_type` (Hit-Scan→adding, Projectile→multiplying,
AoE→none); si el `shot_type` no se reconoce, queda gap (no se asume). Se escribe solo como
**excepción verificada** que contradice el default (ej. un Projectile que en el juego es adding).
Detalle: `engine/design/arch-decisions.md §9`.

## Override `co_base` (Condition Overload — base de cálculo) — DECLARADO, SIN CONSUMIDOR

Segundo campo por ataque, **ortogonal a `co_behavior`**: el nombre del **ataque padre** sobre cuya
base se computa el bonus CO. `co_behavior` dice a qué bucket va el bonus; `co_base` dice sobre qué
base se calculó. Un ataque **derivado** de otro (radial de un impacto directo, disparo cargado sobre
el sin cargar, proyectil hijo sobre el padre) calcula el CO sobre la base del padre, y el bonus
resultante queda por encima o por debajo del `+X%` listado según cuál base sea mayor.

```jsonc
"attacks": {
  "Charged Shot": { "co_behavior": "adding", "co_base": "Uncharged Shot" }
}
```

- **Valor** = el `name` de otro ataque del mismo arma (la clave de `attacks[]`, no un id).
- **Ausente** = el ataque computa el CO sobre su propia base. Es el default y el caso mayoritario.
- **Lleva un puntero, no un número.** El ratio lo deriva el engine de las dos bases, que ya viven en
  `innate_dna.profiles` — no se transcribe de la wiki, que queda de **contraste**.
- **No hereda el `co_behavior` del padre:** los dos ejes son independientes.

⚠️ **El campo no tiene consumidor todavía**: no existe en ningún contrato TS ni resolver, y el motor
computa el CO sobre la base propia siempre. Está declarado acá porque la forma del dato está
decidida (`engine/design/arch-decisions.md §9`, pieza 3); poblarlo espera a que la regla padre→hijo
cierre su validación — `governance/open-questions.md` → `OQ-ENGINE-27`. **No escribir instancias
hasta entonces.**

## Casos importantes

- Incarnon agrega ataques nuevos, no un flag estructural especial
- launchers separan impacto y explosion en ataques distintos
- melee conserva `heavyAttackDamage` top-level para el heavy attack estandar
- glaives y gunblades usan nombres de ataque propios y multiples explosiones

## Regla para consumers

La UI o el engine no deben asumir que `attacks[0]` es siempre el ataque principal ni
que todos los ataques comparten la misma forma.

