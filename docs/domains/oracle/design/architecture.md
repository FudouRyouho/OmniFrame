---
Estado: "activo"
Rol: "Diseño de la organización del Oracle (decisión de diseño abierta)"
Impacto_ID: "O-Arch"
Fidelidad_Fisica: "Project/scripts/oracle/"
Fecha_de_creacion: "2026-07-24"
Fecha_de_actualizacion: "2026-07-24"
---

# Oracle — Arquitectura de la organización (diseño target)

> **Decisión de diseño abierta.** Este documento describe la organización a la que el Oracle se
> dirige, no la que tiene hoy. Es SSoT *adelantado*: el drift vive en el código hasta que la
> reorganización aterrice. Ver la excepción declarada en [`../status.md`](../status.md).

El Oracle deja de ser un spike monolítico (un `oracle.ts` que en cada rama parsea `argv`, llama al
motor e imprime) y pasa a una organización que sirve sus **tres roles** (consumidor / partera de
contratos / banco de trabajo — ver [`../status.md`](../status.md)). Dos decisiones estructurales lo
sostienen: un **eje de lentes** sobre el pipeline, y **tres capas internas** cuyo seam central es el
órgano por el que el Oracle hace crecer el engine.

---

## 1. El eje de lentes (reemplaza "acto")

El Oracle no ofrece "una de tres salidas fijas" (`raw`/`view`/`metrics`). Ofrece **elegir qué punto
del pipeline observar**. `raw` y `view` no eran dos actos: eran el **mismo stage (C1)** con dos
*shapings* distintos. Al descomponer, emerge un eje general —la **lente**— que escala con el motor:

Lentes **sobre una build** (sujeto A1):

| Lente | Punto del pipeline | Qué expone | Estado |
|---|---|---|---|
| `nodes` | **C1** crudo | los `AttributeNode` completos (base + 5 buckets + final) | implementada |
| `display` | **C1** proyectado | el `ViewModelContract` (`project()` → `token·value·unit`) | implementada |
| `metrics` | **C2** | `CombatMetrics` (DPS/TTK/status weights) vs un target | implementada |
| `trace` | **C1** (procedencia) | el trace por modifier de un nodo (source·op·impact) | implementada |
| `intention` | salida de **B** | la intención hidratada (qué produjo el bridge desde A) | **diferida**: el bridge no expone el `Ensemble`/`MutatedDNA` intermedio → requiere abrir `@core` |

Lente **utilitaria** (no observa el pipeline de una build):

| Lente | Sujeto | Qué expone | Estado |
|---|---|---|---|
| `enemy` | nombre de enemigo | el enemigo escalado (health/armor/DR/EHP), sin build | implementada; hoy reimplementa el EHP **fuera de C** (síntoma a reconciliar — que deje de bypasear el pipeline es trabajo futuro) |

**Por qué este eje y no la terna anterior:** un desarrollador que construye un mecanismo nuevo necesita
ver *cada seam* —¿B hidrató bien? ¿C1 puso el bucket correcto? ¿el trace muestra la fuente esperada?—,
no sólo el número final. `trace` ya la produce el motor (es **auto-trazable por construcción**: cada
nodo carga sus 5 buckets + el trace opt-in) y antes el Oracle la descartaba en stdout. `intention` es
el mismo caso pero su seam (salida de B) **no está expuesto** por el bridge — por eso queda declarada
en el eje pero diferida hasta que `@core` la publique. La disciplina se cumple: el vocabulario nombra
la lente, la implementación llega cuando el seam existe.

**Disciplina (anti-overengineering):** el *vocabulario* del eje es general y escala; la
*implementación* cubre **sólo las lentes cuyo punto de pipeline existe hoy**. No se inventan stages
futuros. Una lente nace cuando el seam que observa nace en el motor, no antes.

---

## 2. Las tres capas internas

La fuente del Oracle se organiza en tres capas que **espejan su función**:

```
argv ──▶ [1] Dispatch ──▶ OracleQuery ──▶ [2] Adquisición ──▶ AcquiredResult ──▶ [3] Presentación ──▶ stdout
```

1. **Dispatch** — `argv → OracleQuery { lens, subject, a2?, node?, format }`. Parser propio, zero-dep
   (coherente con la cultura del proyecto: no hay librería de args y no se agrega una para esto).
   Un solo lugar de parsing y validación de forma; ninguna rama vuelve a leer `process.argv` suelto.

