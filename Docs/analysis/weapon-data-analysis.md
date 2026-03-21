# Análisis de Fuentes de Datos — Weapons

> Estado: APLICADO ✓ — refactor de WeaponAttack implementado. Ver `weapon-refactor-plan.md`.
> Última actualización: 2026-03-18
>
> Principio rector: entender y adoptar la estructura canónica de la fuente.
> Los overrides solo existen cuando hay un gap real con objetivo claro (como `ability-stats.json`).
> No se modifica la estructura original para conveniencia de la UI.

---

## 1. Fuentes de datos

| Fuente | Rol |
|---|---|
| `@wfcd/items` (npm) | Fuente primaria — datos del juego extraídos de los archivos del cliente |
| [wiki.warframe.com](https://wiki.warframe.com) | Referencia canónica para validar semántica y valores |
| `docs.warframestat.us` | API pública — pendiente de consultar |

---

## 2. Estructura canónica de `@wfcd/items`

### 2.1 Campos top-level del arma (ranged)

Pertenecen al arma, no al ataque. La UI los lee directamente de `Weapon`.

```
accuracy, fireRate, magazineSize, reloadTime, multishot, noise, trigger
criticalChance (decimal), criticalMultiplier, procChance (decimal)
totalDamage, damage{}, disposition, slot, productCategory, type, tags, polarities
```

### 2.2 Campos top-level del arma (melee)

```
range, comboDuration, followThrough, blockingAngle, stancePolarity
slamAttack, slamRadialDamage, slamRadius
heavyAttackDamage, heavySlamAttack, heavySlamRadialDamage, heavySlamRadius
slideAttack, windUp, attackSpeed (= fireRate top-level en melee)
```

### 2.3 Estructura de `attacks[]`

`attacks[]` es una estructura abierta. El campo `name` es la clave semántica — no la posición.
Ningún campo es obligatorio excepto `name` y `damage`.

Campos canónicos confirmados:

| Campo | Tipo | Notas |
|---|---|---|
| `name` | string | Obligatorio. Clave semántica del modo de ataque |
| `damage` | object | Obligatorio. `{ [damageType]: number }` + `total` |
| `speed` | number | Fire rate (ranged) o attack speed (melee) |
| `crit_chance` | number | Entero (ej. 12 = 12%). Normalizar a decimal en mapeo |
| `crit_mult` | number | Multiplicador (ej. 1.6) |
| `status_chance` | number | Entero (ej. 6 = 6%). Normalizar a decimal en mapeo |
| `shot_type` | string | Tipo de proyectil (ej. "Hit-Scan", "Projectile", "AoE", "Thrown") |
| `flight` | number | Velocidad del proyectil (m/s). Campo canónico |
| `shot_speed` | number | Alias redundante de `flight`. Ver gap §5.1 |
| `charge_time` | number | Tiempo de carga (bows, snipers, gunblades, glaives) |
| `falloff` | object | `{ start, end, reduction }` — ranged con caída de daño y AoE melee |
| `slide` | string | Valor de daño del slide attack (solo melee Normal Attack) |

---

## 3. Análisis por tipo de arma

> Todos los ejemplos son datos reales extraídos de `@wfcd/items` en tiempo de auditoría.

### 3.1 Primary — Rifle (Braton)

El Braton tiene Incarnon en la fuente — sus attacks incluyen el modo Incarnon.

```json
[
  {
    "name": "Normal Attack",
    "speed": 8.75,
    "crit_chance": 12,
    "crit_mult": 1.6,
    "status_chance": 6,
    "shot_type": "Hit-Scan",
    "damage": { "impact": 7.92, "slash": 8.16, "puncture": 7.92 }
  },
  {
    "name": "Incarnon Form",
    "speed": 5,
    "crit_chance": 30,
    "crit_mult": 3,
    "status_chance": 12,
    "shot_type": "Hit-Scan",
    "damage": { "impact": 20, "slash": 28, "puncture": 2 }
  },
  {
    "name": "Incarnon Form AoE",
    "speed": 5,
    "crit_chance": 30,
    "crit_mult": 3,
    "status_chance": 12,
    "shot_type": "AoE",
    "falloff": { "start": 0, "end": 3, "reduction": 0.1 },
    "damage": { "heat": 50 }
  }
]
```

Top-level: `magazineSize: 45`, `reloadTime: 2`, `multishot: 1`, `accuracy: 28.57`, `noise: "Alarming"`, `trigger: "Auto"`, `fireRate: 8.75`.

Nota: `fireRate` top-level coincide con `speed` del Normal Attack — es el valor base del arma.

### 3.2 Primary — Bow (Dread)

El Dread tiene Incarnon. El attack Incarnon se llama `"Incarnon Form Charged Shot"` (no `"Incarnon Form"` genérico).

```json
[
  {
    "name": "Uncharged Shot",
    "speed": 1,
    "crit_chance": 50,
    "crit_mult": 2,
    "status_chance": 20,
    "shot_type": "Projectile",
    "shot_speed": 85,
    "flight": 85,
    "damage": { "impact": 16.8, "slash": 134.4, "puncture": 16.8 }
  },
  {
    "name": "Charged Shot",
    "speed": 1,
    "crit_chance": 50,
    "crit_mult": 2,
    "status_chance": 20,
    "charge_time": 0.5,
    "shot_type": "Projectile",
    "shot_speed": 100,
    "flight": 100,
    "damage": { "impact": 16.8, "slash": 302.4, "puncture": 16.8 }
  },
  {
    "name": "Incarnon Form Charged Shot",
    "speed": 1.5,
    "crit_chance": 50,
    "crit_mult": 3,
    "status_chance": 30,
    "charge_time": 0.6,
    "shot_type": "Projectile",
    "shot_speed": 0,
    "damage": { "impact": 100, "slash": 100, "heat": 200 }
  }
]
```

Observaciones:
- `shot_speed` y `flight` coexisten con el mismo valor en Uncharged y Charged Shot.
- El Incarnon Form tiene `shot_speed: 0` sin `flight` — ver gap §5.1.
- El Incarnon no tiene `"Uncharged Shot"` propio — solo reemplaza el Charged Shot.

### 3.3 Primary — Shotgun (Tigris)

```json
[
  {
    "name": "Normal Attack",
    "speed": 2,
    "crit_chance": 10,
    "crit_mult": 2,
    "status_chance": 16.8,
    "shot_type": "Hit-Scan",
    "falloff": { "start": 10, "end": 20, "reduction": 0.5238 },
    "damage": { "impact": 21, "slash": 168, "puncture": 21 }
  }
]
```

`multishot: 5` en top-level del arma — no en el attack.
El Tigris tiene `falloff` en su Normal Attack (shotgun con caída de daño).

### 3.4 Primary — Launcher (Ogris)

El Ogris no tiene un `"Normal Attack"` genérico. Sus attacks son el impacto y la explosión por separado.

```json
[
  {
    "name": "Rocket Impact",
    "speed": 1.5,
    "crit_chance": 5,
    "crit_mult": 2,
    "status_chance": 35,
    "charge_time": 0.3,
    "shot_type": "Projectile",
    "shot_speed": 60,
    "flight": 60,
    "damage": { "blast": 100 }
  },
  {
    "name": "Rocket Explosion",
    "speed": 1.5,
    "crit_chance": 5,
    "crit_mult": 2,
    "status_chance": 35,
    "shot_type": "AoE",
    "falloff": { "start": 0, "end": 7.1, "reduction": 0.8 },
    "damage": { "blast": 600 }
  }
]
```

Confirma que los nombres de attack son semánticos y específicos por arma — no hay un esquema fijo de nombres.

### 3.5 Primary — Sniper (Lanka)

El Lanka no tiene `"Normal Attack"`. Sus attacks son los modos de carga.

```json
[
  {
    "name": "Partially Charged Shot",
    "crit_chance": 20,
    "crit_mult": 2,
    "status_chance": 25,
    "charge_time": 0.3,
    "shot_type": "Projectile",
    "shot_speed": 200,
    "flight": 200,
    "falloff": { "start": 400, "end": 600, "reduction": 0.5 },
    "damage": { "electricity": 200 }
  },
  {
    "name": "Charged Shot",
    "crit_chance": 25,
    "crit_mult": 2,
    "status_chance": 25,
    "charge_time": 1,
    "shot_type": "Projectile",
    "shot_speed": 250,
    "flight": 250,
    "damage": { "electricity": 525 }
  }
]
```

Nota: `speed` está ausente en ambos attacks del Lanka — confirma que ningún campo es obligatorio excepto `name` y `damage`.

### 3.6 Secondary — Pistol (Lex)

El Lex tiene Incarnon. El Incarnon Form tiene `shot_speed: 0` sin `flight`.

```json
[
  {
    "name": "Normal Attack",
    "speed": 1.08,
    "crit_chance": 20,
    "crit_mult": 2,
    "status_chance": 10,
    "shot_type": "Hit-Scan",
    "damage": { "impact": 13, "slash": 13, "puncture": 104 }
  },
  {
    "name": "Incarnon Form",
    "speed": 0.67,
    "crit_chance": 30,
    "crit_mult": 3,
    "status_chance": 22,
    "shot_type": "Projectile",
    "shot_speed": 0,
    "damage": { "impact": 300, "radiation": 700 }
  }
]
```

### 3.7 Secondary — Throwing (Kunai)

El Kunai tiene Incarnon. El Incarnon Form mantiene `flight` y `shot_speed` con el mismo valor.

```json
[
  {
    "name": "Normal Attack",
    "speed": 3.33,
    "crit_chance": 8,
    "crit_mult": 1.6,
    "status_chance": 8,
    "shot_type": "Projectile",
    "shot_speed": 70,
    "flight": 70,
    "damage": { "impact": 4.6, "slash": 6.9, "puncture": 34.5 }
  },
  {
    "name": "Incarnon Form",
    "speed": 3.33,
    "crit_chance": 18,
    "crit_mult": 2,
    "status_chance": 16,
    "shot_type": "Projectile",
    "shot_speed": 70,
    "flight": 70,
    "damage": { "impact": 8, "slash": 18, "puncture": 14 }
  }
]
```

### 3.8 Secondary — Dual Pistols (Aklex)

El Aklex tiene un solo attack `"Normal Attack"`. `multishot: 1` en top-level (no tiene multishot real).

```json
[
  {
    "name": "Normal Attack",
    "speed": 1.58,
    "crit_chance": 20,
    "crit_mult": 2,
    "status_chance": 10,
    "shot_type": "Hit-Scan",
    "damage": { "impact": 13, "slash": 13, "puncture": 104 }
  }
]
```

### 3.9 Melee — Sword (Skana)

Melee estándar: `"Normal Attack"`, `"Slam Attack"`, `"Heavy Slam Attack"`.

> Corrección: el tercer attack NO es `"Slam Radial Attack"` — es `"Heavy Slam Attack"` en todos los melee estándar.

```json
[
  {
    "name": "Normal Attack",
    "speed": 0.833,
    "crit_chance": 5,
    "crit_mult": 1.5,
    "status_chance": 16,
    "damage": { "impact": 18, "slash": 84, "puncture": 18 },
    "slide": "75"
  },
  {
    "name": "Slam Attack",
    "speed": 0.833,
    "crit_chance": 5,
    "crit_mult": 1.5,
    "status_chance": 10,
    "shot_type": "AoE",
    "falloff": { "start": 0, "end": 7, "reduction": 0.5 },
    "damage": { "impact": 240 }
  },
  {
    "name": "Heavy Slam Attack",
    "speed": 0.833,
    "crit_chance": 5,
    "crit_mult": 1.5,
    "status_chance": 10,
    "shot_type": "AoE",
    "falloff": { "start": 0, "end": 8, "reduction": 0.3 },
    "damage": { "blast": 360 }
  }
]
```

`slideAttack top-level: 120` vs `slide: "75"` en Normal Attack — ver gap §5.2.

Nota: el Skana base no tiene Incarnon en `attacks[]` — solo 3 attacks estándar.

### 3.10 Melee — Dual Swords / Whip / Nikana / Heavy Blade

Estructura idéntica a Sword: `"Normal Attack"` + `"Slam Attack"` + `"Heavy Slam Attack"`.
Confirmado en: Gram (Heavy Blade), Atterax (Whip), Dragon Nikana.

### 3.11 Melee — Glaive (Glaive)

El más complejo. Incluye attacks de lanzamiento con `flight` y explosiones separadas.

```
Normal Attack       — melee estándar con slide
Throw               — shot_type: "Thrown", flight: 20
Throw Bounce Explosion    — shot_type: "AoE", falloff
Throw Recall Explosion    — shot_type: "AoE", falloff
Charged Throw       — charge_time: 1.2, shot_type: "Thrown", flight: 35
Charged Throw Bounce Explosion  — shot_type: "AoE", falloff
Charged Throw Recall Explosion  — shot_type: "AoE", falloff
Slam Attack         — shot_type: "AoE", falloff
Heavy Slam Attack   — shot_type: "AoE", falloff
```

Total: 9 attacks. Los Charged Throw heredan `charge_time` en los attacks de explosión también.

### 3.12 Melee — Gunblade (Redeemer)

```json
[
  {
    "name": "Normal Attack",
    "speed": 0.833,
    "crit_chance": 10,
    "crit_mult": 1.8,
    "status_chance": 22,
    "damage": { "impact": 18, "slash": 126, "puncture": 36 },
    "slide": "360"
  },
  {
    "name": "Ranged Attack",
    "speed": 1,
    "crit_chance": 10,
    "crit_mult": 1.8,
    "status_chance": 6.6,
    "charge_time": 0.4,
    "shot_type": "Hit-Scan",
    "falloff": { "start": 10, "end": 20, "reduction": 0.8333 },
    "damage": { "blast": 30 }
  },
  { "name": "Slam Attack", ... },
  { "name": "Heavy Slam Attack", ... }
]
```

El Ranged Attack del Redeemer es `"Hit-Scan"` (no `"Projectile"` como se documentó antes).

### 3.13 Melee — Zenistar (Heavy Blade con mecánica especial)

El Zenistar no tiene `"Heavy Attack"` ni `"Heavy Attack Disc"` en `attacks[]`.
Su mecánica especial se expresa con attacks propios del disco.

```
Normal Attack           — melee estándar con slide
Attacks While Disc Deployed — ataque melee alternativo cuando el disco está activo
Disc Impact             — charge_time: 1.1, impacto del disco
Disc Explosion          — charge_time: 1.1, shot_type: "AoE", explosión del disco
Disc Aura               — shot_type: "AoE" (sin shot_type explícito), aura continua
Slam Attack             — shot_type: "AoE", falloff
Heavy Slam Attack       — shot_type: "AoE", falloff
```

`heavyAttackDamage top-level: 1788` — el Heavy Attack directo (no slam) solo existe en top-level.
`slideAttack top-level: 596` vs `slide: "260"` en Normal Attack — gap §5.2.

### 3.14 Melee — Argo & Vel (Heavy Attack en `attacks[]`)

```
Normal Attack
Heavy Attack Glaive       — Heavy Attack directo en attacks[]
Heavy Attack Glaive AoE   — AoE del Heavy Attack
Slam Attack
Heavy Slam Attack
```

Confirma que solo armas con mecánicas especiales tienen Heavy Attack en `attacks[]`.

---

## 4. Incarnon — Análisis

Los Incarnon no introducen campos nuevos en `attacks[]`. Solo añaden attacks adicionales.
El nombre del attack Incarnon varía por arma — no es siempre `"Incarnon Form"`.

| Arma | Nombre del attack Incarnon |
|---|---|
| Braton | `"Incarnon Form"` + `"Incarnon Form AoE"` |
| Dread | `"Incarnon Form Charged Shot"` |
| Lex | `"Incarnon Form"` |
| Kunai | `"Incarnon Form"` |

El Skana base no tiene Incarnon en `attacks[]` (solo 3 attacks estándar).

Casos con `shot_speed: 0` sin `flight` en Incarnon Form:
- Dread `"Incarnon Form Charged Shot"` — `shot_speed: 0`, sin `flight`
- Lex `"Incarnon Form"` — `shot_speed: 0`, sin `flight`

---

## 5. Gaps documentados

> Estos gaps son observaciones sobre inconsistencias en `@wfcd/items`.
> **No se harán cambios ni overrides para ninguno de estos gaps.**
> Se documentan para referencia y para informar decisiones futuras si el gap tiene impacto real en la UI o lógica.

### Gap 5.1 — `shot_speed` vs `flight` (alias redundante)

`shot_speed` y `flight` contienen el mismo valor cuando ambos están presentes.
`flight` es el campo canónico según la estructura de la fuente.
`shot_speed` es un alias legacy que coexiste en algunos attacks.

Casos con `shot_speed: 0` sin `flight` (proyectiles instantáneos o sin velocidad real):
- Dread `"Incarnon Form Charged Shot"` — `shot_speed: 0`, sin `flight`
- Lex `"Incarnon Form"` — `shot_speed: 0`, sin `flight`
- Angstrum Incarnon Form, Catabolyst Partial Reload Impact, Despair Incarnon Form (confirmados en análisis previo)

Decisión de mapeo: usar `flight` como campo canónico. Si `flight` está ausente y `shot_speed > 0`, usar `shot_speed` como fallback. Si `shot_speed === 0` y `flight` está ausente, el campo es `null`.

### Gap 5.2 — `slide` (string) vs `slideAttack` (number) en melee

`slide` existe en `attacks[].Normal Attack` como string con el valor de daño.
`slideAttack` existe en top-level del arma como number.

Valores inconsistentes confirmados:

| Arma | `attacks[0].slide` | `slideAttack` top-level |
|---|---|---|
| Skana | `"75"` | `120` |
| Cadus | `"170"` | `130` |
| Zenistar | `"260"` | `596` |

No hay campo universalmente canónico — ambos pueden estar desactualizados en casos específicos.
Es un gap real en `@wfcd/items`, no un error de mapeo local.

### Gap 5.3 — `heavyAttackDamage` top-level vs `attacks[]`

Para armas melee estándar, el Heavy Attack directo (no slam) solo existe en top-level como `heavyAttackDamage`.
Solo aparece en `attacks[]` para armas con mecánicas especiales (Argo & Vel, Zenistar, Arum Spinosa, Quassus).

Esto significa que la mayoría de armas melee no tienen su Heavy Attack representado en `attacks[]`.
El top-level `heavyAttackDamage` es la única fuente para el caso estándar.

### Gap 5.4 — `speed` ausente en algunos attacks

Lanka: ninguno de sus attacks tiene `speed`.
Confirma que `speed` es opcional — el mapeo debe tratarlo como `?? null`.

### Gap 5.5 — `punchThrough` no expuesto en `attacks[]`

Armas con punch through de base (Nataruk, Dread Charged Shot, Glaive Charged Throw, etc.) no tienen este dato en `attacks[]` de `@wfcd/items`. La fuente simplemente no lo expone por attack — confirmado exhaustivamente: ningún attack de ningún arma tiene `punchThrough` en `@wfcd/items`.

La wiki oficial (wiki.warframe.com) sí lo incluye en su JSON interno por attack, pero es un formato diferente al de `@wfcd/items`.

Si en el futuro se necesita punch through por attack, requeriría un override manual similar a `ability-stats.json`, con referencia a la wiki como fuente.

### Gap 5.6 — Nataruk: tres attacks con mecánica de "Perfect Shot"

El Nataruk es un bow con mecánica especial — tiene 3 attacks en lugar de los 2 estándar:
- `"Quick Shot"` — disparo rápido sin carga (`speed: 0.667`, `flight: 140`)
- `"Charged Shot"` — carga estándar (`charge_time: 1`, `flight: 70`)
- `"Perfect Shot"` — carga perfecta (`charge_time: 0.7`, stats superiores, mismos daños que Charged Shot)

El punch through infinito del Nataruk no está representado en `attacks[]` — es un gap §5.5.
Confirma que los nombres de attack son completamente semánticos y específicos por arma.

---

## 6. Problemas identificados en `generate-data.mjs`

### 6.1 Desnormalización incorrecta en `mapAttack`

`mapAttack` copia campos del arma padre a cada attack:
```js
magazine:  parentWeapon?.magazineSize  ?? null,
reload:    parentWeapon?.reloadTime    ?? null,
multishot: parentWeapon?.multishot     ?? null,
accuracy:  parentWeapon?.accuracy      ?? null,
noise:     parentWeapon?.noise         ?? null,
trigger:   parentWeapon?.trigger       ?? null,
```

Estos campos pertenecen al arma, no al ataque. Ya existen en top-level de `Weapon`.
La UI debe leerlos directamente de `Weapon`, no de cada `WeaponAttack`.

### 6.2 Campos inventados que no existen en la fuente

```js
pelletCount:  a.pellet?.count  ?? null,  // pellet no existe en attacks[] — siempre null
aoeRadius:    a.radius         ?? null,  // radius no existe en attacks[] — siempre null
punchThrough: a.punchThrough   ?? null,  // no existe en attacks[] de @wfcd/items — siempre null
```

Los tres siempre producen `null`. Deben eliminarse del mapeo y del tipo.

Nota sobre `punchThrough`: la wiki oficial (wiki.warframe.com) expone un JSON interno propio que sí incluye `PunchThrough` en algunos attacks (ej. Dread Charged Shot: 2.5, Glaive Charged Throw: 1). Sin embargo, `@wfcd/items` — la fuente primaria del proyecto — **no expone este campo en `attacks[]`** en ningún arma (confirmado exhaustivamente). El punch through de base de un arma no está en `attacks[]` en esta fuente.

El punch through de base existe en algunas armas (Nataruk, Dread Charged Shot, etc.) pero `@wfcd/items` no lo expone por attack. Es un gap de la fuente, no un campo a inventar.

### 6.3 `flight` no se mapea — se usa `shot_speed` en su lugar

```js
shot_speed: a.shot_speed ?? null,  // alias legacy
// flight: a.flight ?? null,       // campo canónico — no mapeado
```

`flight` es el campo canónico. El mapeo correcto es:
```js
flight: a.flight ?? (a.shot_speed > 0 ? a.shot_speed : null),
```

### 6.4 `slide` y `charge_time` no se mapean

Campos que existen en la fuente y no se mapean:
- `slide` — daño del slide attack (melee Normal Attack), tipo string
- `charge_time` — tiempo de carga (bows, snipers, gunblades, glaives)

---

## 7. Problemas identificados en `types.ts` — `WeaponAttack`

### 7.1 Campos desnormalizados del arma padre

```ts
magazine?: number | null      // pertenece a Weapon
reload?: number | null        // pertenece a Weapon
multishot?: number | null     // pertenece a Weapon
accuracy?: number | null      // pertenece a Weapon
noise?: string | null         // pertenece a Weapon
trigger?: string | null       // pertenece a Weapon
```

### 7.2 Campos inventados

```ts
pelletCount?: number | null   // no existe en la fuente
aoeRadius?: number | null     // no existe en la fuente
punchThrough?: number | null  // no existe en attacks[] de @wfcd/items (ver gap §5.5)
```

### 7.3 Redundancia `shot_speed` / `flight`

Ambos están en el tipo. Solo `flight` es canónico (ver gap §5.1).

### 7.4 Campos faltantes

```ts
slide?: string | null         // falta — melee Normal Attack
charge_time?: number | null   // falta — bows, snipers, gunblades, glaives
```

---

## 8. Estado de la UI — `attack-profile-panel.tsx`

### 8.1 Labels hardcodeados en español

```tsx
<StatRow label="CADENCIA" value={nf.format(attack.speed)} />
<StatRow label="PROB. CRÍTICA" value={pf(attack.crit_chance)} />
<StatRow label="CARGADOR" value={nf.format(attack.magazine)} />
```

Labels en español directamente en JSX, sin pasar por i18n.

### 8.2 Dependencia de campos desnormalizados

El componente lee `attack.magazine`, `attack.reload`, `attack.multishot`, etc.
Cuando se corrija `WeaponAttack`, el componente deberá recibir `weapon` + `attack`.

### 8.3 `isMelee` como prop manual

El componente recibe `isMelee` como prop booleana en lugar de derivarlo del `weapon.kind`.

---

## 9. Arquitectura de capas — pendiente de aprobación

```
@wfcd/items
    ↓
generate-data.mjs  ← mapeo fiel a la fuente, sin desnormalización
    ↓
weapons.json       ← JSON puro, estructura canónica
    ↓
types.ts           ← solo tipos de datos, sin conveniencias de UI
    ↓
[capa de mapeo]    ← dato crudo → StatEntry[] ordenado (item-details.ts o similar)
    ↓
i18n/              ← labels por locale
    ↓
componentes UI     ← solo renderizan StatEntry[], no conocen la fuente
```

Decisiones pendientes de confirmar antes de implementar:
- Cómo manejar `heavyAttackDamage` top-level en la UI (no está en `attacks[]` para armas estándar)
- Si `slideAttack` top-level se usa como fallback cuando `slide` en `attacks[]` es inconsistente
- Estructura de la capa de mapeo (hook vs función pura vs clase)

---

## 10. Próximos pasos

1. Aprobación de este documento
2. Corrección de `WeaponAttack` en `types.ts` — eliminar campos desnormalizados e inventados, añadir `slide` y `charge_time`
3. Corrección de `mapAttack` en `generate-data.mjs` — mapeo fiel a la fuente
4. Regenerar `weapons.json`
5. Actualizar `attack-profile-panel.tsx` para recibir `weapon` + `attack`
6. Definir capa de mapeo (i18n + orden de stats)

---

## 11. Análisis post-refactor — campos pendientes

> Datos verificados con `@wfcd/items` en tiempo de análisis (2026-03-18).
> Todos los valores son reales extraídos de la fuente.

### 11.1 `disposition` — entero 1-5

Valores únicos en la fuente: `[1, 2, 3, 4, 5]` — entero, no decimal.

La wiki muestra disposition como decimal (ej. 1.35) en su infobox, pero ese es el valor de presentación calculado a partir del entero. `@wfcd/items` expone el entero directamente.

Muestras reales:
- Acceltra: `1`, Ack & Brunt: `5`, Aegrit: `3`

Conclusión: el tipo actual `disposition?: number` es correcto. El entero 1-5 es el dato canónico. La conversión a decimal de presentación (si se necesita) ocurre en la capa de Traducción, no en el JSON.

### 11.2 `introduced` — siempre objeto en la fuente

Tipos encontrados en 624 weapons:
- Objeto `{ name, url, aliases, parent, date }`: 587 armas
- `null`: 37 armas
- String: 0 armas

El objeto tiene esta estructura:
```json
{
  "name": "Update 25.7",
  "url": "https://wiki.warframe.com/w/Update_25%23Update_25.7",
  "aliases": ["25.7", "Saint of Altra"],
  "parent": "25.7",
  "date": "2019-08-29"
}
```

`generate-data.mjs` normaliza con `raw.introduced?.name ?? raw.introduced ?? null` — esto colapsa el objeto a solo el string `name` (ej. `"Update 25.7"`). Es correcto para el uso actual (display).

Si en el futuro se necesita `date` o `aliases`, habría que cambiar el mapeo para preservar el objeto completo o extraer campos adicionales.

Conclusión: el mapeo actual es correcto para el uso de display. El tipo `introduced?: string` en `Weapon` es correcto dado el mapeo actual.

### 11.3 `damage` top-level vs `attacks[0].damage`

Para armas con un solo attack (ej. Braton, Lex), `totalDamage` top-level coincide con `attacks[0].damage.total`.

Para armas con múltiples attacks donde el primero NO es el "Normal Attack" principal, hay discrepancias:

| Arma | `totalDamage` top | `attacks[0].name` | `attacks[0].total` |
|---|---|---|---|
| Acceltra | 70 | "Rocket Impact" | (impacto, no explosión) |
| Aegrit | 806 | "Direct Hit" | (impacto directo) |
| Angstrum | 450 | "Single Rocket Impact" | (un cohete) |
| Astilla | 190 | "Slug Impact" | (impacto del slug) |

Conclusión: `totalDamage` top-level NO es siempre igual a `attacks[0].damage.total`. Para launchers y armas con mecánicas especiales, `totalDamage` top-level puede representar el daño combinado o el daño del modo principal. No es un campo confiable para cálculo — el builder debe usar `attacks[].damage` directamente.

El campo `damage` top-level (mapa de tipos) tiene la misma limitación. Para el builder, la fuente de verdad es `attacks[]`.

### 11.4 `criticalChance` / `procChance` top-level vs `attacks[].crit_chance` / `status_chance`

Datos reales (top-level en decimal, attacks[] en entero):

| Arma | `criticalChance` top | `attacks[0].crit_chance` | `procChance` top | `attacks[0].status_chance` |
|---|---|---|---|---|
| Acceltra | 0.31999999 | 32 | 0.060000002 | 6 |
| Acceltra Prime | 0.34 | 34 | 0.18000001 | 18 |
| Ack & Brunt | 0.20 | 20 | 0.10000002 | 10 |
| Acrid | 0.050000001 | 5 | 0.10000002 | 10 |

Observaciones:
- Top-level ya está en decimal (0.32 = 32%) — leve imprecisión de float (0.31999999)
- `attacks[].crit_chance` está en entero (32) — `generate-data.mjs` normaliza a decimal dividiendo por 100
- Para armas con un solo attack, top-level y `attacks[0]` son equivalentes (misma fuente)
- Para armas con múltiples attacks (Incarnon, launchers), el top-level corresponde al primer attack o al modo principal

Conclusión: el mapeo actual en `generate-data.mjs` es correcto — `crit_chance / 100` y `status_chance / 100`. El top-level `criticalChance` y `procChance` son redundantes con `attacks[0]` para armas simples. Para el builder, usar `attacks[].crit_chance` (ya normalizado a decimal en el JSON).

### 11.5 `slideAttack` top-level vs `slide` en `attacks[]`

Discrepancias confirmadas (5 armas):

| Arma | `slideAttack` top | `attacks[0].slide` |
|---|---|---|
| Cadus | 130 | "170" |
| Coda Caustacyst | 570 | "520" |
| Coda Pathocyst | 540 | "524" |
| Skana | 120 | "75" |
| Zenistar | 596 | "260" |

Para la mayoría de armas melee (619 de 624), los valores coinciden. Las 5 discrepancias son armas donde `@wfcd/items` tiene datos inconsistentes entre los dos campos.

No hay un campo universalmente canónico — es un gap real de la fuente (documentado en §5.2).

Para el builder: usar `attacks[].slide` cuando esté disponible (es el valor por attack). `slideAttack` top-level como referencia secundaria.

### 11.6 `heavyAttackDamage` top-level

- 218 armas melee tienen `heavyAttackDamage` en top-level
- Solo 3 armas tienen "Heavy Attack" (no slam) en `attacks[]`: Argo & Vel, y 2 más con mecánicas especiales

Confirma el gap §5.3: para la gran mayoría de armas melee, el Heavy Attack directo solo existe en top-level. El builder debe leer `weapon.heavyAttackDamage` directamente para este caso.

### 11.7 `tags[]` — valores reales

Top 20 tags por frecuencia:

| Tag | Count |
|---|---|
| Tenno | 191 |
| Prime | 98 |
| Grineer | 89 |
| Corpus | 72 |
| Infested | 43 |
| Vaulted | 38 |
| Kuva Lich | 18 |
| Syndicate | 18 |
| Baro | 16 |
| Tenet | 15 |
| Sentient | 14 |
| Never Vaulted | 12 |
| Vandal | 10 |
| Wraith | 10 |
| Prisma | 10 |
| Duviri | 9 |
| Incarnon | 8 |
| Technocyte Coda | 6 |
| Entrati | 6 |
| Zariman | 5 |

Los tags son strings libres — no hay un enum fijo. Sirven para:
- Filtrado por facción (Tenno, Grineer, Corpus, Infested, Sentient)
- Filtrado por variante (Prime, Vandal, Wraith, Prisma, Kuva Lich, Tenet)
- Filtrado por disponibilidad (Vaulted, Never Vaulted, Baro)
- Filtrado por origen (Syndicate, Duviri, Zariman, Entrati)
- Identificar Incarnon (tag "Incarnon" — solo 8 armas tienen el tag, pero más tienen attacks Incarnon)

Nota: el tag "Incarnon" no es exhaustivo — armas como Braton, Dread, Lex tienen attacks Incarnon pero pueden no tener el tag. Para detectar Incarnon de forma confiable, verificar `attacks[].name` que contenga "Incarnon".

---

## 12. Resumen de decisiones

| Campo | Fuente canónica | Uso en builder | Notas |
|---|---|---|---|
| `disposition` | Top-level (entero 1-5) | `weapon.disposition` | Correcto en tipos y mapeo |
| `introduced` | Top-level (string tras mapeo) | Display only | Mapeo actual colapsa a `.name` |
| `damage` top-level | No confiable para cálculo | No usar | Usar `attacks[].damage` |
| `totalDamage` top-level | No confiable para cálculo | No usar | Usar suma de `attacks[].damage` |
| `criticalChance` top-level | Redundante con `attacks[0]` | `attacks[].crit_chance` | Ya normalizado a decimal |
| `procChance` top-level | Redundante con `attacks[0]` | `attacks[].status_chance` | Ya normalizado a decimal |
| `slideAttack` top-level | Inconsistente en 5 armas | Referencia secundaria | Preferir `attacks[].slide` |
| `heavyAttackDamage` top-level | Única fuente para melee estándar | `weapon.heavyAttackDamage` | No está en `attacks[]` |
| `tags[]` | Strings libres | Filtrado/display | No usar para detectar Incarnon |
