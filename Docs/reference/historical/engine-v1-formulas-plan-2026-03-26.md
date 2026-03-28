# Engine V1 - Plan de implementacion de formulas con datos canonicos (2026-03-26)

> Estado: referencia historica
> Rol: snapshot del plan de formulas v1 previo al cierre del vertical slice minimo
> Fuente de verdad de: trazabilidad de decisiones y referencias usadas en ese corte
> No usar para: backlog operativo actual del builder engine
> Ultima actualizacion: 2026-03-28

> **Nota 2026-03-28**: este archivo queda como snapshot. La lectura operativa actual del
> builder vive en `Docs/features/builder-engine/status.md` y `Docs/domains/engine/architecture.md`.

> Archivo temporal de trabajo del corte 2026-03-26. Las decisiones relevantes ya no migran
> a `questions.md` porque ese documento fue retirado; su reflejo operativo vive hoy en
> `status.md` y en los domains del engine.

## Decisiones cerradas

### Fuente de datos
- Catalogo real cargado en runtime (`fetchWarframes`, `fetchWeapons`, `fetchMods`, `mod-stats.override.json`).
- Fixtures derivados de datos reales (uniqueName, no nombre visible) para validar casos base reproducibles.
- Resolucion siempre por `uniqueName` internamente; el nombre solo se usa para UI o busqueda inicial.

### Casos de calculo
- Capa rapida: presets existentes (Rhino/Nova/Volt), buenos para iterar.
- Capa canonica: 10-15 builds simples y estables para detectar regresiones.
- "Facil de calcular" = sin condiciones temporales, sin stacks dinamicos, mods de efecto directo.

### Arcanos y mods
- Subset minimo v1: arcanos y mods de bonus directo y estatico.
- Excluidos por ahora: stacks por kill/hit, activacion condicional compleja, ventanas temporales.
- Lista de soportados y excluidos debe quedar explicita en el codigo (comentario/tipo).

### UI textual
- Breakdown visible: `base` / `mod` / `arcano` / `final` por stat.
- Export JSON del build: `uniqueNames` + `ranks` + `contexto` + `resultado` + version de dataset.

### Arquitectura de formulas
- Dos capas:
  - Capa de primitivas canonicas compartidas (matematica pura, sin acoplar a canal).
  - Capa de adaptadores por canal de aplicacion (weapon, warframe, ability, arcane).
- Regla: crit y status NO son exclusivos de armas. La matematica base es primitiva; el canal define
  como se aplica (evidencia: Gyre habilita crit de habilidades via Passive + Cathode Grace;
  habilidades pueden aplicar estados; wiki `Critical_Hit` confirma excepciones documentadas).
- No se separa "por tipo de entidad" como limite rigido. Se separa por canal de aplicacion.

### Referencias canonicas usadas para cerrar las decisiones
- `Docs/reference/wiki/mechanics/critical-hits.md`
- `Docs/reference/wiki/mechanics/multishot.md`
- `Docs/reference/wiki/mechanics/damage-types.md`
- `Docs/reference/wiki/mechanics/condition-overload.md`
- `Docs/domains/engine/formula-overview.md`
- `Docs/domains/data/abilities/formula-patterns.md`
- `Docs/domains/data/weapons/source-model.md`
- `https://wiki.warframe.com/w/Critical_Hit`
- `https://wiki.warframe.com/w/Damage/Calculation`
- `https://wiki.warframe.com/w/Multishot`
- `https://wiki.warframe.com/w/Condition_Overload_(Mechanic)`
- `https://wiki.warframe.com/w/Gyre/Abilities` (evidencia de crit en habilidades)

---

## Estructura de archivos objetivo

```
Project/src/features/arsenal/engine/
  index.ts                        <- orquestador principal (ya existe, se refactoriza)
  formulas/
    common/
      crit-base.ts                <- crit chance, tier, multiplicador promedio
      status-base.ts              <- proc weight por tipo, status chance
      scaling-base.ts             <- additive bonus, multiplicative bonus, round/clamp
    weapon/
      weapon-crit.ts              <- aplica primitivas de crit al canal weapon
      weapon-multishot.ts         <- projectile count, beam vs pellet
      weapon-status.ts            <- breakdown de status por tipo de dano
      weapon-condition-overload.ts <- CO/GunCO por behavior de ataque
      weapon-core.ts              <- calculo central de arma usando los anteriores
    warframe/
      warframe-core.ts            <- health/shield/armor/energy/sprint con mods
    ability/
      ability-crit.ts             <- crit para habilidades con capacidad confirmada
      ability-status.ts           <- procs de habilidad (subset canonico)
    arcane/
      arcane-core.ts              <- arcanos de bonus directo y estatico (subset v1)
```

---

## Plan de implementacion por paso

### Paso 1 - Primitivas canonicas (crit-base, status-base, scaling-base)

Fuente: `critical-hits.md` (wiki interna) + `https://wiki.warframe.com/w/Critical_Hit`

