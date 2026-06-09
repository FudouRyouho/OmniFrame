---
Estado: "referencia"
Rol: "Workflow de testing derivado del engine: el CÓMO (clic + gramática ✓/fails/todo) y el registro de dirección (provenance, invariante, disparadores de graduación)"
Version: "v0.1.0"
Impacto_ID: "E-TestWorkflow"
Fidelidad_Fisica: "Project/src/core/engine/__tests__/helpers/consume.ts"
Fecha_de_creacion: "2026-06-09"
Fecha_de_actualizacion: "2026-06-09"
---

# Test workflow — testing derivado del engine

Este documento define **cómo** se testea el engine y **hacia dónde** va ese testing. Los catálogos
acompañan: [`catalog-current.md`](catalog-current.md) (índice de los consumidores que existen) y
[`catalog-future.md`](catalog-future.md) (builds y modelos por construir).

---

## El "clic" — punto único de consumo

El harness vive en `Project/src/core/engine/__tests__/helpers/consume.ts`. Un test impersona **A** (datos,
ya cargados), **B** (hidratación, vía el bridge) y **D** (mete la intención, lee la proyección). **C** (el
motor) es lo único bajo prueba. Como el motor es auto-auditable por construcción (cada nodo carga sus 6
buckets + audit trace), el clic es genérico: una implementación sirve a todos los consumidores.

```ts
consume(intention).weapon(id).node('WEAPON_DAMAGE')  // (i) los 6 buckets + final
consume(intention).weapon(id).audit('WEAPON_DAMAGE') // (ii) trace de procedencia (debug)
```

Un `consume()` = un `resolve`. Desde ese único consumo se sondean N nodos: estabilidad (`.final`) y lógica
(buckets) salen de la misma fuente.

---

## La gramática del test-consumidor (✓ / fails / todo)

Un test derivado no es solo "esperábamos X, dio X" — eso es determinista (el resultado ya se conoce por el
modelo documentado). Su valor real es **mapear el borde de C1**. Tres marcadores, leídos directo del runner:

| Marcador | Significa | Rol |
|---|---|---|
| `it(...)` ✓ | C1 cubre el stat | respuesta **+ red de regresión** (atrapó el cambio Felarx 25→41) |
| `it.fails(...)` | conocido-roto, target **verificable** | la falla visible (OQ-ENGINE-2: `total_flat` debería ser 20) |
| `it.todo('...')` | pregunta abierta / borde | "C1 llega hasta acá; esto es C1-gap o requiere C2" — sin fabricar respuesta |

El archivo de test **se lee como el mapa del borde**. Es pregunta **y** respuesta: la capa-respuesta es la
red de regresión; la capa-pregunta (`todo`) es la brújula de construcción. Ejemplo vivo —
`cedo-prime.test.ts` (shotgun pura, baseline): 12 ✓ + 5 todo, los `todo` marcando lo que es C2
(`AtomicSimulator`/`StatusEngine`) o gap de mapeo. Referencia para acuñar los `todo`:
[`hit-mechanic.md`](../../../../references/wiki/mechanics/hit-mechanic.md) §Relevancia para el engine.

---

## Registro de dirección (decisión durable)

### Provenance — qué es intención original y qué es emergente

- **Observabilidad por buckets = intención de diseño original.** Pensar las fórmulas de C como buckets
  descomponibles nació para dar observabilidad, orientada a **D (UI)** — concepto que ya existía en la
  arquitectura anterior del engine. El rediseño no inventó la idea: la **habilitó mejor** al hacer las capas
  agnósticas y desacopladas (lo que la versión vieja no lograba, y por eso se rompía ahí). Esta función está
  **diferida hasta que D exista**.
- **Sonda de construcción = función emergente, no escrita.** Usar esa misma descomponibilidad para
  *construir* el engine en tiempo de desarrollo (el clic, el frontier-map) es la función que nadie escribió
  en el diseño. Es lo que se está explotando hoy.
- **El agnosticismo de capas = el activo a proteger.** Es lo que el rediseño aportó y la precondición de
  todo lo demás.

### Invariante

> **Mantener los contratos por capa agnósticos y descomponibles.** El clic (y cualquier sonda futura) es
> posible solo mientras cada costura A→B→C→D tenga un I/O limpio e inspeccionable. No acoplar capas, no
> filtrar estado entre ellas. Violarlo cierra la puerta a la observabilidad — presente y futura.

### Tres futuros, disparadores distintos

| Futuro | Qué es | Disparador |
|---|---|---|
| 1 — sub-concern de engine | hoy (este `test/`) | — |
| 2 — **dominio de docs** transversal | una carpeta propia | **primer consumidor fuera del engine** (primer test de ability con esta gramática) |
| 3 — **capacidad** (capa debug/observabilidad, ≈ `observer/`) | una *capa real del sistema*: tracing por frontera con payload de buckets | **que exista D (UI)** que consuma los taps |

**C2 no dispara la graduación.** `CombatSimulator`/`AtomicSimulator`/`StatusEngine` son capas del engine:
C2 hace crecer el workflow *hacia adentro*, sigue siendo engine. Lo que gradúa es lo *transversal*
(abilities → Futuro 2) o lo *runtime* (D existe → Futuro 3). Construir taps sin consumidor (p. ej. C→D antes
de que D exista) es prematuro.

---

## Lineaje de decisión (D12–D16)

> Origen: sesión 2026-06-08 (`.working/` purgado tras graduar).

- **D12 — Test progresivo = diagonal.** Un consumidor, linaje de aserciones en orden de dependencia (no N
  fixtures horizontales). El linaje puede vivir dentro de un mismo test como secuencia de aserciones.
- **D13 — Test de lógica ≠ test de estabilidad.** El fixture trae una cadena de derivación esperada por nodo
  (buckets del `AttributeNode`), no un valor terminal suelto. Asertar solo `final` dice *que* algo se rompió;
  asertar buckets dice *dónde*. → Graduado a [`attribute-node-contract.md`](../attribute-node-contract.md) §Validación.
- **D14 — Base del linaje incondicional.** Lo condicional/stacking sale de la base y entra como peldaño
  posterior con su supuesto registrado.
- **D15 — La build real es el plan de estudios.** Estratificación por modelabilidad (ver `catalog-future.md`, Rhino).
- **D16 — Generalización.** La primera referencia no es la única; coverage deliberado, no "más builds".

**Primer fallo predicho:** `ModRepository` emite todo como `ADD`; Roar debería ser `MULTIPLICATIVE`
(ver [`attribute-node-contract.md`](../attribute-node-contract.md) §Implicaciones) — el peldaño Roar fallará
por mis-bucketing, gap real que el test progresivo captura.
