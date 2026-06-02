---
Estado: "activo"
Rol: "SSoT de la gramática facetada de nomenclaturas internas — define forma, vocabulario y reglas de composición"
Version: "v1.1.0"
Impacto_ID: "G-Nomenclatura"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-06-01"
Fecha_de_actualizacion: "2026-06-01 (v1.1.0 — esquema `layer` eliminado; L1-L4 de conditions descartado)"
---

# Nomenclature Grammar — Gramática de nomenclaturas internas

## Problema que resuelve

Las nomenclaturas internas del proyecto (`C2:STACK`, `Cat D`, `L1`, `[SEM]`, `[engine]`, etc.) crecieron orgánicamente, cada una con su propia ontología y sin SSoT unificado. Leer un tag requería conocer su historia, no su forma. El resultado: opacidad, colisiones (`[engine]` ≠ `[ENGINE]`) y carga cognitiva en un flujo solo-+-agentes-IA donde cada sesión arranca fría.

**Esta gramática unifica la *forma de comunicar*, no la *naturaleza* de cada nomenclatura.** Las distinciones semánticas reales se preservan como vocabulario dentro de los ejes.

---

## La gramática

```
DOMINIO:ROL[:ESQUEMA/ID]
```

| Segmento | Obligatorio | Describe | Separador |
|---|---|---|---|
| `DOMINIO` | ✅ | De qué área del proyecto emerge este tag | `:` hacia ROL |
| `ROL` | ✅ | Qué tipo de marca es (clasifica, deuda, nota, bloqueo) | `:` hacia ESQUEMA |
| `ESQUEMA/ID` | ❌ opcional | Sub-tipo o identificador puntual dentro del ROL | `/` entre esquema e id |

El tercer segmento solo aparece cuando el ROL agrupa esquemas heterogéneos que necesitan desambiguación.  
Sin él, el tag ya es unívoco: `semantic:debt` no necesita aclaración adicional.

---

## Vocabulario de DOMINIO

Vocabulario cerrado. Para agregar un valor, editar este documento.

| Valor | Área que representa | Fix location típico |
|---|---|---|
| `engine` | Lógica de simulación y fórmulas | `Project/src/core/engine/` |
| `data` | Datos de overrides, schemas, contratos JSON/TS | `Project/public/data/`, `docs/data/schemas/` |
| `semantic` | Vocabulario y taxonomía del juego | `docs/semantic/`, `modifier.ts` |
| `pipeline` | Generación y transformación de datos | `Project/scripts/pipeline/` |
| `ui` | Capa de presentación | `Project/src/` (UI) |

> ⚠️ **Deuda de vocabulario:** `engine` hoy consolida las capas A/B/C/D del sistema, cuando
> técnicamente el engine es solo la capa C. Cuando haya que clasificar algo en la capa B
> (mutator/`MutatorBridge`), `engine:` resulta ambiguo. Esta desambiguación queda pendiente —
> por ahora `engine` cubre todas las capas del motor. Registrado como deuda sin fecha.

---

## Vocabulario de ROL

Vocabulario cerrado. Cuatro roles, sin extensión salvo debate explícito.

| Valor | Qué marca | Cuándo usar |
|---|---|---|
| `class` | Clasifica o agrupa un concepto dentro de un esquema conocido | El tag asigna algo a una taxonomía del proyecto (categorías de modelado, grupos de runtime) |
| `debt` | Ítem de deuda técnica pendiente | Algo no está implementado, no está mapeado, o está incompleto. Siempre describe trabajo que falta. |
| `note` | Nota informativa de contexto | Información relevante para quien lea el archivo, sin acción pendiente implícita |
| `gate` | Bloqueo o verificación pendiente | Algo no puede avanzar hasta que se resuelva. Equivalente al `⚠️` anterior, con contexto explícito. |

---

## Vocabulario de ESQUEMA/ID (tercer segmento)

Solo para el ROL `class`. Esquemas activos:

| Esquema | Pertenece a | IDs válidos | Descripción |
|---|---|---|---|
| `c2` | `engine:class:c2/*` | `binary`, `derived`, `event`, `stack`, `formula` | Tipo de evaluación que require el SimContext (C2). `formula` = fórmula custom no encajable en los 4 tipos base. |
| `cat` | `data:class:cat/*` | `a`, `b`, `d`, `e`, `f` | Categoría de modelado de un stat respecto al engine |

Para `gate`, el esquema es el milestone: `g1`, `g2`, etc. El ID es el tipo de verificación (`verify`, `schema-or`, etc.).

---

## Regla del tercer segmento

**Obligatorio cuando** el ROL `class` agrupa más de un esquema heterogéneo. Sin el esquema, `engine:class:stack` es ambiguo — ¿es `c2/stack` o algún otro esquema de clasificación?

**Omisible cuando** el tag ya es unívoco por DOMINIO+ROL. Ejemplos:
- `semantic:debt` — hay un solo esquema de deuda semántica; no necesita id.
- `engine:note` — es simplemente una nota de dominio engine.
- `semantic:gate:g1/verify` — tiene esquema porque hay `g1` y `g2`.

