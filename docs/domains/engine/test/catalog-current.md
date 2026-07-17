---
Estado: "referencia"
Rol: "Índice de acceso a los consumidores de test que existen hoy: qué modelo resuelve cada uno y dónde está"
Impacto_ID: "E-TestCatalogCurrent"
Fidelidad_Fisica: "Project/src/core/engine/__tests__/"
Fecha_de_creacion: "2026-06-09"
Fecha_de_actualizacion: "2026-07-17"
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
| **Lanka** | sniper de carga, proyectil dual-perfil | tres nodos **Capa 4**, tres moldes de base: `WEAPON_FLAT_PUNCH_THROUGH` (override + `ADD_FLAT`), `WEAPON_ADD_PROJECTILE_SPEED` (raw `flight` + `ADD` %), `WEAPON_ADD_RECOIL` (base **sintética 100** + `ADD` %, inerte); + stacking de dos dual-stats en fire rate | `__tests__/lanka.test.ts` |
| **Cedo** (negativo) | shotgun hitscan-con-falloff | gate hitscan: `WEAPON_ADD_PROJECTILE_SPEED` **ausente** (ausencia ≠ 0) — blinda el gate de `ItemRepository` | `__tests__/cedo-prime.test.ts` |
| **Arcano v0** (Primary Merciless / Lanka) | arcano siempre-activo + guarda de null | flujo A→B→C de arcanos: `ArcaneRepository` → modifier directo (sin DamageCombiner); `+30% reload` fluye (→130), parte `on_kill` `base_value:null` omitida (OQ-DATA-4), clamp de rank | `__tests__/arcane.test.ts` |
| **Nikana Prime** | melee (hit-base / Slam / Heavy Slam) | un archivo por arma, **un `describe` por build** sobre el mismo fixture parametrizado (`withMods`/`profile`/`withCO`): el grafo genérico resuelve un melee **como un gun** (OQ-ENGINE-14); + CO `adding`, combo del Heavy Slam (`melee-combo.md §4.1`), CO×combo en buckets separados, Blood Rush (`COMBO_SCALED_ADD`) | `__tests__/nikana-melee.test.ts` |
| **Rhino** | warframe (entidad no-arma) | primer net-new de **Capa 2**: A→B→C sobre nodos `AVATAR_*`; mods (%) y shards (flat) componen `Total = Base × (1 + Mods%) + Flat`. + **Fase 1a: Roar** = derive **cross-entity** source→target (`source_entity`, sintético) | `__tests__/rhino.test.ts` |
| **Tiberon Prime** | rifle, DoT scaling | reproduce **end-to-end un test in-game** (`references/ingame-tests/dot-scaling.md`): el DoT escala con el base innato × Serration (NO el compuesto) y su `own_element` sale de los mods del propio elemento. Firma empírica que lockea el fix: **el Slash DoT no cambia al agregar Heat** (el hit sí) | `__tests__/tiberon-dot.test.ts` |

> **Qué NO se cataloga acá:** tests de **datos/regla** y de **mecánica/ley** — integridad de override y
> resolución DNA (`weapon-multishot-resolution`), familia CO (`co-*`), leyes de status (`status/*`), eje
> enemigo (`enemy-*`, `resolvehit-dr`, `target-faction-matrix`), seams (`damage-instance-seam`). Son otra
> capa: no derivan un arma concreta contra el arsenal.

**Cada test lleva su capa-pregunta** (`it.todo`) marcando el borde de C1 — lo que es C2 o gap de mapeo.
Correr la suite (`vitest --run src/core/engine`) muestra el mapa: ✓ cubierto / `fails` roto-conocido /
`todo` frontera abierta.