Que implementar:
- `critChanceTotal(base, relativeBonus, absoluteBonus)` -> total en decimal
- `critTier(totalDecimal)` -> tier entero + chance al siguiente tier
- `averageCritMultiplier(totalDecimal, critDamage)` -> para comparacion de builds
- `additiveBonusMultiplier(bonusPct)` -> `1 + bonus/100`
- `round2(n)` / `clamp(n, min, max)` -> helpers planos

Lo que NO entra aqui: reglas de que canal puede usar crit (eso va en el adaptador).

---

### Paso 2 - weapon-core y warframe-core (adaptadores principales)

Fuente: `formula-overview.md`, `source-model.md`, `formula-patterns.md`

weapon-core:
- damage final: `baseDamage * (1 + sum(additiveMods))`
- delega crit, multishot y status a sus modulos especificos
- delega CO si el ataque tiene flag de behavior

warframe-core:
- health / shield / armor / energy / sprint
- formula: `base * (1 + sum(upgradeTypeBonuses))`
- fuente numerica: `mod-stats.override.json` via `upgradeType`

Lo que NO entra aqui todavia: breakdown por tipo de dano, ataques alternativos.

---

### Paso 3 - weapon-multishot

Fuente: `multishot.md` (wiki interna) + `https://wiki.warframe.com/w/Multishot`

Que implementar:
- `expectedProjectileCount(base, multishotModifier)` -> garantizados + chance al siguiente
- flag `isContinuous` para separar beam de projectile/pellet
- para beam: modelo de tick con multishot como escalar del tick, no como pellet extra

Lo que no entra: accuracy, spread real por distancia, casos especiales de speargun.

---

### Paso 4 - weapon-crit (adaptador weapon)

Fuente: `critical-hits.md` + `Damage/Calculation` wiki

Que implementar:
- delega a primitivas de `crit-base`
- aplica `critPerProjectile` (cada pellet hace su propia tirada)
- calcula resultado esperado por disparo usando `expectedProjectileCount`

Lo que no entra: quantization exacta, headshot por tipo de enemigo.

---

### Paso 5 - weapon-status y status-base

Fuente: `damage-types.md` (wiki interna) + `https://wiki.warframe.com/w/Status_Effect`

status-base:
- `procWeight(damageBreakdown)` -> chance de cada tipo de proc por peso de dano
- combinacion elemental: tabla canonica de pares (Heat+Cold=Blast, etc.)

weapon-status:
- `statusChanceTotal(base, relativeBonus)`
- proc esperado por disparo usando `expectedProjectileCount`
- delega combinacion elemental a `status-base`

Lo que no entra: DoT, ticks, acumulacion real de stacks sobre enemigo.

---

### Paso 6 - weapon-condition-overload

Fuente: `condition-overload.md` + `https://wiki.warframe.com/w/Condition_Overload_(Mechanic)`

Que implementar:
- flag `coStyleBehavior`: `adding` | `multiplying` | `none`
- `coBonus(perStatus, stacks, uniqueStatusCount)`
- formula para `adding`: bonus va junto a `serration` en el pool aditivo
- formula para `multiplying`: bonus es un multiplicador por fuera del pool aditivo

Lo que no entra: catalogo completo de armas, stance edge cases de melee.

---

### Paso 7 - arcane-core (subset v1)

Que implementar:
- arcanos de bonus directo sobre stats de warframe o arma sin condicion
- mismo pipeline que mods: `upgradeType` -> `bonus` -> suma al pool correspondiente
- subset explicito documentado en codigo

Lo que no entra: stacks por kill/hit, activacion condicional, procs temporales.

---

### Paso 8 - ability-crit y ability-status (incremental, solo casos canonicos)

Fuente: `https://wiki.warframe.com/w/Gyre/Abilities`, `https://wiki.warframe.com/w/Critical_Hit`

Solo entran habilidades con evidencia canonica confirmada de soporte de crit o status.
- Casos v1: Gyre (Passive + Cathode Grace habilita crit en Arcsphere/Coil Horizon/Rotorswell)
- No inventar logica para frames sin evidencia documentada.

---

### Paso 9 - Refactor de index.ts (orquestador)

- `index.ts` deja de tener logica de formula inline.
- Usa los adaptadores por canal.
- El output sigue siendo `{ final, debug }` segun contrato documentado en `output-contract.md`.
- Agrega breakdown por fuente al output: `base`, `modBonus`, `arcaneBonus`, `final` por stat.

---

### Paso 10 - UI textual (EngineV1TextView)

- Agregar renderizado del breakdown por fuente (no solo JSON crudo).
- Agregar boton de export JSON del build.
- Datos del JSON de export: uniqueNames + ranks + contexto + snapshot del resultado + version de dataset.

---

## Criterio de entrada / salida del plan

Entrada: decisiones cerradas (arriba).
Salida: `/dev/engine-v1` muestra breakdown real y exporta JSON reproducible.
No es Arsenal final. No es HUD. Es la base estable que habilita el siguiente tramo.
