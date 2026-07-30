# Module:Version/data — Catálogo de versiones del juego

> Fuente: `https://wiki.warframe.com/w/Module:Version/data?action=raw`
> Extraído: 2026-07-30
> Archivo raw: `version-data.lua`
> Raw: version-data.lua

---

## Para qué está acá

Es el **ancla de versión del juego**. Los raws de `wiki/` están sembrados de tags `{{ver|N}}` —**668
en 91 de 102 archivos**— y este módulo es lo que los resuelve a una fecha real. Sin él, `{{ver|40}}`
es un número opaco.

Habilita la pregunta que el proyecto va a querer hacerse: *"el juego está en la versión X; esta ley
cambió en la versión Y; nosotros la destilamos en la fecha Z — ¿implementamos contra algo que ya se
movió?"*

## Estructura

```lua
local Versions = {
  {
    Name        = "Update 43.0",
    Link        = "Update 43",
    Aliases     = { "43", "43.0", "43.0.0" },   -- lo que {{ver|43}} referencia
    ShortName   = "U43.0.0",
    Date        = "2026-06-17",
    Parent      = "43.0",
    ParentName  = "Update 43",
    ForumLink   = "...",
    ArchiveLink = "...",
    ArchiveDate = "...",
    Timestamp   = ...
  },
  ...
}
```

**3281 entradas**, desde `Vanilla` (2012-10-25) hasta la actual. La entrada `TBA` (alias `999`) es el
placeholder de lo no lanzado.

`Aliases` es el campo que importa: es el que hace el match con el `{{ver|N}}` del wikitext.

## Anclas útiles

| Versión | Fecha | Por qué importa acá |
|---|---|---|
| **43.0** | 2026-06-17 | versión más alta referenciada en el corpus — el "hoy" del juego |
| 42.0 | 2026-03-25 | |
| 41.0 | 2025-12-10 | |
| **40.0** | 2025-10-15 | la cuantización pasó de 1/16 a 1/32 (→ [`../mechanics/damage-calculation.md`](../mechanics/damage-calculation.md)) |
| **36.0** | 2024-06-18 | Damage 3.0 — resistencias por facción (→ [`../mechanics/damage-types.md`](../mechanics/damage-types.md)) |
| **27.2** | — | Warframe Revised — self-stagger, shield gating, rework de status |

## Cómo se usa

Extraer los tags de un raw:

```bash
grep -oh "{{ver|[0-9.]*}}" mechanics/<doc>.wikitext | sed 's/{{ver|//;s/}}//' | sort -u
```

Y resolver el alias contra `version-data.lua` para obtener `Date`.

> **No se anota versión por costumbre.** La mayoría de las leyes no cambian nunca y anotarlas es
> ruido. Se anota **donde el motor consume el dato** — ahí la trazabilidad se paga sola cuando salga
> un parche que toque esa mecánica.
