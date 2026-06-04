---
Estado: "referencia"
Rol: "Definir la gobernanza de los datos mantenidos manualmente"
Version: "v0.0.5"
Impacto_ID: "D-Overrides"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-06-04 (v0.0.5)"
Dependencias:
  - "docs/data/rules/ssot.md"
---

# Override Pattern (Manual Intel)

## El Modelo de Inteligencia Manual

En OmniFrame, los "overrides" no son parches temporales; son el repositorio de la inteligencia del proyecto. Debido a la baja fidelidad de las fuentes externas, el conocimiento auditado vive en estos archivos.

```text
Project/public/data/ (Editable Manual SSoT)
  -> Commit Git
  -> Runtime (DataLoader singleton — carga y merge en memoria)

generate-data.ts produce SOLO datos de fuente externa (@wfcd/items).
Los overrides los gestiona el usuario, agentes o scripts dedicados (apply-ability-md.ts, etc.).
El pipeline no toca los overrides.
```

## Reglas de Oro

1.  **SSoT Manual**: Los archivos `.override.json` en `public/data/` son la fuente definitiva de inteligencia manual.
2.  **Ruta de Trabajo Única**: Todo cambio debe realizarse físicamente en `Project/public/data/`. Se abandona cualquier plan de migración a carpetas externas para mantener la simplicidad del despliegue.
3.  **Fidelidad sobre Automatismo**: Preferimos un dato manual verificado que un dato automático desactualizado.

Para los archivos generados por pipeline:
1.  **Validar**: Asegurar que los datos del pipeline no contradigan los `.override.json`.
2.  **Prioridad**: El SSoT manual siempre sobrescribe al dato generado en runtime.
4.  **Actualizar SSoT**: Registrar la nueva fuente manual en `ssot.md`.

## Catálogo de Inteligencia

| Archivo | Contenido | Consumo actual |
|---|---|---|
| `ability-stats.override.json` | Escalado, grupos y semántica de habilidades | Runtime directo + script manual (`apply-ability-md.ts`) |
| `mod-stats.override.json` | Valores base por rango de mods | Runtime directo (ModRepository) |
| `incarnon-evolutions.override.json` | Evolutions de incarnon genesis | Runtime directo (IncarnonRepository) |
| `weapon-stats.override.json` | Multishot por perfil de ataque | Runtime directo (ItemRepository) |
| `passives.json` | Definiciones de pasivas (no existen en la API) | Runtime directo |

⚠️ El modelo de consumo tiene dirección elegida: todos los overrides serán consumidos por un DataLoader singleton en runtime. Implementación pendiente. Ver `OQ-DATA-3` en `docs/governance/open-questions.md`.

## Contrato de `notes[]` — conocimiento local y auditoría

> **SSoT del campo `notes[]`.** Aplica a **todos** los `*.override.json`. Los schemas por-tipo **no redefinen** este contrato: lo **referencian**. Si un schema necesita un matiz, da un *ejemplo*, no una regla propia.

### Razón de ser

`notes[]` existe para resolver un problema concreto: el **sobre-contexto** y la dispersión de la documentación. Los docs responden "el qué" y "el cómo" de forma **general** — pero cuando se audita un campo de forma **segmentada**, entrada por entrada, muchas verdades **no se pueden colapsar en un grupo**: son específicas de esa entrada y exigen análisis caso por caso. `notes[]` lleva ese conocimiento **pegado al dato**, donde el instinto (humano o IA) lo busca: *ver `notes` con contenido → leerlo*.

### Principio rector: `notes[]` NO es un SSoT

No es fuente de verdad y **el proyecto no lo consume en runtime** (la verdad estructurada vive en `upgrade_type`, `condition`, campos y docs). `notes[]` solo puede afirmar **"acá hay algo"**: un problema, una duda, un gap o un puntero. Nunca verdad asentada.

De ahí, tres invariantes **sin excepción**:

