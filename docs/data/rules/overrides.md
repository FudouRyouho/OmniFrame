---
Estado: "referencia"
Rol: "Definir la gobernanza de los datos mantenidos manualmente"
Version: "v0.0.4"
Impacto_ID: "D-Overrides"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-05-29 (v0.0.4)"
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

Ver:
- `ssot.md`
- `roles.md`