2. **Adquisición** (motor-facing) — `OracleQuery → AcquiredResult`. Llama a `consume()` /
   `computeCombatMetrics` / `getTrace` / el bridge según la lente. Produce **estructuras nativas del
   motor, sin formatear**. Un único punto de resolución de sujeto (`resolveSubject`) traduce A1 a
   `EnsembleIntention` (hoy `BUILDS[name]`; gancho limpio para la boca de intención parcial, diferida).

3. **Presentación** — `AcquiredResult × format → stdout`. `text` (humano) | `json` (máquina/IA).
   **Desechable y específica del Oracle**: no es un contrato, es el borde de impresión.

### 2.1. El seam Adquisición↔Presentación — el órgano de crecimiento

El seam entre la capa 2 y la capa 3 es donde el Oracle **pare contratos**. `ViewModelContract` v0 y
`CombatMetrics` nacieron exactamente ahí —de una `AcquiredResult` que se estabilizó y a la que un
consumidor de producción le encontró uso. Mantener ese seam limpio (adquisición sin `console.log`
adentro) es lo que permite **promover** un contrato: cuando una `AcquiredResult` se cristaliza, se
extrae de la capa 2 y se muda a `@shared`; la capa 3 del Oracle queda como **un consumidor más** de ese
contrato, no su dueño.

Esto es, en concreto, "abrir nuevos consumidores": **el Oracle es la partera del contrato, no su hogar
final.** Si la adquisición estuviera mezclada con la impresión (como en el spike actual), el contrato
nacería enredado con el formato y no se podría promover sin cirugía.

El formato `json` no es cosmético: es el **proto-contrato serializado** —la `AcquiredResult` volcada
casi sin shaping—, el primer "consumidor máquina" y el borrador de lo que un consumidor de producción
consumirá después.

---

## 3. Gramática de invocación

```
oracle <lente> <sujeto> [A2: --vs <enemy> --lvl <n> --dur <n>] [--node <attr>] [--format text|json]
```

- **`<lente>`** ∈ `{ intention, nodes, display, metrics, trace }` — punto de observación (§1).
- **`<sujeto>`** — A1; resuelto en un único `resolveSubject` (hoy `BUILDS[name]` | `all`).
- **`--vs / --lvl / --dur`** — **A2**, la consulta a C2; relevantes sólo cuando la lente los consume
  (`metrics`). Nombre reservado; su contrato **no se cristaliza en docs todavía** —el uso le da forma
  primero, mismo patrón que `ViewModelContract` (evita el error de "cristalizar un tipo sin
  call-sites", ya purgado una vez en el motor).
- **`--node <attr>`** — selector de la lente `trace`.
- **`--format`** — eje ortogonal, aplica a toda lente por igual.

**A2 pertenece al motor, no al CLI.** El target/nivel/duración no son un invento del Oracle: son la
consulta que C2 ya espera. Por eso son flags de la lente que los consume, no un lenguaje propio del CLI
— el Oracle no inventa vocabulario, ejerce el del engine (A1 → A2 → C).

---

## 4. Fuera de scope (diferido, con hogar)

- **Boca de intención parcial** (pasar un `EnsembleIntention` a medias, completado por
  `merge(EMPTY_ENSEMBLE, parcial)`; `DeepPartial` como tipo + normalizador como capa de inyección,
  análogo al hook de la UI): es el **Trabajo 2**. Esta organización le deja el gancho (`resolveSubject`),
  no lo implementa.
- **Saneamiento de `EnsembleIntention`** (vocabulario `rank`/`level` inconsistente en mods): frente
  aparte, toca contrato core (RED) → se abre su OQ y no se mezcla con esta reorganización.
- **Error-handling del borde A→B** ante input no-confiable: se **observa cómo falla** primero
  (function-first), se endurece después. Abrir la boca de intención parcial (Trabajo 2) es lo que lo
  expondrá.

---

## 5. Restricciones que este diseño preserva

- **Hermanamiento test↔Oracle:** las fixtures de [`builds.ts`](../../../../Project/src/core/engine/fixtures/builds.ts)
  siguen siendo el input compartido con los tests (ground-truth verificado in-game). La reorganización
  toca *cómo el Oracle consume y presenta*, no *qué producen las factories* — cualquier cambio a las
  fixtures debe dejar los tests verdes.
- **Localidad estricta** ([`Project/CLAUDE.md`](../../../../Project/CLAUDE.md) Restricción 1): la capa
  de adquisición consume el motor por sus puertos públicos (`@core/engine/output`, `@shared`), sin
  importar internos de dominios hermanos.
