---
Estado: "activo"
Rol: "Contrato + catálogo de cobertura de arcane-stats.override.json — definiciones de token en docs/semantic/upgrade-tokens.md"
Impacto_ID: "data-arcane"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Version: "v1.2.2"
Fecha_de_creacion: "2026-05-28"
Fecha_de_actualizacion: "2026-06-11"
---

# Arcane Stats Override — Schema y mapa semántico

Generado con `Project/scripts/generate-arcane-override.py` sobre `arcanes.json` (@wfcd/items).  
164 arcanes procesados, 4 skipped (sin `level_stats`).

---

## 1. Contrato del schema

Base idéntica a `mod-stats.override.json` (ver [mods-schema.md](../mods/mods-schema.md)), **excepto** el campo de
notas: tanto arcanes como mods migraron a `notes[]` (plural, modus operandi incarnon) el 2026-06-01.

```ts
interface ArcaneOverrideEntry {
  name:  string;
  stats: ArcaneStat[];
}
interface ArcaneStat {
  label:      string;          // texto del efecto con |val1|, |val2| como placeholders
  values:     ArcaneValue[];   // uno por valor escalable en el label
  condition?: string | null;   // ausente = sin condición · null = condición sin token · token = condicional (D-18)
  notes?:     string[];        // contrato (SSoT): docs/data/rules/overrides.md §Contrato de notes[]
}
interface ArcaneValue {
  base_value:   number[] | null;  // serie [rank0, rank1, …, rankMAX] — length = max_rank + 1 (ej: 6 para rank 5, 4 para rank 3)
  upgrade_type: Upgrade | null;   // token del vocabulario de modifier.ts, null si no mapeado
}
```

Ver [D-14](../../decisions.md) y [D-15](../../decisions.md) para la semántica completa de `condition?:` y `note?:`, modelo de runtime Fase 0, y regla de stacking.  
Vocabulario canónico: `docs/semantic/conditions.md`.

### Diferencias vs mod-stats.override.json

| Aspecto | Mods | Arcanes |
|---|---|---|
| `base_value` | escalar `number` o array | array de length = max_rank + 1 (6 si rank 5, 4 si rank 3) |
| Fuente de `upgrade_type` | `upgradeTypes[]` en @wfcd/items | texto libre → keyword matching |
| `condition` | no aplica | capturado de prefijos "On X:", "While X:", etc. |
| Ranks | variable (0–5 típico) | fijo 6 ranks (0–5) |

### Convención de notas de parámetros (Patrón 3, 2026-06-01)

Parámetros que viven en el **texto** del label (no en datos estructurados) — probabilidad de activación,
duración del buff, cooldown — se capturan en `notes[]` con un formato semi-estructurado, parseable por el
futuro engine C2 (sistema de buffs temporales / eventos). Modelado estructural diferido (notas-primero).
Es la **forma semi-estructurada interina** del contrato (`docs/data/rules/overrides.md` §notes[]): captura transitoria — al estructurarse en C2, la nota muere.

```
engine:note — proc:<N>% duration:<N>s cooldown:<N>s
```

| Clave | Significado | Constante | Escalable (el stat ES el parámetro) |
|---|---|---|---|
| `proc:` | probabilidad de activación | `proc:60%` | `proc:\|val1\|` (ej. proc resist, knockdown) |
| `duration:` | duración del buff temporal | `duration:24s` | — |
| `cooldown:` | tiempo de reutilización | `cooldown:15s` | `cooldown:\|val2\|` (ej. Arcane Barrier) |

Solo se incluyen las claves presentes en el label. Aplicado en lote a 103 stats (append donde ya había
`notes[]`). El `proc:\|valN\|` marca la **naturaleza probabilística** del valor para el engine (es una
probabilidad, no una magnitud). Pendiente: estructurar como campos cuando se diseñe C2.

---

## 2. Cobertura de mapeo — catálogo (83 stats auditados, 2026-05-31)

