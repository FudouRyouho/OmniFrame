---
Estado: "activo"
Rol: "Documentar la semántica de attacks[] en armas"
Impacto_ID: "data-weapons-attacks"
Fidelidad_Fisica: "Project/src/shared/types/damage.ts"
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
| `min_spread` / `max_spread` | dispersion del cono en grados, sin mods — ver abajo |

## `min_spread` / `max_spread` — la dispersion descompuesta

El export publica `accuracy` a nivel **arma**: un escalar que sale de promediar el cono y darlo
vuelta — `accuracy = 100 / ((min + max) / 2)`. La media pierde informacion: dos armas con el mismo
`accuracy` pueden abrir muy distinto, y el par es lo que un modificador de precision toca.

El par vive **por ataque**, no por arma, y es la unica forma de que el Incarnon tenga precision
propia: Braton Prime declara `Normal Attack {2, 5}` y `Incarnon Form {0.3, 0.7}` — dos conos, un
solo `accuracy` top-level. La aritmetica cierra en ambos sentidos (`100/((2+5)/2) = 28.571428`, el
`accuracy` que el export declara para el arma), asi que el escalar del export queda como
**contraste**, no como fuente.

**Procedencia:** `Module:Weapons/data` (wiki), cosechado por `omniframe-items` como mapa
`AttackName → {min, max}` y unido a `attacks[]` por nombre en el pipeline. Es la unica fuente
conocida que lo publica descompuesto — `docs/domains/source/wiki-modules.md`.

**Tres estados, no dos.** `null` = la fuente no lo trae. Un numero > 0 = el cono. Y **`0/0` = cono
nulo**, que es dato positivo: el ataque no dispersa. De 1610 ataques, 556 traen el par y 132 de esos
declaran `0/0`. Los AoE quedan en `null` a proposito: no responden a modificadores de precision.

El tercer estado importa porque la identidad se rompe ahi (`100/0` = infinito) y porque el arma
puede mezclarlos: **Boar Prime** abre `{10, 30}` en su escopeta y `{0, 0}` en su forma Incarnon. Un
consumidor que trate `0/0` como "sin dato" y caiga al `accuracy` del arma le asigna al Incarnon
—perfecto— la precision de la escopeta. La fuente resuelve el caso publicando **100**: 64 de las 66
armas cuyo unico spread es `0/0` declaran `Accuracy = 100`.

**Cobertura:** las 4 gunblades (Redeemer, Redeemer Prime, Sarpa, Vastilok) lo llevan porque disparan;
el resto de melee no. **No cubiertos:** los modulares — prismas y scaffolds de amp, chambers de
kitgun — que la wiki modela como armas con ataque propio y nuestro dataset trae con `attacks: []`.
El pipeline los denuncia por nombre al generar (`spread sin ataque que lo reciba`) en vez de
descartarlos en silencio. Ver `governance/open-questions.md` → `OQ-DATA-14`.

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

