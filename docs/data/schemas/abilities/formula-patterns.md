---
Estado: "referencia"
Rol: "Documentar patrones de fórmulas para habilidades"
Version: "v0.0.2"
Impacto_ID: "data-abilities-formulas"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-01"
---

# Ability Formula Patterns

## Patrones Soportados

| Patrón | Fórmula | Descripción |
| :--- | :--- | :--- |
| **Lineal** | `variable * baseValue` | Escalado directo (ej: Strength). |
| **Caps** | `clamp(val, min, max)` | Aplicación de límites definidos en el schema. |
| **Inverse** | `baseValue / variable` | Escalado inverso (ej: coste reducido por eficiencia). |
| **Fijo** | `baseValue` | Valor constante sin escalado. |
| **Energía (Uso)** | `(2 - EFF) * baseValue` | Coste de activación de habilidades. |
| **Energía (Drain)** | `(2 - EFF) * baseValue / DUR` | Consumo por segundo de habilidades activas. |

## Reglas de Interpretación

1.  **Declaración**: El schema de datos declara el `baseValue`, el `upgradeBy` (variable) y los posibles `caps`.
2.  **Resolución**: La interpretación exacta de la fórmula y el orden de operaciones es responsabilidad exclusiva del motor (`core/engine`).
3.  **Fuentes**: Las fórmulas se basan en la lógica unificada de la comunidad documentada en `references/`.

---

### Mantenimiento
Para patrones complejos (basados en targets, combos o armadura dinámica), se requiere un análisis previo en el dominio de **Gobernanza** antes de ampliar el diccionario de fórmulas del motor.
