---
Estado: "activo"
Rol: "Guía de proceso para agregar o actualizar habilidades vía pipeline semántico"
Version: "v0.1.0"
Impacto_ID: "D-Abilities-Workflow"
Fidelidad_Fisica: "references/game-ui/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-24"
---

# Ability Migration Workflow

## Flujo de Trabajo

Para agregar o actualizar habilidades, el flujo es:

1.  **Captura de fuente**: Obtener los stats desde la UI del juego (pantalla de habilidades, máximo nivel). Abrir o crear `references/game-ui/<Warframe>.md` siguiendo la spec de `references/game-ui/README.md`.
2.  **Identificación de Grupos**: Determinar si los efectos son base, coexistentes (Titania/Wisp) o excluyentes (Equinox/Chroma) vía `exclusive`. Anotar en el `.md` con `###`/`####`.
3.  **Mapeo de Variables**: Asignar el shorthand correcto (`$STRENGTH`, `$RANGE`, `$DURATION`, `$EFFICIENCY`, `$DRAIN`) según qué variable del engine escala el stat. Si no escala, omitir (`upgrade_by` ausente = valor fijo).
4.  **Aplicar al override**: Ejecutar `npm run apply:ability -- ../references/game-ui/<Warframe>.md`. El script parsea, merge y preserva `name`/`description`/`image_name`. **No editar el JSON a mano para `groups`/`stats`.**
5.  **Verificación**: Revisar output del script (`NEW`/`UPD` por habilidad). Correr el preflight checklist en `docs/data/schemas/abilities/preflight-checklist.md` antes de commit.

## Criterios de Calidad

- **Nomenclatura**: Los labels deben ser fieles al juego para legibilidad del usuario.
- **Tags Semánticos**: Tipos de daño con `<DT_TYPE>`, energía con `<ENERGY_COST>` o `<ENERGY_DRAIN>`.
- **Agnosticismo de UI**: No añadir estilos ni reglas de renderizado en el JSON. La descripción es semántica pura.
- **Edge cases**: Anotar con `//!` en el `.md` cualquier mecánica sin modelar (doble-escala, cooldowns). El script emite `console.warn` y continúa.

---

### Notas Operativas
Ver `docs/data/pipeline/ability-pipeline.md` para el diagrama completo del flujo y los artefactos involucrados.
