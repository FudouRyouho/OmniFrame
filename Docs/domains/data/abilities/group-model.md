---
Estado: "activo"
Rol: "Documentar cómo se modelan grupos, modos y secciones dentro de una habilidad"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Groups"
Fidelidad_Fisica: "Project/src/lib/types/ability.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Ability Group Model

> **[GAP-4]** Las pasivas de warframe no tienen modelo
> estable en `groups[]`. Las pasivas son fuente de condiciones transversales (ejemplo: Frost).
> Hasta que las pasivas tengan schema, el diseño del vocabulario canónico de condiciones
> está incompleto.

## Regla base

Toda habilidad migrada al contrato objetivo se representa con `groups[]`.

- sin `id`: grupo base, siempre activo, sin header obligatorio
- con `id`: grupo seleccionable o activable

## Campos relevantes

| Campo | Rol |
|---|---|
| `id` | identidad del grupo toggleable |
| `label` | etiqueta visible si difiere del id |
| `defaultActive` | estado inicial sugerido |
| `exclusive` | indica si los grupos son excluyentes (Equinox) o coexistentes (Wisp) |
| `stats` | stats contenidos por el grupo |

## Casos canonicos

- warframe simple: un solo grupo base
- Chroma: grupos exclusivos por elemento
- Equinox: grupos exclusivos por forma
- Wisp: grupos aditivos por mote

## Regla de separacion

El schema solo declara que grupos existen. La decision de si el estado es local,
global o sincronizado entre cards pertenece a la UI o a la capa de integracion.

## Limites actuales

- augments que inyectan grupos siguen siendo decision de integracion
- pasivas no tienen aun modelo estable dentro de `groups[]`
- falta validar mas casos con `Val2` o `Val3` en display real
