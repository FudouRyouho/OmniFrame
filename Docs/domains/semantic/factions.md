---
Estado: "en revision"
Rol: "Documentar el estado de las facciones en el proyecto"
Version: "v0.0.2"
Impacto_ID: "S-Factions"
Fidelidad_Fisica: "Project/src/lib/i18n/faction-icons.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Factions — Semántica Canónica

## Estado Actual: Parche de Presentación

Actualmente, las facciones **no poseen un contrato canónico cerrado**. El sistema utiliza un mapeo de conveniencia en la capa de presentación:

- **Localización**: `Project/src/lib/i18n/faction-icons.ts`.
- **Funcionamiento**: Mapa manual de `nombre_raw` → `icono/label`.
- **Alcance**: Solo cubre el renderizado de `IconTag` en popovers de equipo.

## Estructura Pendiente

La formalización de facciones requiere la extracción semántica desde el campo genérico `tags[]`, donde actualmente conviven con otros metadatos (como "Prime" o "Vaulted"). Este proceso de estabilización del contrato `FactionType` es externo a la documentación de presentación.

## Vocabulario en el Dataset (Capa Raw)

Hasta el cierre del contrato, los consumers deben tratar los siguientes valores en `tags[]` como señales informativas y no como un contrato de tipo:
`Corpus`, `Grineer`, `Infested`, `Orokin`, `Sentient`, `Narmer`, `Murmur`, `Tenno`.
