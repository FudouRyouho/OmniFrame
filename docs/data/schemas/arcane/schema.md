---
Estado: "referencia"
Rol: "Contrato + mapa semántico de arcane-stats.override.json (164 arcanes, 60 stats mapeados)"
Impacto_ID: "SSoT-Data-Arcane"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Version: "1.0"
Fecha_de_creacion: "2026-05-28"
Fecha_de_actualizacion: "2026-05-28"
---

# Arcane Stats Override — Schema y mapa semántico

Generado con `Project/scripts/generate-arcane-override.py` sobre `arcanes.json` (@wfcd/items).  
164 arcanes procesados, 4 skipped (sin `level_stats`).

---

## 1. Contrato del schema

Idéntico a `mod-stats.override.json`. Ver [mods-schema.md](../mods/mods-schema.md) para el contrato completo.

```ts
interface ArcaneOverrideEntry {
  name:  string;
  stats: ArcaneStat[];
}
interface ArcaneStat {
  label:      string;          // texto del efecto con |val1|, |val2| como placeholders
  values:     ArcaneValue[];   // uno por valor escalable en el label
  condition?: string | null;   // token canónico del vocabulario (D-14)
  note?:      string | null;   // semántica no tokenizable (D-14); ausente = entrada completa
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

---

## 2. Tokens activos — mapa confirmado (60 stats)

Los `upgrade_type` asignados a continuación están verificados semánticamente.  
El valor escalado **sí** representa el atributo indicado por el token.

### WEAPON — stats de disparo

| Token | N | Arcanes representativos |
|---|---|---|
| `WEAPON_ADD_DAMAGE` | 13 | Arcane Fury, Arcane Awakening, Arcane Precision, Arcane Rage, Arcane Rise, Arcane Blade Charger, Arcane Primary Charger, Arcane Arachne, Longbow Sharpshot, Melee Exposure, Virtuos Fury, Theorem Demulcent, Eternal Eradicate |
| `WEAPON_ADD_CRIT_CHANCE` | 10 | Arcane Avenger, Arcane Hot Shot, Cascadia Accuracy, Cascadia Overcharge, Eternal Onslaught, Melee Animosity (×2), Secondary Kinship, Secondary Outburst, Virtuos Shadow |
| `WEAPON_ADD_CRIT_MULT` | 5 | Arcane Crepuscular, Magus Aggress, Primary Blight, Primary Frostbite, Virtuos Strike |
| `WEAPON_ADD_FIRE_RATE` | 5 | Arcane Acceleration, Arcane Strike, Arcane Tempo, Arcane Velocity, Virtuos Tempo |
| `WEAPON_ADD_MULTISHOT` | 5 | Conjunction Voltage, Primary Blight, Primary Frostbite, Primary Overcharge, Shotgun Vendetta |
| `WEAPON_ADD_RELOAD_SPEED` | 4 | Arcane Momentum, Conjunction Voltage, Fractalized Reset, Shotgun Vendetta |
| `WEAPON_ADD_STATUS_CHANCE` | 2 | Primary Crux, Virtuos Ghost |
| `WEAPON_ADD_ACCURACY` | 1 | Pax Soar |
| `WEAPON_BASE_COMBO_INITIAL` | 1 | Melee Crescendo |

### AVATAR — stats del Warframe

| Token | N | Arcanes representativos |
|---|---|---|
| `AVATAR_ADD_ABILITY_STRENGTH` | 6 | Arcane Crepuscular, Arcane Impetus, Arcane Power Ramp, Molt Augmented, Molt Vigor, Pax Bolt |
| `AVATAR_ADD_ABILITY_DURATION` | 3 | Arcane Concentration, Molt Efficiency (×2 — increment + cap) |
| `AVATAR_ADD_ABILITY_EFFICIENCY` | 2 | Arcane Impetus, Pax Bolt |
| `AVATAR_ADD_PARKOUR_VELOCITY` | 2 | Arcane Agility, Arcane Consequence |
| `AVATAR_ADD_SPRINT_SPEED` | 1 | Magus Cadence |

> **Nota sobre `condition`**: 121 de 175 stats tienen `condition` capturado. El engine puede leer el
> campo ahora aunque no lo evalúe; los arcanes sin condición son efectos siempre activos o cuyo
> trigger no siguió el patrón "On X:" / "While X:".

---

## 3. Categorías de null (122 stats)

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

### 3.5 Combo Count Chance (~3 arcanes)

`Exodia Triumph, Exodia Valor, Melee Vortex`

`"|val1|% Combo Count Chance"` — sin token `WEAPON_ADD_COMBO_COUNT_CHANCE`. El KEYWORD_MAP lo refleja como explícitamente `null`.

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

## 4. Patrones de falso positivo conocidos

El keyword matcher del script es conservador pero imperfecto. Estos patrones disparan
`WEAPON_ADD_DAMAGE` o `AVATAR_ADD_ABILITY_STRENGTH` incorrectamente y deben verificarse manualmente:

| Patrón | Token erróneo | Ejemplo |
|---|---|---|
| "damage" en contexto de mecánica defensiva | `WEAPON_ADD_DAMAGE` | Arcane Temperance ("Damage Taken") |
| "ability strength" como INPUT de fórmula | `AVATAR_ADD_ABILITY_STRENGTH` | Arcane Expertise ("applied to Max Shields") |
| "ability strength" como parte del trigger "on enemy frozen + stacks" | `AVATAR_ADD_ABILITY_STRENGTH` | Arcane Ice Storm (valor = stack count, no %) |
| "critical damage" con "for every X%" | `WEAPON_ADD_CRIT_MULT` | Melee Doughty (per-puncture formula) |
| Keyword en zona/proc, valor escalado = duración | `WEAPON_ADD_DAMAGE` | Residual Boils (valor = segundos de zona) |
| Stacking counter como único valor escalable | cualquier token | Secondary Enervate (valor = resets, no crit %) |

---

## 5. Relación con el pipeline de datos

```
arcanes.json (@wfcd/items)
    ↓  generate-arcane-override.py
arcane-stats.override.json  ← SSoT semántico de este schema
    ↓  ArcaneRepository (pendiente)
ModifierPipeline
```

Los arcanes con `condition != null` y `upgrade_type != null` son candidatos directos
para la taxonomía `context.flags` (C1-A) cuando se diseñe. Los de `condition: null`
con upgrade_type son efectos siempre activos — los más simples de implementar en C1.

---

## 6. Prioridades de completado

| Prioridad | Trabajo | N entries |
|---|---|---|
| P1 | Implementar `ArcaneRepository` (análogo a `IncarnonRepository`) | — |
| P1 | Arcanes siempre activos (condition: null, upgrade_type: mapeado) | ~15 |
| P2 | Tokens faltantes simples: `WEAPON_ADD_AMMO_EFFICIENCY`, `WEAPON_ADD_COMBO_COUNT_CHANCE` | ~7 |
| C1-A | Arcanes con `condition` + `upgrade_type` (on-event, upgrade conocido) | ~45 |
| C1-B | Fórmulas per-stat (§3.6) | ~7 |
| C1-C | Status resistances (§3.1) | ~11 |
| C1-D | Operator/Kitgun scope (§3.8) | ~18 |
