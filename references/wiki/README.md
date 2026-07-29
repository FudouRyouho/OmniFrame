# Wiki Reference

> Estado: activo
> Rol: alojar referencia profunda de mecanicas del juego necesarias para el engine
> Fuente de verdad de: taxonomia de documentacion tecnica basada en la wiki
> No usar para: estado del proyecto o backlog de implementacion
> Ultima actualizacion: 2026-03-28

## Objetivo

Este espacio existe para documentar como funcionan matematicamente las mecanicas del
juego cuando el builder necesite modelarlas.

Ejemplos:
- status effects
- damage types
- armor and health interactions
- Condition Overload
- ability formulas y scaling
- dots y procs
- crit formulas
- faction modifiers

## Regla editorial

Cada documento de wiki debe responder:

```text
Como funciona esta mecanica del juego y que implicacion tiene para el engine
```

## Regla durable — el raw vive junto a su `.md`

`wiki/` es **wiki local auditada**, no documentación: un `.md` es la **estructura compacta de su
raw**, explicada con conocimiento conocido y enlazada a otros documentos de `references/*`. De ahí
el criterio operativo: **sin raw, un `.md` no es reconciliable** — no hay contra qué verificarlo, ni
forma de saber si está completo o si sigue siendo cierto.

Y el criterio de autoridad: la wiki tiene razón **hasta que se demuestra lo contrario, o hasta que
choca con sus propios datos** (ya pasó: tres fórmulas de DR de armor en conflicto). Sin el raw
guardado no hay cómo mostrar la contradicción.

**Layout: plano, el raw como hermano del `.md`.**

```
mechanics/
    armor.md
    armor.wikitext
    movement-speed.md
    movement-speed.wikitext     ← el raw de su página homónima
    sprint-speed.wikitext       ← los otros dos raw que ese mismo doc destila
    maneuvers.wikitext
```

El raw conserva el nombre de **su** página de wiki: es lo único que permite re-descargarla y
comparar. En el caso 1:1 —la mayoría— coincide con el nombre del doc; cuando un documento destila
varias páginas, cada raw mantiene el suyo y el vínculo lo declara el encabezado (abajo).

**Nada de carpeta-por-documento.** Un directorio que sólo contiene `x.md` + `x.wikitext` repite el
nombre y no agrupa nada — la carpeta se justifica cuando hay *más* material por documento, y ese no
es el caso. Donde sí hay jerarquía (`warframes/<warframe>/`) es porque la impone el **dominio**, no
esta regla.

**Nombres en `kebab-minúscula`, siempre.** Contrato uniforme, sin excepciones por directorio: el
nombre de archivo es un **slug**, no el título. El título exacto de la página vive en `> Fuente:`,
que es donde importa. Y el slug es del nombre **real** de la página: `melee-afflictions.md`, no
`arcane-melee-afflictions.md` — el prefijo desambiguador que agregamos nosotros es vocablo del
proyecto metido en el nombre de archivo.

**Por qué hermanos y no en un árbol espejo `raw/`.** Un espejo funciona mientras la estructura es
plana; en cuanto hay jerarquía obliga a replicar cada nivel, y **cada cambio estructural pasa a ser
dos operaciones que pueden desincronizarse**. Con el raw al lado, el documento se mueve como un
conjunto: doc, evidencia y procedencia viajan juntos. No se arrastra el layout viejo por estar "bien
hoy": la regla existe para que ningún `.md` quede huérfano ni ningún raw quede desconectado del
conocimiento que lo explica.

**El tema manda sobre la mecánica.** Un arcano va en `arcanes/` por más particular que sea su
mecánica; una habilidad de warframe en `warframes/<warframe>/`. Que un documento explique algo raro
no lo convierte en "mecánica general".

**Encabezado obligatorio — la declaración, no la coincidencia de nombres.** El vínculo `md ↔ raw`
se declara; no se infiere del nombre de archivo (ya falló con un plural, con un raw sin dueño y con
el caso de varias páginas por documento):

```markdown
> Fuente: https://wiki.warframe.com/w/Movement_Speed · .../Sprint_Speed · .../Maneuvers
> Raw: movement-speed.wikitext · sprint-speed.wikitext · maneuvers.wikitext
> Capturado: 2026-07-29
```

## Regla durable — sin vocablo del proyecto

`wiki/` es la **wiki local pura**: fuente de consulta estable para no re-fetchear la wiki del juego.
No debe contener vocablo del proyecto (tokens `WEAPON_*`/`AVATAR_*`, ops `ADD`/`ADD_FLAT`, "engine vN",
`D-N`, `OQ-*`, refs a `Project/src/*.ts`) — si lo tiene, queda stale cada vez que `docs/` cambia. El
modelado/mapeo a tokens vive en `docs/` (`upgrade-tokens.md`, `gap-map.md`, OQ), no acá. Excepción única:
`game-ui/` (por composición del pipeline, ver `references/CLAUDE.md`). Si aparece vocablo en un `.md`
nuevo de `wiki/` → flag a notificar y corregir.

## Estructura — el eje es *qué es la unidad documentada*

| Naturaleza | Directorios |
|---|---|
| una **ley** del juego — cómo se computa algo | `mechanics/` |
| una **entidad** del juego — algo que existe y tiene stats | `warframes/` · `arcanes/` · `mods/` · `incarnon/` · `archon-shards/` |
| una **fuente de datos** — de dónde viene el dato, no qué dice el juego | `sources/` |

`warframes/<warframe>/` es el único con jerarquía, y la impone el dominio: una pasiva y una
habilidad son del mismo warframe y se leen juntas.

**No existe un directorio "sistemas".** Su criterio era el *volumen* ("sistemas con muchas páginas
o tablas"), y el volumen no es una naturaleza: no hay línea que diga cuándo una mecánica que crece
deja de ser mecánica. Incarnon y Archon Shards son **entidades** — una Incarnon Genesis es un ítem
con perks, no un sistema abstracto.

`sources/` es hoy casi todo módulos Lua de la wiki, pero la regla es por naturaleza: cualquier
fuente nueva cae ahí. Si algún día justifica subdivisión interna, se decide entonces.

Un directorio nuevo se abre cuando aparece la entidad, no antes.

## Relacion con el engine

La referencia wiki informa al engine, pero no decide por si sola el contrato del
proyecto. Cuando una mecanica impacta el builder:

1. se documenta en `reference/wiki/`
2. se evalua en `features/builder-engine/status.md` y en la documentacion local vigente del track
3. si cambia arquitectura o policy, se registra en `decisions/`
