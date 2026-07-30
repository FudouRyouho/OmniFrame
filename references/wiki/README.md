# Wiki Reference

> Estado: activo
> Rol: wiki local auditada — leyes, entidades y fuentes del juego, cada `.md` con su raw al lado
> Fuente de verdad de: reglas de captura, marca, layout y taxonomía de `references/wiki/`
> No usar para: estado del proyecto, backlog, ni modelado hacia el engine
> Última actualización: 2026-07-30

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

**Una fuente citada no es huérfana:** su dueño es el documento que la declara en `> Raw:`. Al
declararla con path se acepta tanto **relativo al documento** (`../mods/steel-fiber.wikitext`) como
**relativo a `wiki/`** (`mods/steel-fiber.wikitext`).

> Un documento que aparece en *"con raw pero sin declararlo"* no es un error: suele ser un raw que
> se bajó como fuente citada de otro documento y todavía espera su propia reconciliación. La señal
> es útil — dice "el material ya está, falta el trabajo".

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
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Movement_Speed · .../Sprint_Speed · .../Maneuvers
> Fuente actualizada: 2026-07-30
> Raw: movement-speed.wikitext · sprint-speed.wikitext · maneuvers.wikitext
```

---

## Regla — las tres fechas

Tres preguntas distintas. **Sólo las dos primeras viven en el encabezado.**

| Fecha | Pregunta | Quién la pone |
|---|---|---|
| `> Última actualización:` | ¿cuándo destilamos **nosotros**? | a mano |
| `> Fuente actualizada:` | ¿cuándo tocó la **wiki** esa página? | `--fuente`, **nunca a mano** |
| `{{ver|N}}` en el raw | ¿en qué **parche del juego** cambió la ley? | a mano, **sólo donde hace falta** |

**Fuente movida después de destilar ≠ documento incorrecto.** Prueba que **nadie miró desde
entonces** — es la única señal de drift que se obtiene sin releer la página entera. El auditor la
reporta; qué hacer con ella es criterio de quien reconcilia.

Si el doc destila varias páginas, manda **la más reciente**: basta con que una se mueva.

### El parche (`{{ver|N}}`) no se anota por costumbre

La mayoría de las leyes no cambian nunca, y ponerles versión es ruido. Se anota **donde el motor
consume el dato** — ahí la trazabilidad se paga sola el día que un parche toque esa mecánica.

Los tags ya están en los raws (**668 en 91 de 102 archivos**); resolverlos a fecha es cuestión de
cruzar el alias contra [`sources/version-data.lua`](sources/version-data.md). No hace falta pedirle
nada a la wiki.

> **Lo que NO se hace: fechar por bisección del historial de la wiki.** Es viable (`prop=revisions` +
> búsqueda binaria) y cuesta ~11 requests **por dato**, pero responde una pregunta *editorial*
> —cuándo un editor tipeó un párrafo— y no una del juego. Descartado 2026-07-30.

### La fecha de la fuente también avisa lo contrario

Sirve para detectar dos patologías opuestas, y la segunda es la que se pasa por alto:

- **fuente estancada** — `Stagger` sin tocar desde enero, coherente con su `{{UpdateMe}}`;
- **fuente demasiado fresca** — `Damage/Calculation` se editó **ocho veces en dos días, por un solo
  autor**, justo sobre la sección que destilamos. Eso no es doctrina asentada: es material en
  refinamiento, y hay que decirlo en el doc antes de que alguien lo implemente.

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

**Dos herramientas, dos objetos, sin solapamiento.**

```bash
node Project/scripts/references-layout.mjs            # layout, raw, marcas, fechas — offline
node Project/scripts/references-layout.mjs --fuente   # consulta la wiki y escribe `> Fuente actualizada:`
npm run validate:docs                                 # links, vocablo y encabezado (junto con docs/)
```

`references-layout.mjs` reporta documentos sin raw, raws sin dueño, declaraciones faltantes, marcas
mal tipadas, conflictos sin contraparte, documentos sin `> Fuente:`, y **fuentes que se movieron
después de destilarlas**.

`--fuente` es la única parte que sale a la red: agrupa los títulos de `> Fuente:` en lotes de 50 y
resuelve redirecciones. El corpus entero cuesta **una request por cada 50 páginas**.

`validate:docs` aplica a `wiki/` las reglas que comparte con `docs/`:

| Check | Severidad | Qué exige |
|---|---|---|
| `ref-link-roto` · `ref-link-absoluto` | ❌ | los links `.md` relativos resuelven. **Los bloques cercados no cuentan** — ahí un link es ejemplo de la forma, no un uso |
| `ref-vocablo` | ❌ | nada de `OQ-*`, `D-N`, `Project/src/`, `engine vN` |
| `ref-vocablo-ambiguo` | ℹ️ | `WEAPON_*` / `AVATAR_*`: la regla los prohíbe, pero **también son nombres internos del juego que la wiki publica**. Sin resolver a propósito |
| `ref-estado` | ⚠️ | `Estado` dentro del vocabulario de tiers |
| `ref-encabezado` | ❌ | **ratchet**: el nº de campos faltantes no puede subir |

**El encabezado va por ratchet, no por exigencia.** 66 documentos entraron al corpus con encabezado
incompleto —casi todos de `incarnon/`—, así que pedirlo de golpe sería inventar una campaña en vez de
validar. El baseline queda lockeado en
[`docs/governance/references-header-baseline.json`](../../docs/governance/references-header-baseline.json);
bajarlo es progreso y se relockea con `npm run validate:docs -- --update-baseline`.

`sources/` y los `README.md` están **exentos del encabezado** por la excepción ya declarada arriba.
