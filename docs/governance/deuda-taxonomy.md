---
Estado: "referencia"
Rol: "Convención de clasificación para ítems de deuda técnica — etiquetas de capa y evidencia"
Impacto_ID: "G-Deuda"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-05-31"
Fecha_de_actualizacion: "2026-06-01"
---

# Deuda Taxonomy — Clasificación de Ítems de Deuda

## El problema que resuelve

OmniFrame cruza múltiples fuentes (wiki, `@wfcd/items`, game-ui refs, testing empírico) y múltiples capas técnicas. Sin clasificación explícita, los ítems de deuda acumulan dos problemas:

1. **Ambigüedad de capa**: no está claro si el fix va en `modifier.ts`, en el override JSON, en el pipeline, o en el engine.
2. **Ambigüedad de evidencia**: no está claro si una afirmación sobre mecánicas del juego tiene respaldo documental o es conocimiento tácito del usuario.

Esta convención resuelve ambos con dos ejes: **[CAPA]** y **[EVD]**.

> **Eje 1** adopta la [gramática facetada](nomenclature-grammar.md) del proyecto (`DOMINIO:ROL`).
> **Eje 2** ([EVD]) es ortogonal e independiente — su formato no cambia.

---

## Eje 1 — Etiqueta de capa (gramática `DOMINIO:debt`)

Indica **dónde vive el fix** y qué se desbloquea al resolverlo.

| Tag | Qué significa | Fix location | Desbloquea |
|---|---|---|---|
| `semantic:debt` | Vocabulario faltante — token no existe en `modifier.ts` o `conditions.md` | `docs/semantic/` + `modifier.ts` | DATA mapping, ENGINE use |
| `data:debt` | Cobertura faltante — vocabulario existe pero la entrada en el override no está mapeada | `Project/public/data/*.override.json` | ENGINE use |
| `pipeline:debt` | Gap de pipeline — campo perdido o mal generado en `generate-data.ts` / `runtime-data-artifacts.ts` | `Project/scripts/pipeline/` | DATA quality |
| `engine:debt` | Mecánica no implementada en la simulación | `Project/src/core/engine/` | Feature real |
| `data:debt:schema` | Contrato JSON o tipo TypeScript no definido | `docs/data/schemas/` + `*.schema.json` | DATA + ENGINE |

### Cadena de dependencia

```
semantic:debt → data:debt → engine:debt
pipeline:debt ──────────────────────────→ (DATA quality)
data:debt:schema → data:debt → engine:debt
```

Un ítem puede tener múltiples tags si bloquea varias capas simultáneamente.  
Ejemplo: `AVATAR_DAMAGE_POWER_MULTIPLIER` es `semantic:debt data:debt` — falta el token (SEM) y las entradas del override no están mapeadas (DATA).

---

## Eje 2 — Calidad de evidencia

Indica **qué respalda la afirmación** sobre la mecánica del juego.

| Tag | Qué significa | Cuándo usar |
|---|---|---|
| `[ref: ruta]` | Respaldado por un documento de referencia interno | Existe un `.md` en `references/wiki/` o `docs/data/` que documenta la mecánica |
| `[empirical]` | Verificado empíricamente — probado en el juego por el usuario | No hay doc formal pero el comportamiento fue observado/testeado directamente |
| `[inferred]` | Inferencia lógica a partir de mecánicas análogas | Nunca fue verificado directamente; requiere confirmación antes de implementar en engine |
| `[needs-verification]` | Ni documentado ni testeado — conocimiento nominal o de segunda mano | Cuando existe dudas reales sobre el comportamiento |

### Regla de escalación de evidencia

- `[inferred]` o `[needs-verification]` → **no se puede usar para implementar engine** hasta elevarlo a `[ref]` o `[empirical]`.
- `[empirical]` → válido para implementar, pero se **debe** crear un documento de referencia antes del merge si el comportamiento es complejo.
- `[ref]` → puede implementarse directamente.

---

## Formato de uso

En cualquier lista de deuda (en cualquier `.md` del repo):

```
- semantic:debt data:debt `TOKEN_NAME` — descripción del gap [empirical]
- pipeline:debt campo `conclave` perdido en `GeneratedMod` [ref: @wfcd/items API]
- engine:debt profile switching no implementado — ver OQ-ENGINE-2 [ref: docs/domains/engine/engine-audit.md]
```

Si el ítem tiene referencia: `[ref: ruta/relativa/al/doc]`  
Si no tiene referencia pero fue testeado: `[empirical]`  
Si es inferencia: `[inferred]` — marcar como bloqueo para engine hasta verificar

---

## Regla anti "trust-me-bro"

Si un ítem de deuda describe comportamiento de juego y **no tiene ninguna etiqueta de evidencia**, se considera `[needs-verification]` por defecto.

Antes de implementar cualquier mecánica en el engine, el ítem debe tener al menos `[empirical]` o `[ref]`. "Lo sé porque juego" es suficiente para anotar la deuda, pero no para implementarla — necesita al menos un test documentado o una referencia de wiki.