1. **Verdad resuelta → estructura; la nota muere.** Cuando el concepto se absorbe en token/campo/fórmula, la nota desaparece. (Ej.: al acuñar `WEAPON_ADD_PUNCH_THROUGH`, las notas "sin token" se eliminaron.)
2. **Nota que sobrevive a la estructuración de su concepto = drift.** No es "el por qué": es señal de que la estructura no captura lo que la nota dice. Se corrige, no se conserva.
3. **`notes: []` vacío está prohibido.** Su presencia afirma "hay algo"; vacío es contradicción. Sin nada que decir → **clave ausente**, nunca `[]` (misma lógica que una OQ sin justificación: colapsa).

### Qué va y qué no

**Va** — siempre una **desviación** de la norma:

- **Special-case / entry-specific** — comportamiento que no es el default de su grupo y no se puede generalizar. *Ej.: "este daño se activa con el golpe directo del arma, no con residuales (arcanos/habilidades)".*
- **Miss-take** — el modelo documentado no aplica limpio a este caso; sin resolución. Apunta al hub. *Ej.: Adaptation (fórmula simple pero inconsistente con el modelo actual).*
- **Gap anclado** — sin `upgrade_by`/token todavía; deuda en este punto. *Ej.: "duration 7s no modelada".*

**No va** — ruido:

- **Re-explicar la norma** — cómo se aplica un mod estándar (Serration) ya lo responde docs; repetirlo por-entrada es ruido.
- **Changelog / histórico** — "aplicado tal día", "renombrado". → git.
- **Estado computado / derivable** — clasificaciones que salen de otros campos (ej. `data:class:cat/x` deriva de `upgrade_type` + `condition`) y se agregan en `status.md`. No es conocimiento, es cálculo.
- **Duplicar docs** — si responde "el cómo canónico", es doc.

### Test operativo

> **¿Esto es verdad para todo su grupo/tipo, o es específico/excepcional de esta entrada?**
> Norma del grupo → **docs**. Excepción de la entrada → **`notes[]`**.

### Forma del cuerpo

- **Prefijo `<dominio>:<tipo>`** — `engine:note`, `data:note`. `tipo` por defecto `note`; **expandible** cuando un caso real lo justifique (`engine:formula`, `engine:edge-case`, …). Vocabulario emergente, no cerrado.
- **Comprimido** — una nota es **puntero + una cláusula sintetizadora** ("esta entrada cae en X porque Y"), no un párrafo. La explicación extensa vive en el **hub** (doc / OQ / closed-decision).
- **Forma semi-estructurada (interina)** — excepción a la forma prosa: un parámetro real que hoy vive solo en el label y aún no tiene campo (ej. arcanes: `proc:|val1|`, duración, cooldown) se captura en `notes[]` con formato semi-estructurado parseable. Es **captura notes-first transitoria** — un "gap anclado": cuando el engine (C2) lo estructure como campo, la nota **muere** (invariante 1). No es un almacén de datos permanente ni input de runtime de largo plazo.

### Relación con docs — hub & spoke

El conocimiento extenso y la pertenencia **cross-schema** viven en un **hub** (un doc o una OQ). Las `notes[]` son **spokes**: punteros locales al hub. Una duda que nace en `mods` y reaparece en `ability` no necesita un doc-índice que mapee `uniqueID`s (anti-patrón: un segundo índice que driftea) — cada entrada lleva su spoke `→ OQ-DATA-X`, y la OQ **es** el contexto global. El caso de excepción habla por sí solo.

### Consecuencias a confirmar en revisión

- **Migración de tags `data:class:cat/x`** hoy presentes en `notes[]`: son estado computado (viven en `status.md`). Sacarlos es coherente con el contrato, pero el volumen y el enfoque se deciden aparte.
- **Referenciar este contrato** desde los 4 schemas (`mods`, `incarnon`, `arcane`, `archon-shards`), bajando su guía local de `notes` a un solo *ejemplo* + link aquí. Resuelve el drift de prefijo (`[engine]` en incarnon-schema vs `engine:note` real).

Ver:
- `ssot.md`
- `roles.md`