> Definiciones de token: `docs/semantic/upgrade-tokens.md`  
> Auditoría Gate 2a completada: Melee Exposure corregido (→ `WEAPON_ADD_CORROSIVE_DAMAGE`);  
> 9 stacking/formula arcanes con `notes[]` añadidas; 2 condiciones faltantes detectadas y corregidas.

**Estado de cobertura actual:** 83 mapeados / 193 totales (~43%)

### WEAPON

| Token | N | Arcanes representativos | Estado |
|---|---|---|---|
| `WEAPON_ADD_DAMAGE` | 12 | Arcane Fury, Arcane Awakening, Arcane Precision, Arcane Rage, Arcane Rise, Arcane Blade Charger, Arcane Primary Charger, Arcane Arachne, Longbow Sharpshot, Virtuos Fury, Theorem Demulcent, Eternal Eradicate | ✅ válidos; scope weapon-type es limitación del modelo |
| `WEAPON_ADD_CORROSIVE_DAMAGE` | 1 | Melee Exposure | ✅ corregido en Gate 2a |
| `WEAPON_ADD_CRIT_CHANCE` | 10 | Arcane Avenger, Arcane Hot Shot⚠, Cascadia Accuracy, Cascadia Overcharge, Eternal Onslaught, Melee Animosity⚠, Secondary Kinship⚠, Secondary Outburst⚠, Virtuos Shadow | ⚠ stacking en Hot Shot, Animosity, Kinship, Outburst — ver `notes[]` |
| `WEAPON_ADD_CRIT_MULT` | 5 | Arcane Crepuscular val1⚠, Magus Aggress, Primary Blight, Primary Frostbite, Virtuos Strike | ⚠ Crepuscular val1 = Final Critical Damage (bucket multiplicativo separado) — ver semantic gap |
| `WEAPON_ADD_FIRE_RATE` | 5 | Arcane Acceleration, Arcane Strike, Arcane Tempo, Arcane Velocity, Virtuos Tempo | ✅ |
| `WEAPON_ADD_MULTISHOT` | 5 | Conjunction Voltage, Primary Blight, Primary Frostbite, Primary Overcharge⚠, Shotgun Vendetta | ⚠ Overcharge = val es cap, no multishot directo — ver `notes[]` |
| `WEAPON_ADD_RELOAD_SPEED` | 4 | Arcane Momentum, Conjunction Voltage, Fractalized Reset, Shotgun Vendetta | ✅ |
| `WEAPON_ADD_STATUS_CHANCE` | 2 | Primary Crux, Virtuos Ghost | ✅ |
| `WEAPON_ADD_ACCURACY` | 1 | Pax Soar | ⚠ vocab gap — ver `docs/semantic/upgrade-tokens.md` |
| `WEAPON_ADD_COMBO_COUNT_CHANCE` | 2 | Exodia Triumph, Exodia Valor | ✅ |
| `WEAPON_ADD_COMBO_DURATION` | 2 | Primary Dexterity, Secondary Dexterity | ✅ valores fijos |
| `WEAPON_ADD_RECOIL` | 3 | Primary Deadhead, Secondary Deadhead, Pax Soar | ✅ valores negativos = reducción |
| `WEAPON_ADD_RELOAD_SPEED` | 2 | Primary Merciless, Secondary Merciless | ✅ valores fijos |
| `WEAPON_ADD_HEADSHOT_MULT` | 2 | Primary Deadhead, Secondary Deadhead | ⚠ vocab gap — ver `docs/semantic/upgrade-tokens.md` |
| `WEAPON_BASE_COMBO_INITIAL` | 1 | Melee Crescendo | ✅ |

### AVATAR

