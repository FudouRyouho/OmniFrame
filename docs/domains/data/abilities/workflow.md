---
Estado: "activo"
Rol: "Guía de proceso para la migración de habilidades al contrato semántico"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Workflow"
Fidelidad_Fisica: "docs/domains/data/abilities/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Ability Migration Workflow

## Flujo de Trabajo

Para migrar una habilidad del estado "Raw/Legacy" al estado "Semántico", se sigue este proceso:

1.  **Auditoría de Fuente**: Consultar los RIPS en `references/semantic-ui-rips/` para obtener la gramática base capturada.
2.  **Identificación de Grupos**: Determinar si los efectos son base, coexistentes (Titania/Wisp) o excluyentes (Equinox/Chroma) vía `exclusive`.
3.  **Mapeo de Variables**: Asignar el `upgradeBy` correcto (STR, DUR, RNG, EFF) basado en las variables del engine.
4.  **Consolidación**: Editar el archivo `Project/public/data/ability-stats.override.json` con la nueva estructura.
5.  **Verificación**: Ejecutar `npm run verify:ability-stats` (si está disponible) o inspección manual del JSON.

## Criterios de Calidad

- **Nomenclatura**: Los labels deben ser fieles al juego para asegurar la legibilidad del usuario.
- **Tags Semánticos**: Asegurar que los tipos de daño y energía estén correctamente taggeados (`<DT_TYPE>`, `<ENERGY>`).
- **Agnosticismo de UI**: No añadir estilos o reglas de renderizado en el JSON. La descripción debe ser pura semántica.

---

### Notas Operativas
Este flujo asegura que la base de datos de habilidades crezca de forma coherente con el sistema de cálculo del Engine.
