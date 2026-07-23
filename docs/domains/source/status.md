---
Estado: "activo"
Rol: "Estado operativo de las fuentes de datos ajenas: qué las alimenta, qué tan vivas están y qué hereda el proyecto"
Impacto_ID: "D-Source-Status"
Fidelidad_Fisica: "omniframe-items/"
Fecha_de_creacion: "2026-07-23"
Fecha_de_actualizacion: "2026-07-23"
---

# Source — estado de las fuentes ajenas

Este dominio documenta **el dato que no producimos**: de dónde viene, qué le falta y qué tiene mal.
Es el único lugar del corpus donde una afirmación sobre una fuente externa es normativa.

**Qué NO vive acá:** cómo estructuramos *nuestro* JSON (→ [`../../data/schemas/`](../../data/schemas/))
ni cómo el pipeline lo transforma (→ [`../../data/pipeline/`](../../data/pipeline/)). El
discriminador es a nivel-oración: si la oración describe la fuente ajena, es de este dominio; si
describe nuestra salida, no.

## 🚨 Condición de partición del dominio

**El día que `omniframe-items` sea promovido a normalizador, `source/` se parte.** Queda `source/` =
datos de entrada raw, y nace un dominio hermano (`normalization/`) = el puente entre el tipado de la
fuente y el que consume `data/*`.

Esto no es una nota de futuro: es **la costura por donde el dominio se va a cortar**, y por eso
**no se mete normalización dentro de `source/` por comodidad**. Hoy `omniframe-items` sólo cosecha y
mergea — la normalización vive en `Project/scripts/generate-data.ts`, y esa frontera se sostiene a
propósito. La promoción requiere además sacar el tipado de `@shared` a un paquete reusable; el gate
está en [`../../governance/open-questions.md`](../../governance/open-questions.md) (`OQ-DATA-16`).

## Las tres fuentes

| Fuente | Qué es | Estado | Detalle |
|---|---|---|---|
| **Public Export (DE)** | endpoint oficial de Digital Extremes; la capa-1 real de todo | vivo, versionado por hash | [`public-export.md`](public-export.md) |
| **`warframe-items` (WFCD)** | repo hermano que consume el export y lo parsea a `data/json/*` | vivo en armas/mods; **muerto en enemigos** | [`warframe-items.md`](warframe-items.md) |
| **Cosecha wiki propia** | `omniframe-items` baja módulos Lua que el export no expone | vivo, mantenido por nosotros | [`warframe-items.md`](warframe-items.md) §Cosecha |

La cadena real es `Public Export → warframe-items → omniframe-items → generate-data.ts → public/data`.
Las dos primeras son ajenas; las dos últimas son nuestras.

## Lo que hay que saber antes de tocar datos

1. **La fuente no es un contrato.** DE advierte que el export *"does not necessarily represent the
   current and future state of the game"*. Que un endpoint desaparezca es un modo de falla previsto
   — ya pasó con los enemigos.
2. **`warframe-items` no tiene versión citable** (`package.json` dice `0.0.0-dev`). Por eso el
   catálogo de gaps ancla cada entrada a una **prueba de reproducción**, no a un hash: el comando
   dice si el bug sigue vivo; un hash sólo dice cuándo lo vimos.
3. **Un gap de la fuente no se arregla en la fuente.** No controlamos WFCD ni DE. La mitigación
   siempre es nuestra: cosecha propia, override manual, o corrección en el raw propio.

## Catálogo de gaps

El corazón del dominio: [`gaps.md`](gaps.md) — cada gap con síntoma, alcance medido, cómo
reproducirlo, qué impacto tiene acá hoy y qué lo mitiga.
