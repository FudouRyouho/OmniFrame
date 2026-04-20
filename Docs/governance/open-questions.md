---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.0.3"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-04-20"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos activos. Las preguntas cerradas han sido migradas a `closed-decisions.md`.

---

## OQ-2 - Rol del LoadoutProvider y Agnosticismo Real — **RE-ABIERTO (2026-04-20)**

**Dominio:** integración / arquitectura
**Pregunta:** ¿Debe ser el LoadoutProvider el dueño de la ejecución del Resolver o un mero gestor de estado?
**Diagnóstico de Crisis:** El Loadout hoy es un **contexto referencial**; es decir, obliga a llamar directamente a sus funciones internas. Esto viola el principio de agnosticismo y reactividad buscado. La capa del Resolver tampoco cumple con su misión de mediar de forma veraz.
**Acción:** Rediseñar hacia un modelo de **Observer** puro.
**Bloquea a:** [MAYOR] Desacoplar LoadoutProvider.

## OQ-5 - Punto de migracion de hidratacion a build time

**Dominio:** integración / data
**Pregunta:** ¿Cuándo deja de vivir la hidratación de habilidades en runtime y pasa al pipeline de build?
**Impacto:** Afecta performance del engine y fidelidad de los datos.

## OQ-12 - Definicion del contrato Backward Resolver (B4)
**Estado:** **RE-ABIERTO (2026-04-18)**
**Pregunta:** Cuál es el payload final de B4 y cómo se sincroniza la reactividad con el Loadout.
**Contexto:** El cierre anterior se declaró ambiguo. Se requiere una nueva definición tras la limpieza del código.

## OQ-13 - Frontera de calculo entre Arsenal y Builder
**Estado:** **RE-ABIERTO (2026-04-18)**
**Contexto:** Supeditado a B1-B4. Se debe discutir si el Arsenal mantiene un baseline estático o requiere una interfaz compartida con el Resolver.
