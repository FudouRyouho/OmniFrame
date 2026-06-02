---
Estado: "activo"
Rol: "Contrato semántico de polaridades y su normalización en el pipeline"
Version: "v0.0.2"
Impacto_ID: "semantic-polarity"
Fidelidad_Fisica: "Project/src/shared/types/polarity.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-01"
---

# Polarity — Semántica Canónica

## Tipos de Polaridad (PolarityType)

El proyecto normaliza el vocabulario inconsistente de la fuente en 8 valores canónicos:

| Valor Canónico | Concepto | ID Interno (Wiki/Fork) |
| :--- | :--- | :--- |
| `madurai` | Ofensiva (Ataque) | `AP_ATTACK` |
| `vazarin` | Defensiva (Defensa) | `AP_DEFENSE` |
| `naramon` | Táctica | `AP_TACTIC` |
| `zenurik` | Poder (Energía) | `AP_POWER` |
| `unairu` | Resistencia (Ward) | `AP_WARD` |
| `penjaga` | Compañeros (Precept) | `AP_PRECEPT` |
| `umbra` | Mods Umbra | `AP_UMBRA` |
| `omni` | Universal (Aura/Cualquiera) | `AP_ANY` / `AP_UNIVERSAL` |

## Normalización en el Pipeline

El motor de normalización de datos (`scripts/normalization/polarity.ts`) unifica los conceptos de `"aura"` y `"universal"` bajo el token canónico **`omni`**.

- **Regla**: Todo valor no reconocido o ausente se normaliza como `null` (ausencia de polaridad).

## Manifestación en el Sistema

- **Dataset**: `aura`, `stancePolarity`, `polarity` y el array de `polarities[]` usan este vocabulario.
- **Implementación**: `Project/src/shared/types/polarity.ts` contiene el tipo unificado y los utilitarios de mapeo.
- **Verificación**: Existe una suite de validación automatizada ejecutable vía `npm run verify:polarity`.

---

### Notas de Integridad
El vocabulario de polaridades es **cerrado**. Cualquier entrada nueva en el dataset que no coincida con estos 8 valores debe ser tratada como error de normalización antes de llegar al runtime.