---

## Regla de composición en notas JSON

En el campo `notes[]` de los override JSONs, un tag lleva la cadena descriptiva:

```json
"notes": ["engine:class:c2/event — reload instantáneo probabilístico (50%) cross-weapon"]
```

Cuando solo hay contexto informativo sin clasificación:
```json
"notes": ["engine:note — bloquea Cat A hasta resolver upgrade_type en fuente"]
```

**Si una nota tiene tanto clasificación como contexto descriptivo**, el tag de clasificación lidera y la descripción sigue después del `—`. El prefijo `engine:note` es redundante cuando ya hay `engine:class:*` (el dominio y la clase ya identifican la relevancia).

---

## Regla de composición en items de deuda (.md)

En listas de deuda dentro de documentos `.md`, los tags preceden la descripción del ítem. Múltiples tags del mismo ítem se separan con espacio:

```
- semantic:debt data:debt `TOKEN_NAME` — descripción [empirical]
- pipeline:debt campo `conclave` perdido en `GeneratedMod` [ref: @wfcd/items API]
- engine:debt profile switching no implementado — ver OQ-ENGINE-2 [ref: engine-audit.md]
```

> **El eje de evidencia `[EVD]`** (`[ref: ruta]`, `[empirical]`, `[inferred]`, `[needs-verification]`)
> **no entra en esta gramática** — es una dimensión ortogonal e independiente. Su definición
> y reglas viven en [`docs/governance/deuda-taxonomy.md`](deuda-taxonomy.md).

---

## Tabla de migración — viejo → nuevo

| Forma anterior | Nueva forma | Notas |
|---|---|---|
| `[engine]` (minúscula, JSON) | `engine:note` | Si acompaña `C2:*`, el `engine:note` es redundante — usar solo el `engine:class:c2/*` |
| `[data]` (minúscula, JSON) | `data:note` | |
| `[ENGINE]` (mayúscula, deuda) | `engine:debt` | Resuelve la colisión con `[engine]` |
| `[SEM]` | `semantic:debt` | |
| `[DATA]` | `data:debt` | |
| `[PIPE]` | `pipeline:debt` | |
| `[SCHEMA]` | `data:debt:schema` | Fix location: schemas JSON + tipos TS |
| `C2:STACK` | `engine:class:c2/stack` | |
| `C2:BINARY` | `engine:class:c2/binary` | |
| `C2:DERIVED` | `engine:class:c2/derived` | |
| `C2:EVENT` | `engine:class:c2/event` | |
| `Cat A` | `data:class:cat/a` | |
| `Cat B` | `data:class:cat/b` | |
| `Cat D` | `data:class:cat/d` | |
| `Cat E` | `data:class:cat/e` | |
| `Cat F` | `data:class:cat/f` | |
| `Gate 1` / `⚠️` Gate 1 | `semantic:gate:g1/verify` | |
| `Gate 2` / `⚠️` Gate 2 | `semantic:gate:g2/verify` | |
| `⚠️` (genérico) | Revisión manual — convertir a `*:gate:*` o reescribir en prosa | No migrar con regex ciego |

---

## Fuera del alcance de esta gramática

Los siguientes sistemas son independientes y **no** se rigen por esta gramática:

| Sistema | Ubicación del SSoT | Estado |
|---|---|---|
| Eje de evidencia `[EVD]` (`[ref:]`, `[empirical]`, `[inferred]`, `[needs-verification]`) | [`deuda-taxonomy.md`](deuda-taxonomy.md) | Activo — no migrar |
| `@status` JSDoc (valores: `en-desarrollo`, `activo`, etc.) | `docs/governance/jsdoc-standard.md` | Pendiente normalización — trabajo aparte |
| `B1`–`B4` / "Snapshot B4" (fases deprecadas) | — | Deprecado — 2 referencias pendientes de eliminación en `useSimulation.ts:15` y `UpgradeView.tsx:22` |
| `D-N` / `OQ-N` (registro de decisiones y OQs) | `docs/data/decisions.md` / `docs/governance/open-questions.md` | Nomenclatura de registro, no tags inline |
| `WEAPON_ADD_*` / tokens D-6 (upgrade tokens) | `docs/semantic/upgrade-tokens.md` | Vocabulario canónico del juego — no es nomenclatura interna del proyecto |
| `Gate` del juego ("Shield Gate", "Sol Gate") | `docs/data/schemas/abilities/` | Nombre del juego — falso positivo, no tocar |
| `DT_*` (tipos de daño) | `docs/semantic/damage-types.md` | Referencia a enums del juego — no nomenclatura interna |

---

## Extensión del vocabulario

Para agregar un nuevo valor a DOMINIO o ROL: editar este documento, sección correspondiente, con definición y fix location. No crear valores nuevos sin actualizar este doc — hacerlo reproduce exactamente el problema que esta gramática resuelve.

Para agregar un nuevo ESQUEMA bajo un ROL existente: añadir fila a la tabla "Vocabulario de ESQUEMA/ID".
