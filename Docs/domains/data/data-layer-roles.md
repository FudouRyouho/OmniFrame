# Data Layer Roles

> Estado: activo
> Rol: definir los roles logicos de generated, override, backup, deprecated y runtime
> Fuente de verdad de: taxonomia operativa de archivos de datos del proyecto
> No usar para: detalle de una entidad concreta o backlog de migracion
> Depende de: `ssot.md`, `build-pipeline.md`, `override-pattern.md`
> Ultima actualizacion: 2026-03-22

## Objetivo

Separar con claridad:

- que datos se generan automaticamente
- que datos se completan manualmente
- que archivos son solo respaldo
- que archivos son artefactos historicos
- que archivos consume la app en runtime

Esta separacion existe para reducir carga mental y evitar que un mismo archivo parezca
al mismo tiempo:

- fuente editable
- artefacto generado
- backup
- runtime

## Roles logicos

## `generated`

Definicion:
- capa base obtenida desde fuentes primarias como `warframe-items`, wiki u otra fuente
  canonica relevante

Puede hacer:
- normalizar nombres
- transformar formatos
- cerrar gaps tecnicos deterministas
- reestructurar datos para consumo en runtime

Ejemplos validos:
- `20 -> 0.2` para crit y status
- `DT_EXPLOSION -> DT_BLAST`
- normalizacion de categorias como `MOD_TYPE_TO_CATEGORY`
- construccion de `BaseItem` y estructuras equivalentes

No puede hacer:
- agregar conocimiento manual no derivable
- mezclar evidencia manual con fuente automatica
- incorporar auditorias humanas como si fueran base generada

## `override`

Definicion:
- capa manual o auditada que cierra gaps no cubiertos por la fuente base

Puede existir para:
- cubrir datos faltantes
- enriquecer tipado o metadata que no viene de la fuente automatica
- representar conocimiento auditado desde juego, wiki manual, video, reddit o
  cualquier fuente que tenga fundamentacion suficiente para el proyecto

Ejemplos:
- stats de habilidades
- pasivas locales si la fuente automatica no basta
- mods `unique`
- datos manuales de mecanicas especiales

## `backup`

Definicion:
- snapshot historico antes de cambios relevantes

Uso:
- comparacion
- recuperacion manual
- revision puntual

No participa del flujo normal de runtime.

## `deprecated`

Definicion:
- archivo viejo, roto o superado, retenido solo para revision manual

Uso:
- evidencia historica
- referencia de transicion

No debe tratarse como fuente viva.

## `runtime`

Definicion:
- artefacto que consume la app en `Project/public/data/`

Regla:
- `runtime` no define por si solo el rol logico del contenido
- puede representar generated, override o mezcla controlada
- lo importante es que su funcion es ser consumido por la app

## Regla rectora

`generate-data` obtiene y normaliza bases.

Los overrides agregan conocimiento manual no derivable.

Esa es la frontera principal del sistema.

## Zonas actuales del repositorio

## `Project/public/data/`

Rol:
- artefacto de runtime consumido por la app

No debe interpretarse automaticamente como:
- fuente primaria
- backup
- zona de pruebas

## `Project/data/`

Rol deseado en esta fase:
- pipeline auxiliar
- fuente manual editable cuando aplique
- backups
- artefactos de auditoria o pruebas de concepto

No debe mezclarse conceptualmente con:
- runtime publicado
- generated final estable

## Clasificacion actual de archivos

Esta tabla describe el estado actual sin renombrar archivos todavia.

| Archivo | Rol logico actual | Estado |
|---|---|---|
| `Project/public/data/warframes.json` | `runtime + generated` | activo |
| `Project/public/data/weapons.json` | `runtime + generated` | activo |
| `Project/public/data/mods.json` | `runtime + generated` | activo |
| `Project/public/data/arcanes.json` | `runtime + generated` | activo |
| `Project/public/data/passives.json` | `runtime + generated` | activo |
| `Project/public/data/ability-stats.override.json` | `runtime + override` | activo |
| `Project/public/data/dev/ability-schema-test.json` | `runtime dev artifact` | auxiliar |
| `Project/data/overrides/ability-stats.override.json` | `override editable / copia transicional del runtime` | activo pero ambiguo |
| `Project/data/backups/ability-stats.backup.json` | `backup` | historico |
| `Project/data/audits/upgradeby-audit.json` | `audit artifact` | auxiliar / revisar si deprecar |
| `Project/data/overrides/mods/README.md` | `placeholder de override futuro` | referencia |

## Caso especial: `ability-stats`

Hoy `ability-stats` es una capa de override, no una base generated.

Motivo:
- depende de trabajo manual
- incorpora estructura editorial
- incorpora conocimiento no derivable automaticamente desde la fuente base

Eso no significa que solo tape "gaps".
Tambien puede ampliar o enriquecer el payload si ese enriquecimiento sigue dependiendo
de curacion manual.

## Estado actual de convivencia

Hoy conviven dos copias identicas:

- `Project/data/overrides/ability-stats.override.json`
- `Project/public/data/ability-stats.override.json`

Mientras esa duplicacion siga existiendo, hay ambiguedad operativa.

La regla documental correcta por ahora es:

- `Project/public/data/ability-stats.override.json` = copia consumida por runtime
- `Project/data/overrides/ability-stats.override.json` = copia editable/transicional a revisar

La estabilizacion posterior debera decidir:

- si `Project/data/` aloja la fuente editable canonica
- o si se mueve esa fuente a una estructura de overrides mas clara

## Lo que este documento habilita

Con esta taxonomia ya se puede:

- clasificar archivos sin moverlos todavia
- detectar que artefactos estan mezclando roles
- definir renombres futuros sin improvisacion
- explicar a agentes que puede y que no puede hacer `generate-data`