| Token | N | Arcanes representativos | Estado |
|---|---|---|---|
| `AVATAR_ADD_ABILITY_STRENGTH` | 7 | Arcane Crepuscular val0, Arcane Impetus, Arcane Power Ramp⚠, Molt Augmented⚠, Molt Vigor, Pax Bolt | ⚠ Power Ramp y Molt Augmented = stacking — ver `notes[]` |
| `AVATAR_ADD_ABILITY_DURATION` | 4 | Arcane Concentration, Molt Efficiency val0⚠, Molt Efficiency val1⚠ | ⚠ Efficiency = increment + cap — ver `notes[]` |
| `AVATAR_ADD_ABILITY_EFFICIENCY` | 2 | Arcane Impetus, Pax Bolt | ✅ |
| `AVATAR_ADD_PARKOUR_VELOCITY` | 2 | Arcane Agility, Arcane Consequence | ✅ |
| `AVATAR_ADD_SPRINT_SPEED` | 2 | Arcane Phantasm, Magus Cadence | ✅ |
| `AVATAR_ADD_SHIELD_RECHARGE_RATE` | 1 | Arcane Aegis | ✅ |
| `AVATAR_ADD_HEALTH_REGEN` | 2 | Arcane Grace, Arcane Victory | ⚠ vocab gap — ver `docs/semantic/upgrade-tokens.md` |
| `AVATAR_FLAT_ARMOUR` | 6 | Arcane Guardian, Arcane Reaper val1, Arcane Tanker, Arcane Ultimatum, Magus Husk, Melee Fortification | ✅ |
| `AVATAR_FLAT_HEALTH_REGEN` | 2 | Arcane Reaper val0, Magus Nourish | ✅ |
| `AVATAR_FLAT_HEALTH_MAX` | 1 | Magus Vigor | ✅ |

> **`condition` (2026-06-01, post-Patrón 4):** 137 stats con token, 5 con `null` (condición compuesta sin tokenizar), 33 ausente = siempre activo (D-18). Patrón 4 acuñó 8 tokens nuevos (ver `conditions.md` §Ingesta arcanes) y reutilizó 4 existentes (while_airborne, with_armor_over_700, while_channeled_ability_active, while_target_affected_by_cold). Los 5 `null` restantes **no son todos compuestos** (reclasificados 2026-06-02 — ver `../../reports/audit-arcane.md` y `decisions.md#D-20`): **1** composición real (Afflictions: `status AND (knockdown OR fling)`), **1** multi-efecto sin split (Careen → split pendiente, GREEN), **3** ability-like (Camisado, Universal Fallout, Debilitate → escape hatch, categoría formula-driven futura). La caracterización previa "5 compuestas" era imprecisa.

---

## 3. Categorías de null (110 stats)

Stats con `base_value` poblado pero `upgrade_type: null` — ordenados por razón semántica.

### 3.1 Status resistances (~11 arcanes)

`Arcane Defense / Deflection / Detoxifier / Healing / Ice / Liquid / Nullifier / Protection / Resistance / Shield / Warmth`

`"|val1|% chance to resist a X Status effect."` — probabilidad de resistencia de estatus. Sin token en el vocabulario. Requiere un `AVATAR_CHANCE_RESIST_*` por tipo o un token genérico con parámetro de tipo.

### 3.2 HP / Armor / Shield buffs on-event (~10 arcanes)

`Arcane Guardian, Grace, Aegis, Barrier, Trickery, Reaper, Survival, Persistence, Temperance, Truculence`

Buffs temporales de armor, HP, shields o invisibilidad activados por trigger. El valor en la serie sería correcto si el token existiera, pero no hay tokens para efectos con duración en el snapshot estático. Candidatos: `AVATAR_ADD_ARMOUR`, `AVATAR_FLAT_HEALTH_REGEN`, `AVATAR_ADD_SHIELD_MAX` — condicionados al trigger (on-event, no siempre activos).

### 3.3 Economía de HP / Energía (~8 arcanes)

`Arcane Energize, Blessing, Battery, Intention, Pulse, Bodyguard, Molt Reconstruct, Victory`

Restauran HP o Energy dinámicamente. Los valores escalan pero el efecto es de mecánica de recurso, no un stat de arma/frame. Sin token para "restaurar energía", "sanar aliados", etc.

### 3.4 Ammo Efficiency (~4 arcanes)

`Akimbo Slip Shot, Arcane Pistoleer, Primary Crux (ammo part), Eternal Logistics`

