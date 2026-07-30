# Wiki Reference

> Estado: activo
> Rol: wiki local auditada — leyes, entidades y fuentes del juego, cada `.md` con su raw al lado
> Fuente de verdad de: reglas de captura, marca, layout y taxonomía de `references/wiki/`
> No usar para: estado del proyecto, backlog, ni modelado hacia el engine
> Última actualización: 2026-07-29

## Qué es, y qué no

Una copia **auditada y compacta** de la wiki del juego, para consultarla sin re-fetchear.

**Acá van datos, no opiniones.** Un `.md` es la estructura compacta de su raw, explicada con
conocimiento conocido y enlazada a otros documentos de `references/`. Nada más.

El criterio de autoridad: **la wiki tiene razón hasta que se demuestre lo contrario** — hasta que
choque con sus propios datos, hasta que el juego la desmienta, o hasta que quede vieja. Sin el raw
guardado no hay cómo demostrar ninguna de las tres.

---

## Regla — el raw siempre se descarga

**Sin raw no hay verificación posible.** Un `.md` sin raw contra el cual verificarse no es
reconciliable: no hay forma de saber si está completo ni si sigue siendo cierto.

Captura obligatoria con `?action=raw` — **nunca** `WebFetch` ni similares (ver `../CLAUDE.md`).

```bash
curl -sL "https://wiki.warframe.com/w/<Página>?action=raw" -o <slug>.wikitext
```

Dos figuras, según el papel del raw en el documento:

| | Qué es | ¿Exige `.md`? | Dónde vive |
|---|---|---|---|
| **Fuente principal** | la página que el `.md` destila | ✅ sí | junto a su `.md` |
| **Fuente citada** | respalda una línea o un valor suelto | ❌ no | en la categoría **de su propia página** |

Lo que se relaja para la fuente citada es el `.md`, **no el raw**. Y vive en su propia categoría, no
en la del documento que la cita: `Steel_Fiber` citado desde `mechanics/armor.md` se guarda en
`mods/steel-fiber.wikitext`. Así, el día que exista `mods/steel-fiber.md`, el raw ya está en su
lugar — el corpus crece de forma acumulativa.

**Una fuente citada no es huérfana:** su dueño es el documento que la declara en `> Raw:`.

---

## Regla — la marca

Cuando un dato de la wiki es defectuoso se **marca**. Nunca se corrige en el lugar, nunca se
sobrescribe: eso mezcla la autoridad del proyecto con la de la wiki y vuelve la fuente no confiable.

### Forma

```
⚠️ <TIPO> <flecha> <puntero>
```

**Nada más.** Sin explicación, sin análisis, sin el relato de cómo se llegó — para eso está git. La
marca aporta **qué le pasa al dato** y **dónde está lo que lo fundamenta**; el dato apuntado explica
el resto por sí solo.

| Tipo | Flecha | Significa | Estado |
|---|---|---|---|
| **Desactualizado** | `→` | el juego cambió y esta página no | resuelto: gana el dato nuevo |
| **Conflicto** | `↔` | dos lugares de la wiki dicen cosas distintas | **sin resolver** |
| **Discrepancia** | `→` | un dato comprobado desmiente a la wiki | resuelto: gana el que desmiente |
| **Ilustración propia** | `ℹ️` | ejemplo armado por el proyecto sobre una ley de la wiki | — |

El **estado no es un campo**: se deriva del tipo. No existe "conflicto resuelto" — si se resuelve,
deja de ser conflicto.

**La flecha trabaja.** `→` es unidireccional: hay ganador, y apunta del dato malo al bueno. `↔` es
bidireccional y **obliga a que el otro lado esté marcado también** — las dos marcas existen o no
existe ninguna. Sin eso, quien entre por el lado sin marcar no se entera de que está parado sobre un
dato en disputa, y el conflicto es justo el tipo más difícil de replicar por cuenta propia.

**La marca va pegada a lo que afecta**, no en el encabezado. El alcance se resuelve por ubicación,
no por texto: si el defecto está en una tabla de ejemplos, la marca va sobre esa tabla.

### Quién puede marcar

Sólo con uno de los tres fundamentos. **Un agente que "cree" que un dato está mal no tiene autoridad
para marcarlo** — abre una nota en `.working/`. Un caso que no encaja en ningún tipo **se deja sin
marcar**: forzar el tipo sobreestima la evidencia.

### Ejemplos

