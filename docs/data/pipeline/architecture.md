---
Estado: "activo"
Rol: "Arquitectura del pipeline de datos: flujo, modelo de 4 pilares y build pipeline"
Impacto_ID: "D-Pipeline-Arch"
Fidelidad_Fisica: "Project/scripts/"
Fecha_de_creacion: "2026-03-21"
Fecha_de_actualizacion: "2026-07-22"
---

# Pipeline — Arquitectura

## 1. Flujo del dato

```text
fuente canónica (Public Export → warframe-items → omniframe-items)
  → build pipeline (generate-data.ts, normalización)
  → overrides (manual SSoT en public/data/*.override.json)
  → JSON estático (Project/public/data/*.json)
  → tipado (shared/types/*)
  → carga + hidratación (puerto "0" → DataRegistry)
  → UI (domains/*)
```

Trail concreto en código:

```
@wfcd/items (crudo) + cosecha wiki de omniframe-items
  → generate-data.ts (orquesta normalization/* + pipeline/runtime-data-artifacts.ts)
  → JSON (public/data/*.json) + overrides (public/data/*.override.json)
  → puerto "0" DataSource (BrowserAdapter fetch / NodeAdapter fs; instancia compartida browserSource)
      ├→ DataRegistry (cache + hidratación display + merge de overrides)
      │     → useItems (shared/hooks/data/) → useItemsFilters (domains/equipment/hooks/) → UI
      └→ loadEngineData → engine (StaticHydrator)
```

El puerto "0" (`DataSource`) es el único seam que varía por runtime; alimenta **dos**
consumidores desde la misma instancia cacheada (`browserSource`): display vía `DataRegistry`
y el motor vía `loadEngineData`. Detalle del puerto y sus decisiones en OQ-DATA-9 / `DC-OQ-DATA-12`.

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

### Audit reports — tracking de sincronización fuente↔override

`generate-data.ts` produce `Project/data/audits/source-change-report.json` (baseline **committeado**; el resto de `Project/data/` es local, gitignored). Por cada ítem generado captura:

- **`lastSourceUpdate.versionTag`** — la versión del último parche del ítem, extraída de sus `patchlogs` (`"Update 40.2"` → `"40.2"`) = *cuándo tocó el juego este ítem por última vez*.
- **`sourceFingerprint`** — hash sha256 del contenido canónico → detecta cambios de valor (independiente del formato de escritura).
- **`delta`** entre el run anterior y el actual: `newItems`, `changedFingerprint`, `changedLastSourceUpdate`, `unchangedItems`. Responde *"¿se tocó algo viejo o solo se añadió nuevo?"* — `changedFingerprint === 0 && newItems > 0` = solo altas.

**Cobertura:** el audit cubre **7 de los 8** artefactos generados (warframes, weapons, mods, arcanes, companions, archwing-weapons, vehicles). `passives.json` queda **deliberadamente fuera**: `passivesDb` es un `Record` keyed por path, no un array de ítems con `sourceFingerprint`, y no encaja en `buildAuditEntries`. Un cambio en passives **no lo detecta el delta** — punto ciego conocido y aceptado.

**Rol:** es la mitad-fuente de la detección de **staleness override↔pipeline** — cuando la fuente actualiza un ítem que tiene override manual, ese override queda sospechoso de estar viejo. El **puente a overrides no existe** aún (los `*.override.json` no llevan sello de versión) → es el gate vivo de `OQ-DATA-9`. Es **detección, no mutación**: señala qué revisar, nunca toca overrides automáticamente.

> **Formato de salida:** `writeJson` emite **pretty (2 espacios) + newline final** → regenerar produce diffs **solo-contenido**. Como `sourceFingerprint` es format-independiente (ver arriba), la elección de formato no afecta el tracking, solo la legibilidad del diff.

## Documentos relacionados

- [`ability-pipeline.md`](ability-pipeline.md) — pipeline específico de ability stats (`apply-ability-md.ts`)
- [`mods-triage.md`](mods-triage.md) — registro de rechazos del parser de mods
- [`companion-compatibility.md`](companion-compatibility.md) — semántica de `compatName` jerárquico
- [`../../domains/source/`](../../domains/source/) — las fuentes ajenas que alimentan este pipeline, y su [catálogo de gaps](../../domains/source/gaps.md)
- [`../rules/overrides.md`](../rules/overrides.md) — gobernanza del SSoT manual
