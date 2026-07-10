---
Estado: "referencia"
Rol: "Marco de propiedad y flujo del daño (instancia→daño→estado) — RATIFICADO + Familia A extraída (2026-07-10). Núcleo promovido a arch-decisions §14; gated a decision-frontier §4. Este doc conserva el casework que informa el trabajo gated."
Version: "v1.0.0"
Impacto_ID: "E-DamageFlow"
Fidelidad_Fisica: "Project/src/core/engine/formulas/status/"
Fecha_de_creacion: "2026-07-10"
Fecha_de_actualizacion: "2026-07-10"
Dependencias:
  - "docs/domains/engine/design/arch-decisions.md"
  - "docs/domains/engine/design/damage-status-model.md"
---

# Modelo de flujo del daño

> ✅ **RATIFICADO + IMPLEMENTADO (2026-07-10).** El marco se estresó con 3 casos reales (Toxic Lash,
> Xata) + 2 conceptuales, salió más preciso de cada golpe, y su núcleo se **promovió a
> [`arch-decisions.md`](./arch-decisions.md) §14** (SSoT ahora). Lo gated viaja a
> [`../../../governance/decision-frontier.md`](../../../governance/decision-frontier.md) §4. Este doc
> se **condensó** tras cumplir su cometido de gate del debate — la narrativa completa del debate vive en
> git (commit del *final trace*). Lo que queda acá: el **casework** que informará el trabajo gated cuando
> su gate se abra (§O5: primer daño-de-habilidad). **No duplicar §14** — si el marco evoluciona, se edita §14.

## El marco en una línea

El daño **no pertenece** a weapon ni a enemy — **viaja**: `instancia (source) → daño → tipo de daño →
estado del daño (target)`. Source y target son agnósticos entre sí hasta el punto de **resolución**. Tres
capas antes fundidas en `EnemyState`: **LEY** (qué hace N stacks, pura, `formulas/status/`) · **ESTADO**
(este target tiene N stacks, portado-por-entidad) · **RESOLUCIÓN** (este hit contra ese estado + defensas,
el *pairing*). El vínculo tipo↔efecto se parte en **Arista 1** (identidad tipo→proc, 1:1, vocabulario) y
**Arista 2** (aplicación ¿proquea?, NO 1:1, mayormente C2). Detalle y consecuencias: **§14**.

## Qué se implementó (§6-SÍ)

Extracción de **Familia A** (`f(n) = first + perAdd × max(0, n−1)`, clamp opcional) a
`formulas/status/stack-debuff.ts`; `EnemyState` → orquestador; LEY + ESTADO keyeados por **efecto**
(corrosion/infection/ignite/disruption). Tests falsables en `status-family-a.test.ts` (función pura +
regresión + suite enumerada vs wiki + key-por-efecto). Ver §14 para el detalle completo.

## Casework que informa el trabajo gated (NO modelar hoy)

Casos reales que tocan puntos que C1 aún no cubre (gate O5 = primer daño-de-habilidad resuelto). Se
conservan porque **afinan la hipótesis** del `DamageInstance` de primera clase + Arista 2 cuando toque.

**Saryn — Toxic Lash** (`/w/Toxic_Lash`, verificado 2026-07-10). *"extra Toxin attack that scales with
weapon damage, before health and armor resistances"* + *"guaranteed Toxin proc / 100% status chance"*.
- **El spec de aplicación es per-INSTANCIA, no per-source (prueba dura).** Un golpe = 2 instancias: la del
  arma (su status chance) + la de Toxic Lash (`forced_proc = Toxin`). Dos specs del mismo golpe → imposible
  si el spec viviera en el source.
- **"Source afecta el daño" = 2 sabores:** **CREAR** instancia nueva (Toxic Lash) vs **MODIFICAR** una
  existente (mod `+daño`). Toxic Lash es CREAR.
- **`instancia ≠ trigger-pull`:** una acción emite N instancias (ya visto en multishot). **Cross-entity:** la
  instancia deriva su magnitud del daño del arma = patrón `source_attribute` (§12) + ruteo cross-entity de
  Roar (`rhino.test.ts` fixture_04) → mismo gate O5.

**Xaku — Xata's Whisper** (`/w/Xata's_Whisper`, verificado 2026-07-10). *"separate damage instance… does
not dilute weapon elements"* · *"17–26% of total weapon damage as Void"* · *"double dips on faction damage"*
· *"proc based on the weapon's total status chance"*.
- **Estructuralmente = Toxic Lash** (CREAR instancia derivada, % del daño del arma, cross-entity), NO Roar.
- **Spec de aplicación distinto en el mismo sabor:** Xata = `chance` (hereda status chance) vs Toxic Lash =
  `forced`. Refuerza: el spec es per-instancia.
- **Generaliza el double-dip (hipótesis a testear):** no es exclusivo del DoT ni del sabor MODIFICAR — es
  propiedad de la **estructura de derivación** (`(1+Σbucket②)²`). Falsable: predice Xata-void ×(1+faction)²
  (multiplicidad no verificada numéricamente aún).
- **Abierto empírico:** ¿el void alimenta el tick de Ignite? Predicción del marco (instancias independientes
  → NO), sin confirmar. Parkeado (Familia C + habilidad, doble-gate).

## Vínculos

- [`arch-decisions.md`](./arch-decisions.md) **§14** (el marco, SSoT) · §8 (C1/C2) · §13 (`EnemySnapshot`,
  el pairing del lado entrada — espejo del estado del daño del lado salida) · §4 (double-dip ②/③).
- [`../../../governance/decision-frontier.md`](../../../governance/decision-frontier.md) §4 — lo gated.
- [`damage-status-model.md`](./damage-status-model.md) §Checkpoint 3 = Familia C (DoT-tick), fuera de este trabajo.
- `references/wiki/mechanics/status-effects.md` — fórmulas por tipo/efecto.
