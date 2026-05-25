---
Estado: "activo"
Rol: "Arquitectura del pipeline de datos: flujo, modelo de 4 pilares y build pipeline"
Version: "v0.2.0"
Impacto_ID: "D-Pipeline-Arch"
Fidelidad_Fisica: "Project/scripts/"
Fecha_de_creacion: "2026-03-21"
Fecha_de_actualizacion: "2026-05-25"
---

# Pipeline — Arquitectura

## 1. Flujo del dato

```text
fuente canónica (@wfcd/items + patches del fork)
  → build pipeline (generate-data.ts, normalización)
  → overrides (manual SSoT en public/data/*.override.json)
  → JSON estático (Project/public/data/*.json)
  → tipado (shared/types/*)
  → lógica y traducción (lib/*)
  → UI (domains/*)
```

Trail concreto en código:

```
warframe-items (crudo + patch)
  → runtime-data-artifacts.ts (pipeline determinista)
  → JSON (SSoT consolidado)
  → lib/*-data.ts (fetch + hydration)
  → useItems (agnóstico)
  → useOmniFilter (lógica de tags)
  → UI
```

## 2. Reglas centrales

- la normalización de **formato** ocurre en build time
- la normalización de **presentación** ocurre en runtime
- la UI no procesa ni convierte datos
- el pipeline automático NO toca overrides manuales — esos se integran en fase de resolución posterior

## 3. Modelo de 4 Pilares

Implementado y verificado en `Project/scripts/normalization/entities.ts`. Cada item del dataset es taxonomizado por 4 ejes determinísticos:

| Pilar | Significado | Materialización |
|---|---|---|
| **`domain`** | El "qué soy" — contexto de alto nivel | Mapeo prioritario de `category` sobre `productCategory` para resolver colisiones de companions modulares |
| **`kind`** | El "cómo opero" — especialización funcional | Heurística basada en `uniqueName` para diferenciar `moa`, `hound`, `pet`, `sentinel` |
| **`family`** | El "a quién me parezco" — linaje y rasgos | Inyección de tags (`robotic`, `beast`, `prime`, `kuva`, `tenet`) persistidos en el artefacto final |
| **`stats`** | El "qué tengo" — datos numéricos | Bloque `stats` normalizado para consumo por el Engine |

**Reglas:**
- El pipeline determinista puebla estos campos basándose en origen + reglas centralizadas, ignorando inconsistencias de la fuente original (`raw.category`).
- El campo `category` original se conserva **solo para trazabilidad raw**, no para lógica de negocio.

**Deuda activa:**
- Refactor del Hydrator del Engine para consumir el bloque `stats` directamente — pendiente.

## 4. Build pipeline (`generate-data.ts`)

El motor de generación (`Project/scripts/generate-data.ts`) transforma la fuente cruda de `@wfcd/items` en datasets consumibles por el Resolver.

### Responsabilidades

1. **Mapeo fiel**: respeta la estructura canónica del dataset base
2. **Normalización determinista**: convierte formatos crudos (porcentajes, snake_case) a contratos del Engine
3. **Modularización**: delega limpieza de taxonomías específicas a módulos en `Project/scripts/normalization/` (polaridad, armas, arcanos, etc.)
4. **Generación de artefactos**: produce JSON en `Project/public/data/`

### Reglas de operación

- **Desacoplamiento**: el pipeline automático NO toca `*.override.json`. Los overrides se integran posteriormente.
- **Determinismo**: no se inyecta conocimiento manual ni se completan mecánicas desde evidencia externa. Si no es derivable de la fuente, no pertenece a `generate-data`.
- **Observabilidad**: reporta valores desconocidos o gaps de normalización para asegurar integridad de datos.

### Audit reports

`generate-data.ts` produce `Project/data/audits/source-change-report.json` para tracking de cambios entre runs.

## Documentos relacionados

- [`ability-pipeline.md`](ability-pipeline.md) — pipeline específico de ability stats (`apply-ability-md.ts`)
- [`mods-triage.md`](mods-triage.md) — registro de rechazos del parser de mods
- [`companion-compatibility.md`](companion-compatibility.md) — semántica de `compatName` jerárquico
- [`../references/warframe-items-source.md`](../references/warframe-items-source.md) — el fork upstream y deltas que aporta
- [`../rules/overrides.md`](../rules/overrides.md) — gobernanza del SSoT manual
