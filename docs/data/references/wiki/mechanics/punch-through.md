---
Estado: "referencia"
Rol: "Mecánica Punch Through — penetración flat en metros, base WEAPON_FLAT_PUNCH_THROUGH"
Version: "v0.1.0"
Impacto_ID: "REF-PunchThrough"
Fidelidad_Fisica: "Project/public/data/mod-stats.override.json"
Fecha_de_creacion: "2026-06-06"
Fecha_de_actualizacion: "2026-06-06"
Fuente: "https://wiki.warframe.com/w/Punch_Through"
---

# Punch Through — Mecánica de Penetración

## Definición

**Punch Through** = qué tan lejos puede un disparo atravesar enemigos y objetos antes de
despawnear. Medido en **metros**. Cada blanco atravesado **resta** su "grosor" del potencial
de penetración restante de ese proyectil.

Referencias de escala:
- **1.2m** ≈ basta para atravesar un enemigo al menos una vez.
- **2.1m** ≈ atraviesa cuatro Grineer Butcher en fila (1.2m solo perfora los dos primeros).

Barreras que **nunca** se penetran, sin importar el valor: barreras de Arctic Eximus, campos de
Nullifier Crewman, y ciertos weakspots de jefes.

---

## Base por arma (0 = sin punch nato)

La **mayoría** de las armas tienen **0m** de punch through nativo. Varias lo traen innato:

| Arma | Punch nato | Nota |
|---|---|---|
| Zenith (Semi) | 99 999m | ≈ infinito |
| Lanka | 5.0m | solo Charged Shot |
| Daikyu / Snipetron Vandal / Phenmor (Incarnon) / Paris Prime | 3.0m | charged / forma incarnon |
| Dread / Miter / Snipetron | 2.5m | charged shot |

- **Charged-shot:** el punch nato suele aplicar solo a carga completa; el disparo sin cargar
  típicamente penetra 0m.
- **Melee:** sin fuentes de mod dedicadas, pero el golpe regular igual puede aprovechar punch
  through para atravesar geometría de nivel.

---

## Mods — flat aditivo en metros, nunca %

Los mods suman punch through como **valor flat aditivo en metros**. **No existen mods de punch
through porcentual.** El valor del arma y los mods **stackean aditivamente**.

| Mod | Ranks | Rango |
|---|---|---|
| Metal Auger / Seeking Force | 6 | +0.4m → +2.1m |
| Primed Shred | 11 | +0.2m → +2.2m |
| Power Throw | 6 | +0.3m → +2.0m |
| Vigilante Offense | 6 | +0.25m → +1.5m |
| Shred / Merciless Gunfight | 6 | +0.2m → +1.2m |

---

## Comportamiento por tipo de ataque

- **Hitscan:** aprovecha punch through normalmente.
- **Proyectil no-hitscan:** aplica; al atravesar geometría pierde una cantidad significativa de
  velocidad, pero sigue viajando por el espacio vacío posterior.
- **Beam:** algunas armas continuas tienen *infinite body punch through* (Ignis, Ignis Wraith,
  Fulmin en Semi) — atraviesan enemigos ilimitados pero **no** geometría de nivel ni objetos.
- **Radial / AoE:** con muy pocas excepciones, los proyectiles con componente de área **no**
  penetran enemigos ni geometría — explotan al primer contacto.
- **Melee:** aplica a golpes regulares (bypass de geometría de nivel).

---

## Casos especiales

- **Infinite body punch through:** armas como Arca Plasmor, Ignis, Ignis Wraith y varias en
  forma Incarnon atraviesan enemigos ilimitados, pero no terreno ni barreras.
- **Cyte-09 (Seek):** otorga 10m de punch through contra cuerpos enemigos + punch through
  infinito contra terreno mientras está activa.

---

## Relevancia para el token

- Token: **`WEAPON_FLAT_PUNCH_THROUGH`** (`mod-stats.override` + stats Incarnon).
- Operación = **`ADD_FLAT`** (flat en metros, post-escala, **nunca** se amplifica). El segmento
  D-6 `FLAT` auto-deriva op `ADD_FLAT` vía `resolveToken()`. Cadena de rename: `WEAPON_PUNCTURE_DEPTH`
  (misnomer DE-legacy) → `WEAPON_ADD_PUNCH_THROUGH` (2026-06-04, intermedio) →
  `WEAPON_FLAT_PUNCH_THROUGH` (2026-06-06, segmento D-6 correcto).
- El "no-punch de AoE" es **contexto de arma**, no justifica token aparte.
- **Sin consumidor de engine aún:** el modifier se produce pero ningún nodo de arma lo recibe
  (nodo `PUNCH_THROUGH` ausente, Capa 4). Cómo el engine resolverá la mecánica vive fuera de este
  reference → **OQ-ENGINE-7** (`docs/governance/open-questions.md`). Ver también
  [`docs/semantic/upgrade-tokens.md`](../../../../semantic/upgrade-tokens.md)
  (fila `WEAPON_FLAT_PUNCH_THROUGH`).
</content>
</invoke>