```markdown
> ⚠️ Desactualizado → https://wiki.warframe.com/w/Steel_Fiber (patch history)

> ⚠️ Conflicto ↔ [`enemy-level-scaling.md`](enemy-level-scaling.md) §EHP

> ⚠️ Discrepancia → [`../../ingame-tests/double-dip.md`](../../ingame-tests/double-dip.md)

> ℹ️ Ilustración propia. La ley y los valores son de la wiki; el armado del caso, no.
```

La contraparte de una discrepancia se declara del lado del test: `> Corrige: wiki/mechanics/<doc>.md`.

---

## Regla — sin vocablo del proyecto

Un `.md` de `wiki/` no lleva tokens (`WEAPON_*`, `AVATAR_*`), operaciones internas, `D-N`, `OQ-*`,
rutas a `Project/src/*` ni "engine vN". Si los lleva, queda stale cada vez que `docs/` cambia.

El modelado hacia el engine vive en `docs/`, no acá. Un documento de wiki explica **cómo funciona la
mecánica del juego** — no qué implicación tiene para el motor.

**Contenido que no viene de la wiki no se queda.** Sale de `references/wiki/` y se preserva en
`.working/` con su procedencia de git, para rutearlo después (a `docs/`, a `ingame-tests/`, o al
descarte). **Nunca se borra en silencio**: "no encuentro la fuente en *esta* página" no autoriza a
purgar — puede estar en la página de la entidad y no en la de la mecánica.

Excepción única: `game-ui/`, por composición del pipeline (ver `../CLAUDE.md`).

---

## Layout y nombres

**Plano, el raw como hermano del `.md`.**

```
mechanics/
    armor.md
    armor.wikitext              ← fuente principal
    movement-speed.md
    movement-speed.wikitext
    sprint-speed.wikitext       ← las otras páginas que ese doc destila
    maneuvers.wikitext
```

- **El raw conserva el nombre de *su* página**, no el del documento que lo usa. Es lo único que
  permite re-descargarla y comparar.
- **`kebab-minúscula` siempre.** El nombre de archivo es un slug del nombre **real** de la página;
  el título exacto vive en `> Fuente:`. Nada de prefijos desambiguadores nuestros:
  `melee-afflictions.md`, no `arcane-melee-afflictions.md`.
- **Sin carpeta-por-documento.** Un directorio con sólo `x.md` + `x.wikitext` repite el nombre y no
  agrupa nada. Donde hay jerarquía (`warframes/<warframe>/`) la impone el dominio, no esta regla.
- **Sin árbol espejo `raw/`.** Obliga a replicar cada nivel, y cada cambio estructural pasa a ser dos
  operaciones que pueden desincronizarse. Con el raw al lado, el documento se mueve como un conjunto.

### Encabezado obligatorio

El vínculo `md ↔ raw` se **declara**; no se infiere del nombre de archivo (ya falló con un plural,
con un raw sin dueño y con documentos de varias páginas):

```markdown
> Estado: activo
> Rol: …
> Fuente de verdad de: …
> No usar para: …
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Movement_Speed · .../Sprint_Speed · .../Maneuvers
> Raw: movement-speed.wikitext · sprint-speed.wikitext · maneuvers.wikitext
```

---

## Estructura — el eje es *qué es la unidad documentada*

| Naturaleza | Directorios |
|---|---|
| una **ley** del juego — cómo se computa algo | `mechanics/` |
| una **entidad** — algo que existe y tiene stats | `warframes/` · `arcanes/` · `mods/` · `incarnon/` · `archon-shards/` |
| una **fuente de datos** — de dónde viene el dato, no qué dice el juego | `sources/` |

- **El tema manda sobre la mecánica.** Un arcano va en `arcanes/` por más rara que sea su mecánica.
  Que un documento explique algo particular no lo convierte en "mecánica general".
- **No existe un directorio "sistemas".** Su criterio era el *volumen*, y el volumen no es una
  naturaleza. Incarnon y Archon Shards son entidades: una Incarnon Genesis es un ítem con perks.
- **`warframes/<warframe>/`** es el único con jerarquía, impuesta por el dominio.
- **`sources/`** queda **fuera de estas reglas** por ahora: son módulos Lua y export, no páginas de
  wiki destilables. Excepción declarada, a organizar aparte.
- Un directorio nuevo se abre cuando aparece la entidad, no antes.

---

## Relación con el engine

La referencia informa al engine; no decide su contrato. Cuando una mecánica impacta el modelado:

1. se documenta acá — **sólo la mecánica del juego**
2. se evalúa en `docs/domains/engine/status.md`
3. si cambia arquitectura o política, se registra en `docs/governance/`

## Auditoría

```bash
node Project/scripts/references-layout.mjs
```

Reporta documentos sin raw, raws sin dueño y declaraciones faltantes.
