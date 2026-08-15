---
Estado: "referencia"
Rol: "Documentar el rol de src/shared/types/ y sus límites"
Impacto_ID: "G-Types"
Fidelidad_Fisica: "Project/src/shared/types/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-06-07"
---

# Type System Boundaries

## Regla de prioridad

El tipado compartido prioriza:
1. logica
2. mapeo
3. UI

## Lo que sí incluye

- tipos compartidos por dominio
- constantes y opciones necesarias para editores y consumidores
- re-export central desde `index.ts`

## Lo que no incluye

- conveniencias exclusivas de UI
- campos inventados que no existen en la fuente
- tipos propios del motor de builds

El vocabulario semántico canónico que respalda estos tipos vive en `../semantic/damage-types.md` y similares.
Antes de añadir un tipo nuevo a `shared/types/`, verificar si ya existe o está pendiente en el diccionario semántico.

**Decisión de implementación:** ver `DC-OQ-TYPES-1` en [`closed-decisions.md`](closed-decisions.md).