`"|val1|% Ammo Efficiency"` — sin token `WEAPON_ADD_AMMO_EFFICIENCY` en el vocabulario. La adición es sencilla cuando se necesite.

### 3.5 Combo Count Chance (1 arcane)

`Melee Vortex` — mecánica de pull; permanece null (distinto de combo count). Token `WEAPON_ADD_COMBO_COUNT_CHANCE` definido; Exodia Triumph / Exodia Valor mapeados (2026-05-31).

### 3.6 Fórmulas por stat (~7 entries)

Valores que escalan pero el efecto final requiere una fórmula en runtime:

| Arcane | Fórmula | Problema |
|---|---|---|
| Arcane Bellicose (×2) | +N% Ability Strength per 250 Max HP | requires player HP at runtime |
| Arcane Battery | +N Energy per Armor point, cap 1000 | requires player Armor |
| Primary Bulwark | +1% damage per armor past 1,000 | requires player Armor |
| Melee Retaliation | +N% Melee Damage per 200 current Shields | requires current Shields |
| Secondary Surge | damage multiplier per 200 current ammo | requires current ammo |

### 3.7 Mecánicas condicionales de runtime (~10 entries)

| Arcane | Tipo | Valor escalado |
|---|---|---|
| Secondary Enervate | crit chance +10% pero valor = contador reset | contador |
| Arcane Ice Storm | +2% strength/duration por stack, valor = max stacks | stack count |
| Arcane Animosity second entry | Crit Chance — max cap | cap |
| Melee Doughty | Crit Mult per 10% Puncture | per-puncture formula |
| Melee Duplicate | % chance para hit extra | probability |
| Arcane Escapist | invulnerabilidad N segundos | duración |
| Residual Boils / Malodor / Shock / Viremia | zona spawner — valor = duración de zona | duración |

### 3.8 Operador / Kitgun / Amp (~18 entries)

Toda la familia `Magus` (transference, void sling, operator mode) y `Virtuos` (conversión Void→elemental), `Exodia` (melee exodia excepto Triumph/Valor), `Emergence`, y Residuals — fuera del scope del weapon simulator actual.

### 3.9 Primary / Secondary arcanes — mecánicas específicas (~14 entries)

`Primary/Secondary Merciless, Deadhead, Dexterity, Plated Round, Debilitate, Obstruct, Irradiate, Exhilarate, Encumber, Fortifier, Shiver, Surge`

On-kill stacking, threshold effects, proccer chains — requieren runtime state. Los tokens de arma existen (`WEAPON_ADD_DAMAGE`, etc.) pero el valor escalado representa un incremento por stack o contador, no un stat estático.

---

## 4. Patrones de falso positivo — estado post-auditoría Gate 2a

El keyword matcher del script es conservador pero imperfecto. Estado de cada patrón conocido:

