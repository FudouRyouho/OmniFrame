# Caps de stacks con dos emisores — el cap decide **sumar o reemplazar**

> Rol: test in-game sobre **de quién es el cap de stacks** cuando dos jugadores con caps distintos
> aplican el mismo status al mismo enemigo.
> Fuente de verdad de: la regla de aplicación de un proc sobre-cap, y el dueño del cap.
> Última actualización: 2026-08-06
>
> **Corrige:** la formulación *"el cap gatea la escritura"*, y la lectura de que la barrera del emisor
> **rechaza** un proc que llega sobre-cap — no lo rechaza: **refresca**.
> **Confirma:** `docs/domains/engine/design/damage-status-model.md` §primitivo — *"sobre-cap: reemplaza
> al stack más viejo"*, que resulta valer sin cambios para dos emisores.

**Setup — dos jugadores, dos caps:**

| | Cap de Corrosive | Cómo |
|---|---|---|
| **Jugador A** | **19** | 3 × Tauforged Emerald Archon Shard (`+3` c/u = **`+9`** sobre el default 10) |
| **Jugador B** | **10** | sin shards. Arma: **Catabolyst Coda** (mono-tipo Corrosive) |

El enemigo no es relevante: se mide **el contador de stacks**, no el daño.

---

## La regla que sale de los cinco tests

```
si  count <  cap_del_que_aplica   →  count++                      (SUMA)
si  count ≥  cap_del_que_aplica   →  refresca el stack más viejo  (REEMPLAZA — count no cambia)
```

**El proc siempre entra.** El cap no decide *si* el proc se aplica: decide **si suma o reemplaza**.

| # | Situación | Predicho | Medido |
|---|---|---|---|
| 1 | A pone **19**, B dispara | `19 ≥ 10` → refresca · queda **19** | **se mantiene en 19** ✅ |
| 2 | A pone 19 y espera que decaiga, con B disparando | B refresca el más viejo rotativamente → **no decae** | **se sigue manteniendo** ✅ |
| 3 | A pone el **primer** hit, después sólo B | `1 < 10` → B sube hasta **10** y se traba | **no supera 10** ✅ |
| 4 | A sube a 19, decae a 8-9, entra B | `8 < 10` → B sube a **10** y se traba | **sigue sin superar 10** ✅ |
| 5 | en 10, A mete el **11**, decae a 10, B dispara | B en `10 ≥ 10` → sólo refresca | **no puede subirlo** ✅ |

**Cinco de cinco, sin excepciones**, y el orden de quién pega primero **no cambia nada** (3 vs 1).

### Lo que resuelve la ambigüedad de "mantener"

*"B podía mantener el `10+n` pero no subirlo"* parecía contradictorio. No lo es: **mantener es
refrescar, subir es sumar** — dos operaciones distintas, y el cap sólo bloquea la segunda.

---

## Consecuencias

### El cap es del **que aplica**; el estado es del **receptor**

Un solo contador vive en el enemigo. Cada emisor trae su propio cap y lo evalúa **en el momento de
aplicar**. Nada en el estado recuerda quién puso cada stack — no hace falta.

### Los desvíos del mismo portador **suman entre sí**

`3 × (+3) = +9`. El wikitext del Emerald Archon Shard es un `{{Stub}}` y no lo dice; acá queda medido.

### 🔴 `min(cap, count + 1)` es la implementación equivocada

```ts
// Project/src/core/engine/formulas/status/behaviors.ts
return { count: Math.min(laws.corrosive_max_stacks, (state?.count ?? 0) + amount) };
```

Con `count = 19` y el cap de B (`10`): `min(10, 20)` → **10**. El juego da **19**.

`min()` **colapsa el contador hacia abajo** cuando ya está por encima del cap; la regla real **nunca lo
baja**. Las dos funciones coinciden sólo mientras `count ≤ cap` — es decir, **mientras haya un solo
emisor**. Es un bug latente, no activo: hoy el motor no modela dos emisores.

### El estado escalar no alcanza — dato para `OQ-ENGINE-16`

```ts
interface StackState { count: number; }
```

*"Reemplaza el más viejo"* es una operación **sobre instancias**: sin timers individuales no existe "el
más viejo". `OQ-ENGINE-16` pedía *"un caso real estresado con dato, no teorizando"* — **este es ese
dato**, y llegó por un lado inesperado: no por fidelidad de decay, sino por **dos caps distintos**.

⚠️ La asimetría está **dentro del mismo archivo**: el DoT ya modela instancias
(`DotState { pulses: DotPulse[] }`); los stack-debuff se quedaron en escalar.
