---
Estado: "activo"
Rol: "Categorizar el soporte técnico del motor para Archon Shards"
Version: "v0.0.2"
Impacto_ID: "E-Shards"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Archon Shards Integration

## Alcance Técnico

La integración de Archon Shards se divide por categorías de impacto en el motor de cálculo, priorizando aquellas que no requieren simulación temporal.

### Categorías sin simulación (Soporte Directo)
Efectos que se aplican como modificadores estáticos al build:
- **Crimson**: `Melee Critical Damage`, `Primary Status Chance`, `Secondary Critical Chance`, `Ability Strength`, `Ability Duration`.
- **Amber**: `Casting Speed`, `Parkour Velocity`.
- **Azure**: `Health`, `Shield Capacity`, `Energy Max`, `Armor`.
- **Violet**: `Primary Electricity Damage`.

### Categorías con Thresholds simples
Efectos que dependen de un valor estático calculado:
- **Violet**: `Melee Critical Damage` (si `maxEnergy > 500`). Requiere que el motor resuelva el `maxEnergy` final antes de aplicar este bono.

## Modelos Requeridos

Para un soporte completo, el motor consume metadata de los siguientes dominios:

1.  **Warframe Base**: Health, Shield, Armor, Energy, Casting Speed.
2.  **Weapon Base**: Critical Chance, Status Chance, Damage Breakdown.
3.  **Contexto**: Capacidad de evaluar condiciones simples (ej: `energy_threshold_500`).

## Limitaciones de Simulación

Efectos que dependen de eventos en tiempo real o estados del enemigo quedan fuera del cálculo estático y se tratan como metadatos informativos:
- Bonus `on-kill`.
- Acumulación de stacks por tiempo o daño.
- Conversión de pickups (Energy/Health orbs).

---

### Referencias
- `docs/domains/engine/architecture.md`
- `docs/domains/data/abilities/abilities-engine-variables.md`