| Patrón | Token erróneo original | Ejemplo | Estado |
|---|---|---|---|
| "damage" en contexto de mecánica defensiva | `WEAPON_ADD_DAMAGE` | Arcane Temperance ("Damage Taken") | ✅ upgrade_type null |
| "ability strength" como INPUT de fórmula | `AVATAR_ADD_ABILITY_STRENGTH` | Arcane Expertise ("applied to Max Shields") | ✅ upgrade_type null |
| "ability strength" + stacks (valor = stack count) | `AVATAR_ADD_ABILITY_STRENGTH` | Arcane Ice Storm | ✅ upgrade_type null |
| "critical damage" con "for every X%" (per-stat fórmula) | `WEAPON_ADD_CRIT_MULT` | Melee Doughty | ✅ upgrade_type null |
| Keyword en zona/proc, valor = duración de zona | `WEAPON_ADD_DAMAGE` | Residual Boils | ✅ upgrade_type null |
| Stacking counter como único valor escalable | cualquier token | Secondary Enervate | ✅ upgrade_type null |
| "Corrosive Damage" mapeado como `WEAPON_ADD_DAMAGE` | `WEAPON_ADD_DAMAGE` | Melee Exposure | ✅ corregido → `WEAPON_ADD_CORROSIVE_DAMAGE` (Gate 2a) |
| Valor = cap o increment/s en stacking arcanes **mapeados** | token correcto del stat | Arcane Hot Shot, Molt Augmented, etc. | ✅ `notes[]` añadidas — ver §2 ⚠ |
| Canal de arma mapeado a token **genérico** | `WEAPON_ADD_DAMAGE`/`FIRE_RATE`/`RELOAD_SPEED` | Arcane Precision (Secondary), Rage/Primary Charger/Rise (Primary), Velocity/Awakening (Pistol→Secondary), Blade Charger (Melee) | ✅ corregido → sub-family `WEAPON_{PRIMARY,SECONDARY,MELEE}_*` (2026-06-01, Patrón 2). Sniper/Shotgun (Momentum/Tempo)→`primary`+nota; "Excludes Shotguns" (Acceleration)→`primary`+nota; multi-canal Primary+Secondary (Arachne)→genérico+nota. Deuda alias-DAMAGE y D-7 en `upgrade-tokens.md` |
| `base_value: [1,2,3,4,5,6]` interpretado como **placeholder** | — | Arcane Barrier, Bellicose, Grace, Universal Fallout, Melee Crescendo, Primary Crux (ammo), Hot Shot, Molt Efficiency, etc. | ✅ **FALSO POSITIVO (Patrón 5, 2026-06-01):** son **valores reales** que escalan 1→6 por rank (verificado vs `arcanes.json`). El generate-script parseó bien. No hay estructura rota ni datos placeholder. Aplica también a `[1,2,3,4]` (Pax Seeker). |
| `base_value: null` por **parseo @wfcd** (efecto sin valores numéricos en `levelStats`) | — | Exodia Contagion (daño proyectil 0/100/200/300%), Exodia Epidemic (suspend 1/2/3/4s) | ⚠️ **FALSE NULL (Patrón 6, 2026-06-02):** el efecto **sí tiene valores escalables por rank**, pero `@wfcd/items` solo trae el texto descriptivo en `levelStats` (el juego no muestra el escalado en su UI). NO es ausencia real → **verificar wiki antes de asumir null**. Frecuente en efectos ability-like / de mecánica (puerta 2 D-20). Los valores recuperados van a `base_value` aunque `upgrade_type` sea null; mecánica a `notes[]`. |

---

## 5. Relación con el pipeline de datos

```
arcanes.json (@wfcd/items)
    ↓  generate-arcane-override.py
arcane-stats.override.json  ← SSoT semántico de este schema
    ↓  ArcaneRepository (activo desde 2026-06-11, v0: subset mapeado)
ModifierPipeline
```

Los arcanes con `condition` (token) y `upgrade_type` son candidatos directos para la taxonomía
`context.flags` (C1-A) cuando se diseñe. Los **sin** `condition` (ausente) con upgrade_type son
efectos siempre activos — los más simples de implementar en C1.

---

## 6. Prioridades de completado

| Prioridad | Trabajo | N entries |
|---|---|---|
| ✅ P1 | `ArcaneRepository` implementado (2026-06-11, análogo a `IncarnonRepository`; carga vía `DataLoader`, clave uniqueName, modifier directo sin `DamageCombiner`) | — |
| ✅ P1 | Arcanes siempre activos (sin `condition`, upgrade_type mapeado) — flujo A→B→C verificado (`__tests__/arcane.test.ts`) | ~15 |
| P2 | Tokens faltantes simples: `WEAPON_ADD_AMMO_EFFICIENCY`, `WEAPON_ADD_COMBO_COUNT_CHANCE` | ~7 |
| C1-A | Arcanes con `condition` + `upgrade_type` (on-event, upgrade conocido) | ~45 |
| C1-B | Fórmulas per-stat (§3.6) | ~7 |
| C1-C | Status resistances (§3.1) | ~11 |
| C1-D | Operator/Kitgun scope (§3.8) | ~18 |
