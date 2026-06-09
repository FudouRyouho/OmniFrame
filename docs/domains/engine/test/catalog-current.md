---
Estado: "referencia"
Rol: "Índice de acceso a los consumidores de test que existen hoy: qué modelo resuelve cada uno y dónde está"
Version: "v0.1.0"
Impacto_ID: "E-TestCatalogCurrent"
Fidelidad_Fisica: "Project/src/core/engine/__tests__/"
Fecha_de_creacion: "2026-06-09"
Fecha_de_actualizacion: "2026-06-09"
---

# Catálogo actual — consumidores de test

Índice de acceso, **no** derivación. La derivación por bucket (el *cómo* de cada número) vive en el JSDoc y
las aserciones del propio test — esa es la SSoT. Este doc solo dice **qué modelo resuelve cada consumidor y
dónde encontrarlo**, para no duplicar (y no quedar stale como las tablas que ya se corrigieron).

Workflow y gramática: [`test-workflow.md`](test-workflow.md).

| Consumidor | Tipo de ataque | Modelo que resuelve | Test |
|---|---|---|---|
| **Boltor Prime** | proyectil, base↔incarnon | perks genesis `BASE_FLAT` + perk×mod; genesis activo en ambos perfiles | `__tests__/boltor-prime-incarnon.test.ts` |
| **Cedo Prime** | escopeta multi-pellet (no-incarnon) | flag `on_kill` (base vs estático) + dual-stat; baseline de shotgun pura | `__tests__/cedo-prime.test.ts` |
| **Felarx** | escopeta multi-pellet + incarnon | flat ÷ multishot acoplado al perfil (OQ-ENGINE-2) | `__tests__/felarx.test.ts` |
| **Laetum** | pistola single + radial | perk **condicional** (on_headshot) + flat post-mods sin dividir + 3 geometrías | `__tests__/laetum.test.ts` |

> El multishot-resolution (`weapon-multishot-resolution.test.ts`) es un test de **datos/regla** (integridad
> del override + resolución DNA), no un consumidor derivado. Otra capa; no se cataloga acá.

**Cada test lleva su capa-pregunta** (`it.todo`) marcando el borde de C1 — lo que es C2 o gap de mapeo.
Correr la suite (`vitest --run src/core/engine`) muestra el mapa: ✓ cubierto / `fails` roto-conocido /
`todo` frontera abierta.
