# OmniFrame — Documentación

> Builder de Warframe. Datos: fork de `warframe-items` + base de datos local enriquecida.
> Spec de migración de datos: `.kiro/specs/warframe-data-migration/`

---

## Flujo de datos del sistema

```
Canónico (@wfcd/items, wiki.warframe.com)
    ↓
generate-data.mjs          ← normalización de formato (build time)
    ↓
Override (ability-stats.json, futuros gaps)
    ↓
JSON estático limpio       ← weapons.json, warframes.json, mods.json
    ↓
types.ts                   ← solo tipos de datos, sin conveniencias de UI
    ↓
Lógica (Builder, cálculo, filtrado)   ←→   Traducción (i18n, iconos)
    ↓
UI (solo renderiza, no procesa ni convierte)
```

---

## Cómo leer esta documentación

Orden de lectura recomendado para un desarrollador nuevo:

1. `architecture/architecture.md` — diseño de capas y principios
2. `architecture/architecture-audit.md` — estado actual de implementación
3. `architecture/data-audit.md` — estado de datos y SSoT
4. `decisions/open-questions.md` — qué está pendiente de decidir

Para trabajar en habilidades específicamente:

5. `canonical/ability-engine-variables.md` — variables del engine y fórmulas
6. `canonical/ability-stat-schema.md` — schema de datos definitivo
7. `canonical/semantic-md-format.md` — formato del pipeline semántico

---

## Propósito de cada carpeta

| Carpeta | Propósito |
|---|---|
| `canonical/` | Datos ya extraídos de fuentes externas (wiki, Public Export). No requieren fetch. Son la referencia directa para el agente. |
| `analysis/` | Análisis de fuentes de datos, gaps, auditorías. Algunos son históricos (referencia), otros activos. |
| `architecture/` | Diseño del sistema, estado de implementación, deuda técnica. |
| `decisions/` | Decisiones tomadas y preguntas abiertas. Registro canónico de por qué las cosas son como son. |

---

## Documentos activos

### canonical/ — Datos extraídos de fuentes externas

Datos canónicos ya extraídos y contextualizados para evitar fetch repetido a la wiki.
Son la referencia directa para el agente — no requieren consultar fuentes externas.

| Documento | Contenido |
|---|---|
| `canonical/ability-engine-variables.md` | Variables del engine (STR/DUR/RNG/EFF), fórmulas de energía, coherencia con upgradeTypes de mods |
| `canonical/ability-stat-schema.md` | Schema definitivo de AbilityStatValue y AbilityGroup con ejemplos |
| `canonical/semantic-md-format.md` | Formato de los .md semánticos, reglas de labels/valores, output del parser |

### analysis/ — Fuentes de datos y gaps

| Documento | Estado | Descripción |
|---|---|---|
| `analysis/ability-stats-gap.md` | ✅ activo | Checklist de Warframes pendientes de carga manual en ability-stats.json |
| `analysis/ability-stats-data-source.md` | 📚 referencia | Fuentes y metodología para stats de habilidades — ya implementada |
| `analysis/wiki-modules-reference.md` | 📚 referencia | Lista de módulos Lua disponibles en wiki.warframe.com |
| `analysis/weapon-data-analysis.md` | 📚 referencia | Análisis exhaustivo de estructura de weapons en @wfcd/items — APLICADO ✓ |

### architecture/ — Diseño del sistema

| Documento | Estado | Descripción |
|---|---|---|
| `architecture/architecture.md` | ✅ activo | Diseño de capas, flujo de datos, principios del proyecto |
| `architecture/architecture-audit.md` | ✅ activo | Estado actual de implementación y deuda técnica DT-1 a DT-13 |
| `architecture/data-audit.md` | ✅ activo | Estado de datos y SSoT por entidad |
| `architecture/mods-analysis.md` | ✅ activo | Análisis de implementación de mods y motor de cálculo |
| `architecture/mod-stats-gap.md` | ✅ activo | Schema del override mod-stats.json y gaps de levelStats |
| `architecture/warframe-items-changes.md` | ✅ activo | Registro de cambios en el fork de warframe-items |
| `architecture/warframe-items-pipeline.md` | 📚 referencia | Pipeline del fork: cómo se generan los JSON desde la wiki |
| `architecture/modifier-taxonomy.md` | 📚 referencia | Diseño de tipos AbilityScaling y ModModifier — implementado ✓ |

### decisions/ — Decisiones y preguntas abiertas

| Documento | Estado | Descripción |
|---|---|---|
| `decisions/open-questions.md` | ✅ activo | Registro canónico de preguntas abiertas y gaps de documentación |
| `decisions/mods-builder-analysis.md` | ✅ activo | Análisis canónico de upgradeTypes + Q1-Q5 del builder de mods |

---

## Documentos de referencia

Los documentos de referencia capturan análisis o decisiones históricas ya implementadas.
Se conservan para contexto pero no se actualizan.

| Documento | Descripción |
|---|---|
| `analysis/ability-stats-data-source.md` | Fuentes y metodología para stats de habilidades |
| `analysis/wiki-modules-reference.md` | Lista de módulos Lua disponibles en wiki.warframe.com |
| `analysis/weapon-data-analysis.md` | Análisis exhaustivo de estructura de weapons — APLICADO ✓ |
| `architecture/warframe-items-pipeline.md` | Pipeline del fork: cómo se generan los JSON desde la wiki |
| `architecture/modifier-taxonomy.md` | Diseño de tipos AbilityScaling y ModModifier — implementado ✓ |

---

## Cómo contribuir

### Añadir un documento nuevo
1. Determinar el área: ¿análisis de datos? → `analysis/`. ¿Diseño del sistema? → `architecture/`. ¿Decisión o pregunta? → `decisions/`.
2. Crear el archivo con encabezado de estado: `> Estado: activo | referencia | temporal`
3. Añadir entrada en este README.md antes de considerar el documento oficial.
4. Si el documento responde a una pregunta en `decisions/open-questions.md`, actualizar esa entrada.

### Actualizar un documento existente
1. Actualizar la fecha de última actualización en el encabezado.
2. Si el estado cambia (activo → referencia), actualizar el README.md.

### Archivar un documento
1. Mover a `decisions/open-questions.md` una nota de qué fue archivado y por qué.
2. Eliminar el archivo y su entrada en README.md.
3. No usar `Docs/temp/` — crear directamente en el área destino con estado `temporal`.
