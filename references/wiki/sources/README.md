# `sources/` — de dónde viene el dato

> Estado: activo
> Rol: inventario de los módulos Lua y capturas de fuente que la wiki publica, con quién destila cada uno
> Fuente de verdad de: qué hay capturado acá, qué tan vivo está y quién es su dueño
> No usar para: qué dice el juego (eso está en `mechanics/` y en los directorios de entidad) ni para
> el estado del pipeline del proyecto (→ `docs/domains/source/`)
> Última actualización: 2026-07-31

Los demás directorios de `wiki/` destilan **páginas**. Acá viven las **fuentes de datos** que la wiki
publica como módulos Lua ejecutables o como captura de un endpoint. La diferencia importa: una página
se escribe, un módulo **se corre**. Cuando los dos existen y no coinciden, el módulo describe lo que la
wiki realmente produce.

Por eso `sources/` está **fuera del régimen de layout** del resto del corpus
([`../README.md`](../README.md) §Ruteo — excepción declarada). Sus `.md` no llevan el encabezado de
siete campos: llevan `> Fuente:` · `> Fuente actualizada:` · `> Extraído:` · `> Raw:`.

## Inventario

| Módulo | Raw | Destilado en | Fuente actualizada |
|---|---|---|---|
| `Module:Enemies/infobox` | `enemies-infobox.lua` | [`enemies-infobox.md`](enemies-infobox.md) | 2026-06-25 🟢 |
| `Module:Enemies/data` | `enemies-data.lua` | ídem *(fuente citada)* | 2026-04-09 🟢 |
| `Module:Version/data` | `version-data.lua` | [`version-data.md`](version-data.md) | 2026-07-17 🟢 |
| `Module:DamageTypes/data` | `damage-types-data.lua` | [`damage-types-data.md`](damage-types-data.md) | 2026-07-04 🟢 |
| `Module:TextIcons/data` | `text-icons-data.lua` | [`text-icons-data.md`](text-icons-data.md) | 2026-05-26 🟢 |
| `Module:TextIcons` | `text-icons.lua` | ídem *(renderer, fuente citada)* | — |
| `Module:Ability/data/stats` | `ability-data-stats.lua` | [`ability-data-stats.md`](ability-data-stats.md) | **2022-07-01** 🔴 |
| `Module:Maximization/data` | `maximization-data.lua` | [`maximization-data.md`](maximization-data.md) | **2021-12-07** 🔴 |
| `Module:Mods/data` | `mods-data.lua` | **sin destilar** — ver abajo | 2026-07-21 🟢 |
| `Module:Weapons/data` | `weapons-data.lua` | *(router, fuente citada)* | 2026-06-30 🟢 |
| `Module:Weapons/data/primary` | `weapons-data-primary.lua` | [`docs/domains/source/wiki-modules.md`](../../../docs/domains/source/wiki-modules.md) | 2026-07-22 🟢 |
| `Module:Weapons/data/secondary` | `weapons-data-secondary.lua` | ídem | 2026-07-22 🟢 |
| `Module:Weapons/data/modular` | `weapons-data-modular.lua` | ídem | 2026-06-24 🟢 |
| `Module:Weapons/data/companion` | `weapons-data-companion.lua` | ídem | 2026-07-22 🟢 |
| Public Export (DE) | `public-export.wikitext` | **sin destilar** — ver abajo | — |

### Los dos congelados son los de habilidades

`Maximization/data` no se toca desde **2021-05** y `Ability/data/stats` desde **2022-07**. Cuando el
primero se congeló el juego iba por Hotfix 30.2.2; hoy va por 43.0.8 — **302 versiones después**,
incluido el rework completo a Damage 3.0.

**No es casualidad temática: el corte es específico de habilidades.** Los otros módulos siguen
mantenidos. Un módulo Lua sirve como **pista a verificar** contra la página vigente, nunca como censo —
y estos dos, ni siquiera como pista sin contrastar.

### Los que no llevan `.md` propio

El discriminador no es "tiene `.md` o no" sino **si alguien declara qué se le pide**. Un raw huérfano
—capturado por si acaso, sin dueño— es deuda; un raw **citado** por un documento que declara su uso
está completo sin `.md` hermano.

- **`weapons-data-*.lua` (644 KB, 4 particiones + router)** — el dueño vive **del lado del proyecto**,
  en [`docs/domains/source/wiki-modules.md`](../../../docs/domains/source/wiki-modules.md), por el
  mismo criterio que `public-export.wikitext`: lo que hay que escribir no es *qué dice la wiki* (el
  módulo es dato crudo, se lee solo) sino **qué le pedimos**. No se destila a `.md` a propósito — su
  contenido es una tabla de números por arma, no prosa que perder.
- **`mods-data.lua` (930 KB)** — capturado, sin `.md` y **sin consumidor conocido**. Éste sí es un raw
  sin dueño: nadie declara qué se le pide. Antes de apoyarse en él hay que escribirlo.
- **`public-export.wikitext`** — captura de la página que documenta el endpoint de DE. Su análisis vive
  en `docs/domains/source/public-export.md`, del lado del proyecto, porque describe **cómo lo
  consumimos**, no qué dice la wiki.

## El agujero conocido de este directorio

`sources/` está **exento del régimen de fechas**, y eso escondió durante años que dos de sus módulos
estaban muertos. Los `.md` ya declaran su `> Fuente actualizada:` real —a mano, porque `--fuente` no
recorre este directorio— pero **la detección automática de fuente estancada no existe**.

El corpus nombra la patología ([`../README.md`](../README.md) §Las tres fechas, *"fuente estancada"*)
sin medirla. Y la señal correcta es la **inversa** de la que el auditor ya tiene: no que la fuente se
haya movido después de destilar, sino que **no se mueve hace años**.

## Cómo se captura

```bash
curl -sL "https://wiki.warframe.com/w/Module:<Nombre>?action=raw" -o <nombre>.lua
```

Nunca `WebFetch` ni equivalentes: procesan el contenido a través de un modelo intermedio que resume
según su propio criterio, y ya causó pérdida estructural confirmada
([`../../CLAUDE.md`](../../CLAUDE.md) §Captura de páginas).

La última edición real de un módulo se consulta aparte — el archivo no la lleva adentro:

```bash
curl -sL "https://wiki.warframe.com/api.php?action=query&format=json\
&prop=revisions&rvprop=timestamp|user|comment&titles=Module:<Nombre>"
```
