---
Estado: "referencia"
Rol: "Catálogo de builds y modelos de test por construir: roadmap de fixtures (Rhino, standard-set por arquetipo, frontera C2) y modelos sin consumidor"
Impacto_ID: "E-TestCatalogFuture"
Fidelidad_Fisica: "Project/src/core/engine/__tests__/"
Fecha_de_creacion: "2026-06-09"
Fecha_de_actualizacion: "2026-07-24"
---

# Catálogo futuro — builds y modelos por construir

Roadmap de cobertura. Para lo que ya existe ver [`catalog-current.md`](catalog-current.md); para el método
ver [`test-workflow.md`](test-workflow.md).

---

## Modelos sin consumidor todavía

- **CO en radial** (double-dip sobre AoE) — geometría AoE, code-path C2 distinto.
- **CO en multi-pellet** (double-dip por pellet) — `fixture_05` del lineaje Rhino, no escrito.
- **cross-stat / cross-entity** (Iron Skin, ability→weapon) — Rhino, abajo.

---

## Standard set por arquetipo (concepto)

Idea de cobertura: un baseline por **arquetipo de disparo** (`shot_type`: hitscan/projectile/aoe/thrown,
ver `weapons-attack-structure.md`), separado del layer incarnon, para tener la composición "pura" de cómo
aplican hit / estado / multishot / crítico antes de derivar a casos no estándar.

**Matiz clave:** el engine **no lee `shot_type`** — C1 es value-driven (lo maneja el valor de multishot, no
el tipo). En C1, "hitscan puro" y "shotgun puro" son el mismo code-path con `multishot` distinto → un
baseline por arquetipo en C1 sería horizontal (redundante). **El arquetipo deja de ser redundante en C2**,
donde Projectile / AoE / Beam sí son code-paths distintos (`rollPellets` vs detección por radio vs
multiplicador continuo). Por eso el standard set es, en rigor, **validación de C2 por arquetipo**, no una
extensión de C1. Cedo (shotgun no-incarnon) es el punto de partida natural para Projectile multi-pellet.

Candidato mencionado: **Furis incarnon** como hitscan secundaria "normalita" — sus perks se desactivan
omitiendo `evolution_perks`, así que sirve de baseline puro **y** de consumidor con perks con el mismo intent.

---

## Build de referencia — Rhino (warframe net-new)

Build real del usuario. Mide cross-stat (Iron Skin) y ability output (Roar) — ejes que ningún consumidor de
arma ejerce.

| Slot | Pieza |
|---|---|
| Aura | Growing Power |
| Mods | Adaptation, Blind Rage, Transient Fortitude, Stretch, *Amar's Hatred*, Primed Continuity, Primed Flow, Equilibrium |
| Arcanos | Molt Augmented, Arcane Energize |
| Exilus | Preparation |
| Archon | 2 shards azules tauforjados de armadura |
| Helminto | Nourish (Grendel) — subsumido, no modelado |

### Estratificación por modelabilidad

| Tier | Piezas | Estado | Rol en el test |
|---|---|---|---|
| 1 — nodos limpios | Blind Rage, Transient Fortitude, P. Continuity, Stretch, 2 shards armadura | resuelven hoy (`ShardRepository` activo) | **base reproducible** = primer fixture |
| 2 — condicional/stacking | Growing Power, Molt Augmented, Adaptation | requieren modelo de fidelidad | peldaños posteriores; staking/duration |
| 3 — economía de energía | P. Flow, Equilibrium, Arcane Energize, Preparation | inertes al grafo strength/daño | el test **prueba la inercia** |
| 4 — subsumido | Nourish (Helminth) | fuera de scope | anotado, no modelado |
| verificar | *Amar's Hatred* | stat sin ubicar | no entra al grafo hasta confirmar qué toca |

**Hilo testigo:** los shards de armadura son **inertes a strength** pero **load-bearing para Iron Skin**
(`overguard = (1200 + armor×2.5) × strength`). Un test que solo mira `final` no lo ve; uno sobre buckets sí.

### Crecimiento del grafo de intención (linaje)

La **base es incondicional** (Tier 1); lo condicional/stacking entra como peldaño posterior con supuesto explícito.

```
fixture_01: Rhino + mods Tier 1            → strength / duration / range / armor          ✅ hecho
fixture_02: fixture_01 + Iron Skin         → overguard = (1200 + armor×2.5) × strength   (cross-stat C1) — it.todo
fixture_03: (Rhino Tier 1) + Roar          → bonus damage = 50% × strength               ✅ hecho
fixture_04: fixture_03 → aplicado a weapon → hit modificado (pool de facción)            ✅ hecho
fixture_05: fixture_04 + Condition Overload→ double-dipping                              (C2) — pendiente
```

> **Roar (fixture 03/04)** está construido **directo sobre Tier 1**, no sobre Iron Skin — el linaje no es una dependencia dura. Restan **fixture_02 (Iron Skin, cross-stat)** y **fixture_05 (CO double-dip, C2)**.

---

## Gates abiertos

- **≥2 warframes de validación** (D16) antes de consolidar el grafo de warframe como referencia validada.
- **`WarframeRepository` no existe** — `formulas/warframe/` está vacío intencionalmente (purgado).
  El primer fixture de warframe (Rhino Tier 1) es trabajo net-new, no rescate. Antes de diseñarlo: leer
  `docs/data/schemas/abilities/formula-patterns.md` (Iron Skin es cross-stat).
- **Frontera C2** — los `it.todo` de los consumidores actuales (crit-por-pellet, procs/disparo, daño÷pellet,
  AoE radial) apuntan todos a C2: ese es el frente de construcción inmediato, dentro de engine.
