---
Estado: "referencia"
Rol: "auditoria-manual"
Impacto_ID: "D-18"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Fecha_de_creacion: "2026-06-02"
Fecha_de_actualizacion: "2026-06-04"
---

# Auditoría manual — arcane-stats.override.json

**Estado:** completada 2026-06-02. 40 entradas resueltas; 1 pendiente (ver abajo).
Detalle de cada entrada en git history (sesión 2026-06-02).

**Patrones detectados:**
- **Cross-stat** (fórmulas que cruzan stats de warframe): MaxEnergyForArmor, AbilityStrengthForMaxHealth, MeleeDamageForActiveShields, DamageForBonusArmour, CritDamageForPunctureStatus — ref OQ-W-6.
- **Stacking on-event** (familia Merciless/Deadhead/Dexterity × Primary/Secondary): `base_value: null` + per_stack + cap + duration. Gateado por consumidor (D-20). Ver §Familia stacking on-event.
- **Ability-like** (puertas 2-3 de D-20): ≥10 casos. Mecánicas (CC, invisibilidad, AoE, pull, puddles) sin token engine. Escape hatch aplicado.
- **Weapon-type gate**: restricciones (Dual Pistols, Shotguns, Bows, Kitguns) no modelables hoy — solo en `label`/`notes`. Ver OQ-DATA-5.

---

## Entrada pendiente

### /Lotus/Upgrades/CosmeticEnhancers/Utility/SlowerBleedOutOnPredeath

> No aparece en wiki (404) ni en el juego live. Existe en los archivos internos de DE (fuente @wfcd/items con level_stats poblado). Posible cut content / arcano nunca lanzado. Verificación pendiente: datamine histórico o confirmación de que nunca fue obtenible. El override conserva los valores de la fuente. No tocar hasta confirmar.

---

## Clasificación de `condition: null` y patrones estructurales (debate 2026-06-02)

Resultado del debate sobre el `//!` (familia stacking on-event). Criterio aplicado: `decisions.md#D-20` (tres puertas + gate de consumidor + escape hatch como hipótesis con contador). Corrige la caracterización "5 compuestas" de `schema.md §117`.

### Los 5 `condition: null` — naturaleza real

| Arcano | Naturaleza real | Puerta (D-20) | Acción |
|---|---|---|---|
| **Melee Careen** | Dos efectos en un label (`x Dmg vs Frozen` + `On Roll: Freeze radius`) | — (bug de datos) | **Split** (regla 1 label = 1 stat): stat1 `while_target_frozen`, stat2 `on_roll`. **GREEN, pendiente.** |
| **Melee Afflictions** | Composición real `status AND (knockdown OR fling)`, efecto sobre enemigos | 3 (incierta) + fuera de scope | Escape hatch. Contador composición OR/AND = **1**. |
| **Arcane Camisado** | Trigger de mecánica (stacking de minions + consumo en próximo cast) | 2 (ability-like) | Escape hatch + nota "ability-like". |
| **Universal Fallout** | Trigger encadenado (cada Radiation status → death → chance de orb) | 2 (ability-like) | Escape hatch + nota "ability-like". |
| **Primary Debilitate** | Threshold/contador (10 stacks combinados → chance de re-inflict) | 2 (ability-like) | Escape hatch + nota "ability-like". |

### Familia stacking on-event (6 entradas)

`Primary/Secondary Merciless · Deadhead · Dexterity`. Forma: `On <event>: +X% Damage for Ns. Stacks up to Mx.`

| Arcano | per_stack | cap | duration |
|---|---|---|---|
| Deadhead | 20% | 3 | 24s |
| Dexterity | 10% | 6 | 20s |
| Merciless | 5% | 12 | 4s |

Dato **determinista, forma conocida, ≥2 casos** → puerta 1 (califican para estructura) pero **gateadas por consumidor** (D-20). Hoy permanecen como están (D-15 Fase 0). **Drift registrado:** arcanes usa `base_value: null` donde D-15 §2 pide `total`. Nivel confirmado = **stat** (estas entradas mezclan stats con y sin condición → la condición/stacking/duration no puede ser de entry).

### Contadores de vigilancia (gate ≥2, D-20)

- **Composición OR/AND de condition:** 1 (Afflictions) — **sub-umbral**, no se diseña lenguaje. Re-evaluar al crecer dataset / cobertura ≥70% (D-16). Ver `OQ-DATA-4`.
- **Ability-like en arcanes:** ≥3 (Camisado, Universal Fallout, Debilitate) — categoría formula-driven futura, fuera del schema de stats.
- **Stacking estructural (per_stack+cap):** ≥6 casos de misma forma — listo para estructura cuando exista consumidor (puente ubicado en `data/` por `DC-OQ-DATA-2`; creación gateada, `OQ-DATA-4`).
