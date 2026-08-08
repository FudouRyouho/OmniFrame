---
Estado: "referencia"
Rol: "Taxonomía de UpgradeType — vocabulario canónico OmniFrame D-6"
Impacto_ID: "semantic-upgrade-tokens"
Fidelidad_Fisica: "Project/src/shared/types/modifier.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-08-08"
Dependencias:
  - "Project/src/shared/types/damage.ts"
  - "docs/data/schemas/mods/mods-schema.md"
  - "docs/semantic/damage-types.md"
---

# Upgrade Token Taxonomy

## Qué hace este doc, y qué NO

**La lista de tokens vive en `Project/src/shared/types/modifier.ts`** (`UPGRADES`). Este doc **no la
replica**: replicarla es cómo se drifteaba: dos copias, una sola verificada. La regla de corte es
simple — **lo que cierra apunta al código; lo que no cierra se lista acá**. El código ya expresa lo
resuelto y sólo hay que señalarlo; lo abierto no tiene dónde existir salvo un doc.

Por eso las tablas de abajo **no llevan columnas `Engine attr` ni `Op`**: eso lo dice `modifier.ts` y
lo deriva `resolveToken()`. Lo que sí llevan —`Evidencia`, `Modelo`, `Ejemplo`, los `⚠`— es warrant
que el código no tiene: de dónde salió la definición y cuánto confiamos en ella.

## Principio de derivación

DE suministra tipos genéricos sin semántica explícita. OmniFrame los reemplaza por un token propio en
el override, y el engine lo consume **sin parsear labels**.

**Qué semántica se deriva de la taxonomía: la pertenencia, y es binaria.** El token dice a qué clase
de entidad pertenece el atributo, con qué operación entra y cuál es. Nada más. La pregunta que
responde es de sí-o-no ("¿este nodo existe en esta entidad?"), no de grado.

**Por qué sólo eso: la composición no es derivable de una clase.** Cómo se compone un efecto —si
suma con sus pares, si multiplica aparte, si escala por un contador del contexto— no se deduce de a
qué familia pertenece el stat. Dos tokens de la misma familia y la misma operación pueden componer
distinto según la mecánica que los emite. Por eso el vocabulario declara **pertenencia**, y la
composición vive en el bucket (`{cómo}`) y en las ops de familia — no en el nombre.

**Fuente de verdad de tipos de daño**: `Project/src/shared/types/damage.ts` → `DamageType`

---

## Convención D-6: `{FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`

### FAMILY

| Token | Dominio |
| :--- | :--- |
| `WEAPON_` | Arma y ataques — stats que existen en **cualquier** arma (compatibilidad por slot, no por tipo) |
| `MELEE_` | Atributos que **solo existen** en armas melee y no tienen equivalente ranged |
| `AVATAR_` | Stats del Warframe — habilidades, defensas, movilidad |
| `VEHICLE_` | K-Drive y vehículos |
| `GAMEPLAY_` | Facción, utilidades, reglas generales |

**Criterio `WEAPON_` vs `MELEE_`:** la familia declara **dónde vive el nodo**, no a quién se le
aplica un modificador (eso es la sub-familia, y expresa *target* cross-entity — ver D-6). Si el
atributo puede existir en un arma de fuego → `WEAPON_`. Si es propio del dominio melee y no tiene
contraparte ranged → `MELEE_`. La consecuencia práctica: un token `MELEE_*` que aterriza sobre una
entidad no-melee es un **error detectable**, no algo que un `if` de materialización deba silenciar.

> ⚠️ **Deuda de vocabulario:** varios tokens melee-exclusivos siguen bajo `WEAPON_` por herencia
> (`WEAPON_ADD_HEAVY_CHARGE_SPEED`, `WEAPON_BASE_HEAVY_EFFICIENCY`, `WEAPON_ADD_COMBO_DURATION`,
> `WEAPON_BASE_COMBO_INITIAL`, `WEAPON_ADD_COMBO_COUNT_CHANCE`, `WEAPON_ADD_SLAM_*`). Son deuda,
> **no norma** — no citarlos como precedente para dejar un stat melee bajo `WEAPON_`. Su migración
> es trabajo aparte.

### OPERATION — mapeo 1:1 con `Modifier.operation` del engine

| Token | Engine op | Formula bucket | Tipo de valor |
| :--- | :--- | :--- | :--- |
| `ADD` | `ADD` | `mods_add_pct` | % aditivo estándar — la gran mayoría de los mods |
| `BASE` | `BASE_FLAT` | `base_flat` | Plano pre-escala — **se amplifica** con mods `ADD` |
| `FLAT` | `ADD_FLAT` | `total_flat` | Plano post-escala — **no se amplifica** |
| `MULT` | `MULTIPLICATIVE` | `multiplicative` | % multiplicativo — stack separado del `ADD` |

Fórmula de referencia (`SimulationEngine.calculateCurrentValue()`):
```
withMods = (base + base_flat)     × (1 + mods_add_pct / 100)
val      = (withMods + total_flat) × multiplicative
```

### PREFIX / SUFFIX

- **PREFIX**: subcategoría del stat (`HEAT`, `CRIT`, `STATUS`, `ABILITY`, `FACTION`, `MELEE`, …)
- **SUFFIX**: atributo específico (`DAMAGE`, `CHANCE`, `MULT`, `SPEED`, `STRENGTH`, …)
- Sin PREFIX cuando el stat es raíz de la familia (ej: `WEAPON_ADD_DAMAGE` — daño global).

Regla de derivación elemental: `{PREFIX}` = `DamageType` en mayúsculas (`heat` → `HEAT`).

**El SUFFIX declara la NATURALEZA del stat; el PREFIX, la mecánica afectada.** No es cosmético:
`SPEED` / `VELOCITY` / `DURATION` / `HEIGHT` / `DAMAGE` son unidades distintas que componen distinto,
y dos tokens con el mismo PREFIX pueden no tener nada en común. El caso que lo fuerza es el
movimiento: sobre **la misma maniobra** (el roll), Parkour Velocity mueve la *distancia* y Dodge Speed
la *velocidad de la animación* — dos stats, dos SUFFIX, un solo PREFIX conceptual
([`../../references/wiki/mechanics/maneuvers.wikitext`](../../references/wiki/mechanics/maneuvers.wikitext),
§Rolling). Por eso el vocabulario **no necesita un campo de agrupación**: la naturaleza ya viaja en el
nombre, y agrupar por PREFIX (`PARKOUR_*`) mezclaría velocidad, duración y daño en un mismo saco.

Un token nombra el **stat como lo nombra el juego**, no la lista de mecánicas que afecta —
`AVATAR_ADD_MOVEMENT_SPEED` cubre walk + aim-walk + crouch, y `AVATAR_ADD_AIM_GLIDE_DURATION` cubre
también el wall latch (comparten timer). El alcance real lo fija un comentario en `modifier.ts`, no
un nombre más largo.

### Acuñado sin nodo — "el engine sabe QUÉ es, no lo computa"

Un token puede estar en `UPGRADES` y **no** tener nodo en ninguna entidad. Es un estado **deliberado**
y el tercero posible, no un intermedio hacia el modelado:

| | El engine… | Cómo se ve |
|---|---|---|
| Token ausente | no sabe qué es | `console.warn` en hidratación, modifier descartado |
| **Token acuñado, sin nodo** | **sabe qué es, declara que no lo modela** | modifier creado, sin dónde aterrizar |
| Token + nodo | lo computa | aparece en la salida C→D |

Sirve cuando el stat es real y está en el dato, pero no hay base conocida contra la cual verificarlo
(caso `AVATAR_ADD_SLIDE_*`). Acuñar es **darle lenguaje**, que es barato y reversible; materializar es
comprometer un modelo. ⚠️ El estado del medio **es silencioso por construcción**
(`SimulationEngine.resolveNode` hace `if (!node) return`), así que sólo se distingue del tercero si algo
lo reporta — el tripwire de `StaticHydrator` es ese reporte (`__tests__/unlanded-modifiers.test.ts`).

**Acuñar no es gratis y no es el default.** Un token acuñado es algo que un lector futuro va a encontrar
sin nodo y va a tener que re-preguntar. Se gana el lugar cuando el stat tiene corpus coherente y una
mecánica clara; **no** cuando lo único que se sabe es que existe. El residuo del eje de movimiento
—gravedad (3 usos), altura de salto, recuperación de caída, daño del jump kick, hard landing, evasión de
balas enemigas— **no se acuña**, y ya no por falta de diagnóstico: `DC-OQ-ENGINE-30` lo resuelve contra la
fuente token por token, y **este** criterio aplicado a ese diagnóstico es lo que los deja afuera. Su
`[Hydration] No se pudo mapear upgrade_type:` dice algo cierto, y nombra la fuente que lo trajo.

### `AVATAR_*` no significa "warframe" — significa el avatar del PORTADOR

El vocabulario de DE usa `AVATAR_` para **lo que el jugador encarna** (warframe · archwing · necramech),
y `VEHICLE_` para lo que **monta** (K-Drive) — Hyperion Thrusters (Archwing) lleva el mismo token crudo
que Rush. La consecuencia para el ruteo es que la familia no basta por sí sola:

- un mod **de arma** con token `AVATAR_*` buffea al warframe que la porta (Amalgam Serration → Sprint
  Speed; Dispatch Overdrive → Movement Speed) — `StaticHydrator` lo sube por familia;
- un mod **de compañero** con token `AVATAR_*` buffea al **compañero** (`Enhanced Vitality` →
  `AVATAR_ADD_HEALTH_MAX` es vida del sentinel, no del warframe). Rutearlo al warframe sería un bug peor
  que el que el salto arregla.

**El caso compañero está resuelto por la regla, no por una excepción.** El `{dónde}` se resuelve
**relativo al portador**, subiendo por el árbol de propiedad `Jugador → {warframe · compañeros · armas}`
hasta la primera entidad de esa clase (`../domains/engine/design/arch-decisions.md` §18). El warframe
**no** es padre del compañero: cuelgan del mismo nodo, así que un `AVATAR_*` montado en el compañero
resuelve **en el compañero** sin necesidad de un eje de rol. El salto limitado a portador-arma que hoy
implementa `StaticHydrator` (`holder?.domain === 'weapon'`) es la forma vieja — el propio §Frontera
negativa la nombra: *"un `if` … convierte un error detectable en uno invisible"*.

### Convención de resolución D-6 — el token **no** es el id de nodo

```
TOKEN = {dónde}_{cómo}_{qué}    "qué modifico y cómo entra"   WEAPON_BASE_CRIT_CHANCE
NODO  = {dónde}_{qué}           dónde se acumula              WEAPON_ADD_CRIT_CHANCE
```

`resolveToken()` implementa la parte **derivable** de `token → nodo`: quitar la sub-familia si la
hay. La otra parte —qué `FLAT`/`BASE` converge al nodo de su par `ADD`— **no es derivable por
sintaxis** y vive en `UPGRADE_MAP`. Los dos espacios no coinciden en ninguna dirección: hay tokens
que no son nodo (las convergencias, las variantes de sub-familia) y hay **nodos que no son token**
(`WEAPON_ADD_HEAVY_EFFICIENCY`, `WEAPON_ADD_COMBO_INITIAL`). Ver `data/decisions.md` D-7.

La sub-familia **sólo existe bajo `WEAPON`**: designa a cuál de las tres armas del warframe apunta el
efecto, y esa pregunta no tiene sentido en otra familia. `resolveToken()` lo verifica.

**Convergencias no-derivables en UPGRADE_MAP** (el token no nombra su nodo):

| Token | Motivo |
| :--- | :--- |
| `WEAPON_FIRE_ITERATIONS` | Alias del pipeline @wfcd/items — resolución OQ-ENGINE-6 |
| `WEAPON_BASE_DAMAGE` | Perk Incarnon: BASE_FLAT del atributo raíz |
| `WEAPON_BASE_CRIT_CHANCE` | Perk Incarnon: BASE_FLAT de CC |
| `WEAPON_BASE_STATUS_CHANCE` | Perk Incarnon: BASE_FLAT de SC |
| `WEAPON_BASE_MAGAZINE_MAX` | Perk Incarnon: BASE_FLAT de magazine |

---

## Vocabulario completo (UPGRADES[])

**Evidencia** (eje [EVD]: `docs/governance/deuda-taxonomy.md` · gramática de tags: `docs/governance/nomenclature-grammar.md`): cada sección declara su nivel por defecto.
Los `[ref: X]` apuntan a `references/wiki/mechanics/X`. Tokens con `⚠` requieren verificación — ver §Gate 1.

**Columna `Modelo`** — clasificación de modelado por capa de engine:

| Tag | Significado |
| :--- | :--- |
| `C1` | Atributo estándar — el bucket lo da el segmento `OPERATION` del token. El engine lo resuelve con la fórmula general. |
| `C1·F` | C1 con fórmula específica — no es un bucket estándar; requiere lógica propia en C1. |
| `C2·F` | Requiere SimulationContext o fórmula de C2 — la aplicación depende de estado de simulación (faction, combo, ability output). |
| `—` | No modelado — stat de manejo, economía o scope fuera del output de simulación (DPS / HP efectivo). Se muestra en UI como dato informativo. |

### WEAPON — daño global

> Evidencia por defecto: `[empirical]` — daño global es la mecánica más probada del juego.

| Tipo OmniFrame D-6 | Modelo | Ejemplo de mod |
| :--- | :--- | :--- |
| `WEAPON_ADD_DAMAGE` | `C1` | Serration, Hornet Strike, Pressure Point |

### WEAPON — derivados elementales y físicos

`resolveToken()` auto-deriva: **attr = token**, op = `ADD`. Sin entrada en UPGRADE_MAP (D-7b Fase 2).
> Evidencia por defecto: `[ref: damage-types.md]` para el tipo; `[empirical]` para la operación ADD.

| Tipo OmniFrame D-6 | Familia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `WEAPON_ADD_IMPACT_DAMAGE` | physical | `C1` | Heavy Trauma, Comet Blast, Rupture |
| `WEAPON_ADD_PUNCTURE_DAMAGE` | physical | `C1` | Piercing Hit, Bore, Flechette |
| `WEAPON_ADD_SLASH_DAMAGE` | physical | `C1` | Buzz Kill, Maim, Jagged Edge |
| `WEAPON_ADD_HEAT_DAMAGE` | elemental | `C1` | Hellfire, Molten Impact, Thermite Rounds |
| `WEAPON_ADD_COLD_DAMAGE` | elemental | `C1` | Cryo Rounds, Deep Freeze, North Wind |
| `WEAPON_ADD_ELECTRICITY_DAMAGE` | elemental | `C1` | Stormbringer, Convulsion, High Voltage |
| `WEAPON_ADD_TOXIN_DAMAGE` | elemental | `C1` | Infected Clip, Malignant Force, Fever Strike |
| `WEAPON_ADD_BLAST_DAMAGE` | combined | `C1` | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_CORROSIVE_DAMAGE` | combined | `C1` | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_GAS_DAMAGE` | combined | `C1` | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_MAGNETIC_DAMAGE` | combined | `C1` | Magnetic Might |
| `WEAPON_ADD_RADIATION_DAMAGE` | combined | `C1` | Containment Breach, Atomic Fallout, Radiated Reload |
| `WEAPON_ADD_VIRAL_DAMAGE` | combined | `C1` | Damzav-Vati |
| `WEAPON_ADD_VOID_DAMAGE` | special | `C1` | Xaku (añade Void a armas vía habilidad — override de arma) |
| `WEAPON_ADD_TAU_DAMAGE` | special | `C1` | Venato unique trait |
| `WEAPON_ADD_TRUE_DAMAGE` | special | `C1` | Mecánicas de ejecución (Innodem y similares) |
| `WEAPON_ADD_NONE_DAMAGE` | special | `C1` | Sentinel — no debe aparecer en overrides de producción |

> Los tipos `combined` sin mods directos (blast, corrosive, gas) se incluyen porque la misma
> semántica se reutilizará en habilidades y augments.

**Patrón reservado** (daño plano pre-escala): `WEAPON_BASE_{TYPE}_DAMAGE`. No instanciar hasta
confirmar un mod o mecánica que lo requiera.

### WEAPON — stats de disparo y crítico

`attr = token` (auto-derivado) para todos, excepto `WEAPON_FIRE_ITERATIONS` (alias).
> Evidencia por defecto: `[ref]` a la mecánica indicada por token; `[empirical]` donde no hay doc dedicado.

| Tipo OmniFrame D-6 | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `WEAPON_ADD_FIRE_RATE` | `[empirical]` | `C1` | Speed Trigger, Shred, Gunslinger — **solo armas de fuego**; el melee usa `MELEE_ADD_ATTACK_SPEED` |
| `WEAPON_ADD_MULTISHOT` | `[ref: multishot.md]` | `C1` | Split Chamber, Galvanized Chamber |
| `WEAPON_FIRE_ITERATIONS` | `[ref: multishot.md]` | `C1` | Hell's Chamber, Galvanized Hell, Barrel Diffusion — alias pipeline `@wfcd/items`; resolución formal en OQ-ENGINE-6 |
| `WEAPON_ADD_CRIT_CHANCE` | `[ref: critical-hits.md]` | `C1` | Point Strike, True Steel |
| `WEAPON_ADD_DAMAGE_PER_STATUS_TYPE` | `[ref: condition-overload.md]` | `C1·F` | Condition Overload, Galvanized Savvy/Aptitude/Shot, 8 perks incarnon. **Única op de familia alcanzable por token** — entrada propia en `UPGRADE_MAP` con op `CONDITION_OVERLOAD` y `co_factors`. El valor no es el efecto: lo computa `coBonusPct(coefBase × stacks × N)` y el bucket lo elige el `co_behavior` del ataque. Cumple la regla de frontera (su disparador ES el token); las otras 4 ops de familia se sintetizan. |
| `WEAPON_ADD_CRIT_MULT` | `[ref: critical-hits.md]` | `C1` | Vital Sense, True Steel |
| `WEAPON_ADD_STATUS_CHANCE` | `[ref: status-effects.md]` | `C1` | Infected Clip (60/60), High Voltage |
| `WEAPON_ADD_STATUS_DURATION` | `[ref: status-effects.md]` | `C1` | Lasting Sting, Continuous Misery (DE: `proc_time`) |
| `WEAPON_ADD_MAGAZINE_MAX` | `[empirical]` | `C1` | Ammo Stock, Trick Mag |
| `WEAPON_ADD_AMMO_MAX` | `[empirical]` | `—` | Ammo Drum, Ammo Chain, Shell Compression — pool total, distinto de MAGAZINE_MAX (cargador). `[ref: ammo.md]` |
| `WEAPON_ADD_RELOAD_SPEED` | `[ref: reload.md]` | `C1` | Fast Hands, Tactical Reload |
| `WEAPON_ADD_STATUS_DAMAGE` | `[empirical]` | `C1` | Rifle/Shotgun/Pistol/Melee Elementalist (+90%) |
| `WEAPON_ADD_FINISHER_DAMAGE` | `[empirical]` | `C1` | Finishing Touch, Covert Lethality |
| `WEAPON_ADD_SLAM_DAMAGE` | `[empirical]` | `C1` | Seismic Wave, Necramech Seismic Wave — daño de slam attack. Distinto de `WEAPON_ADD_SLAM_RADIUS` (radio de AoE del slam) |
| `WEAPON_ADD_HEADSHOT_MULT` | verificado | `C1` | Primary/Secondary Deadhead "+30% to Headshot Multiplier". Op ADD confirmada por usuario y por la ley: el multiplicador de la parte del cuerpo es el **base**, y los bonus **se suman entre sí** antes de multiplicar — `3 × (1 + 0.30 + 0.75)` es el ejemplo textual de la wiki. Semántica **estricta**: "headshot" aplica **sólo a la cabeza**, no a cualquier weak point (`references/wiki/mechanics/enemy-body-parts.md`) |
| `WEAPON_FLAT_STATUS_CHANCE` | `[empirical]` ⚠ | `C1·F` | Perk Incarnon (Felarx). ⚠ valor pre-dividido por base_multishot del perfil — modelado complejo, ver comentario en `modifier.ts` |
| `WEAPON_ADD_AMMO_EFFICIENCY` | `[empirical]` | `C1` | Brain Storm, Zazvat-Kar (mods); Arcane Pistoleer, Akimbo Slip Shot, Eternal Logistics, Primary Crux (arcanes). D-6 compliant; `resolveToken()` lo cubre. Reduce la tasa de consumo de munición por disparo. |

### WEAPON — puntería y movimiento de proyectil

`attr = token` (auto-derivado), op = ADD.
> Evidencia por defecto: `[empirical]` — stats de manejo conocidos; sin doc de mecánica dedicado.
> ⚠ Estos provienen de tokens crudos de DE absorbidos por el pipeline. Verificar nomenclatura DE vs D-6 en auditoría de mods.

| Tipo OmniFrame D-6 | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `WEAPON_ADD_ACCURACY` | `[ref: accuracy.md]` | `[node: WEAPON_ADD_ACCURACY]` | **32 fuentes bajo un solo token.** Cadena de rename: `WEAPON_SPREAD` (misnomer DE-legacy) → `WEAPON_ADD_ACCURACY`. Los 17 mods que llevaban el token viejo (Heavy Caliber, Vicious Spread, Narrow Barrel, Tainted Shell…) declaran `% Accuracy` en su label **y traen el signo correcto**: no hubo que invertir ni convertir, sólo renombrar — el token nombraba el mecanismo interno de DE, no el stat. Como el viejo no estaba en `UPGRADES`, los 17 gritaban en hidratación y morían ahí. Los otros 15 son perks incarnon y arcanos. **Nodo materializado:** base por ataque desde el par `min_spread`/`max_spread` (`OQ-ENGINE-7`, cuarto molde). El **efecto** —cono → probabilidad de impacto— es C2 y sigue sin modelo: el sim asume aim perfecto. |
| `WEAPON_ADD_RECOIL` | `[ref: recoil.md]` | `C1·inerte` | Camera kick post-disparo (% bidireccional: −90% a +100%). **Sin dato absoluto público** (interno de DE) → base **sintética `100`** en `getDNA()` (recoil relativo; mismo patrón que `WEAPON_ADD_RELOAD_SPEED`). Nodo **inerte** (no input de daño — camera feel) hasta definir modelado/UI → OQ-ENGINE-7 (clamp sobre-reducción, aim-vs-hip abiertos). Consumidor `lanka.test.ts` (Vile Precision). ⚠️ Stabilizer/Steady Hands no curados; los 13 mods son corrupted/duales/shotgun |
| `WEAPON_ADD_PROJECTILE_SPEED` | `[ref: projectile-speed.md]` | `C1` | Velocidad de proyectil **m/s** (% aditivo). Base = `flight` del raw, sin override. **Gate `flight != null` (ausencia ≠ 0):** nodo ausente en hitscan (instantáneo, sin proyectil); un base 0 + mod % daría velocidad espuria. Consumidor `lanka.test.ts`. Edge-case diferido: hitscan-con-falloff escala falloff-range (nodo inexistente). Terminal Velocity, Fatal Acceleration, Whirlwind |
| `WEAPON_FLAT_PUNCH_THROUGH` | `[ref: punch-through.md]` | `—` | Penetración **flat en metros** (post-escala, nunca se amplifica). Metal Auger, Seeking Force, Vigilante Offense + stats Incarnon. Cadena de rename: `WEAPON_PUNCTURE_DEPTH` (misnomer DE-legacy) → `WEAPON_ADD_PUNCH_THROUGH` (intermedio) → `WEAPON_FLAT_PUNCH_THROUGH` (segmento D-6 `FLAT` → op `ADD_FLAT` vía `resolveToken`). 10 mods + 7 stats incarnon. **Consumidor de engine `lanka.test.ts`:** nodo materializado en `getDNA()` (`override per-ataque ?? raw ?? 0`); innatos en `weapon-stats.override.json`. El valor computa en C1 (metros); la geometría de penetración es C2 (OQ-ENGINE-7 eje c, abierto). |
| `WEAPON_ADD_ZOOM` | `[empirical]` | `—` | Eagle Eye (DE: `zoom`) |

### WEAPON — melee

`attr = token` (auto-derivado). Combo y heavy attack.
> Evidencia por defecto: `[ref: melee-combo.md]` para combo; `[empirical]` para el resto.

| Tipo OmniFrame D-6 | Evidencia | Modelo | Fuente |
| :--- | :--- | :--- | :--- |
| `WEAPON_ADD_RANGE` | `[empirical]` | `—` | Reach, Primed Reach (alcance **melee**). Beam range movido a `WEAPON_ADD_BEAM_RANGE` (D-17); archgun `+% Range` (Ballista Measure) sigue aquí → OQ-DATA-7 |
| `WEAPON_ADD_BEAM_RANGE` | `[empirical]` | `—` | Alcance del rayo de armas continuas. Sinister Reach, Ruinous Extension, Sequence Burn, Galvanized Acceleration (split). Flat `+Xm` y `+%` conviven; unidad en label → OQ-DATA-8 |
| `WEAPON_ADD_SLAM_RADIUS` | `[empirical]` | `—` | Mods de slam attack radius |
| `WEAPON_ADD_HEAVY_CHARGE_SPEED` | `[empirical]` | `C1` | Corrupt Charge y similares |
| `WEAPON_ADD_COMBO_DURATION` | `[ref: melee-combo.md]` | `C1` | Body Count, Drifting Contact |
| `WEAPON_ADD_COMBO_COUNT_CHANCE` | `[empirical]` | `C1` | Exodia Triumph/Valor (arcanes), Guardian Derision (mod) — cross-schema |

### WEAPON — perks base Incarnon (BASE_FLAT)

Tokens `BASE` — planos pre-escala que se suman al `base` del atributo y se amplifican
por mods `ADD` (Serration, Hornet Strike, etc.). Fuente: `incarnon-evolutions.override.json`.
> Evidencia por defecto: `[empirical]` para la operación BASE_FLAT (modelado OmniFrame, verificado contra valores de wiki Incarnon).

| Tipo OmniFrame D-6 | Modelo | Ejemplo de perk |
| :--- | :--- | :--- |
| `WEAPON_BASE_DAMAGE` | `C1` | Boltor EVO II: +18 daño |
| `WEAPON_BASE_CRIT_CHANCE` | `C1` | Sibear EVO IV: +25% CC |
| `WEAPON_BASE_CRIT_MULT` | `C1` | Perk Incarnon: BASE_FLAT de crit damage |
| `WEAPON_BASE_STATUS_CHANCE` | `C1` | Boltor EVO IV: +20% SC |
| `WEAPON_BASE_MAGAZINE_MAX` | `C1` | Boltor EVO III: +20 magazine |
| `WEAPON_BASE_COMBO_DURATION` | `C1` | Perk melee: combo duration base |
| `WEAPON_BASE_COMBO_INITIAL` | `C1` | Melee Crescendo (arcane), perks melee |
| `WEAPON_BASE_HEAVY_EFFICIENCY` | `C1` | Perks de heavy attack efficiency |

> `WEAPON_ADD_COMBO_INITIAL` y `WEAPON_ADD_HEAVY_EFFICIENCY` son engine attrs (target de los tokens BASE),
> no tokens del vocabulario. No instanciar como `upgrade_type` sin mod/perk confirmado.

### WEAPON — sub-familia clase (D-6 extensión, activa)

Patrón extendido: `{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`.
Sin entrada en UPGRADE_MAP — `resolveToken()` los deriva automáticamente, emitiendo `target_channel`.
El ruteo por canal **está implementado**: `resolve/hydration/channel-routing.ts` resuelve `target_channel` → entidad(es) en una pasada única al final de la hidratación, agnóstica a la fuente (shard, arcano, mod). Devuelve **lista**, no valor: un canal puede alcanzar N entidades (`OQ-ENGINE-11`, exaltadas).

> **Canales válidos:** solo `PRIMARY`/`SECONDARY`/`MELEE`. **La sub-familia es el SLOT, no la clase
> del arma**, y no son lo mismo: `Rifle Amp` dice *"Rifle Damage"* y una escopeta —que es primaria—
> no lo recibe (`Shotgun Amp` existe aparte en el dataset); `Dead Eye` dice *"Sniper Rifle Damage"*,
> más angosto todavía. Mapear esos a `primary` no es aproximar: mide de más.
>
> **El eje de clase queda diferido**, y el motivo no es el vocabulario sino el schema que tendría que
> alimentarlo: `compat_name` trae 236 valores que mezclan clase de arma (`Rifle`, `Assault Rifle`,
> `Bow`), entidad (`WARFRAME`, `AURA`, `COMPANION`) y warframe individual (`Volt`, `Nezha`), y del
> lado del arma `kind`/`category`/`type`/`family` se solapan entre sí (`category` ≈ `kind` + `Misc`;
> `family` mezcla clase con linaje `prime`/`wraith`/`kuva`). Se reabre con la revisión de schema de
> `omniframe-items` (`OQ-DATA-16`), no antes. Sin vía hoy: `Rifle Amp`, `Dead Eye` y `Arcane Arachne`
> (que además apunta a dos slots a la vez).
>
> Evidencia por defecto: `[empirical]` — fuente Archon Shards, verificada en juego.

| Tipo OmniFrame D-6 | target_channel | Modelo | Fuente |
| :--- | :--- | :--- | :--- |
| `WEAPON_PRIMARY_ADD_STATUS_CHANCE` | `primary` | `C1` | Crimson Archon Shard |
| `WEAPON_SECONDARY_ADD_CRIT_CHANCE` | `secondary` | `C1` | Crimson Archon Shard |
| `WEAPON_MELEE_ADD_CRIT_MULT` | `melee` | `C1` | Crimson Archon Shard |
| `WEAPON_PRIMARY_ADD_DAMAGE` | `primary` | `C1` | Arcane Rage, Arcane Rise (arcanos de **warframe**) |
| `WEAPON_PRIMARY_ADD_FIRE_RATE` | `primary` | `C1` | Arcane Acceleration, Arcane Tempo |
| `WEAPON_PRIMARY_ADD_RELOAD_SPEED` | `primary` | `C1` | Arcane Momentum |
| `WEAPON_SECONDARY_ADD_DAMAGE` | `secondary` | `C1` | Arcane Awakening, Arcane Precision, **Pistol Amp** (aura) |
| `WEAPON_SECONDARY_ADD_FIRE_RATE` | `secondary` | `C1` | Arcane Velocity |
| `WEAPON_SECONDARY_ADD_AMMO_EFFICIENCY` | `secondary` | `C1` | Arcane Pistoleer — ⚠️ llega al arma y el nodo `WEAPON_ADD_AMMO_EFFICIENCY` no se materializa |
| `WEAPON_MELEE_ADD_DAMAGE` | `melee` | `C1` | Arcane Blade Charger — **cruzado**: el trigger es un kill con rifle, el destino es el melee · Arcane Fury · **Steel Charge** (aura) |
| `WEAPON_MELEE_ADD_COMBO_COUNT_CHANCE` | `melee` | `C1` | Reflex Guard — ⚠️ nodo no materializado (combo) |
| `WEAPON_MELEE_BASE_COMBO_INITIAL` | `melee` | `C1` | Ready Steel (aura) — ⚠️ nodo no materializado (combo). **Única sub-familia con entrada en `UPGRADE_MAP`**: su par ADD no se deriva del segmento (`BASE_COMBO_INITIAL` → nodo `ADD_COMBO_INITIAL`), así que el fallback acertaría el canal y erraría el atributo |

⚠️ **Que el token llegue no garantiza que el nodo exista, y esa diferencia es útil.** Tres de estos
apuntan a nodos que el motor todavía no materializa (combo, ammo efficiency). Antes el tripwire
reportaba el hueco **en el warframe** —donde el nodo nunca podía estar, porque el problema era el
ruteo— y ahora lo reporta en la melee o la secundaria, que es donde falta de verdad.

### MELEE — atributos propios del dominio melee

`attr = token` (auto-derivado por `resolveToken`: `MELEE` no es sub-familia, así que `parts[1]` es
la OPERATION y el attr queda igual al token).

| Tipo OmniFrame D-6 | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `MELEE_ADD_ATTACK_SPEED` | `[empirical]` | `C1` | Fury, Primed Fury, Berserker Fury, Quickening, Spoiled Strike (−), Gladiator Vice, Furor, Necramech Fury, Martial Fury, **Arcane Strike** |

⚠️ **`Arcane Strike` es el caso que prueba que la separación no es cosmética.** Estaba acuñado
`WEAPON_ADD_FIRE_RATE` —el token del arma de fuego— para un efecto que la fuente describe como
*"Attack Speed to Melee Weapons"*. Con el token correcto nombra el nodo que la melee sí materializa;
sigue sin llegar, pero ahora por un motivo distinto y visible: **el ruteo no consulta la familia del
token**. `FAMILY_ROUTE` declara cinco entradas y desde mods/arcanos se usan dos, ambas hardcodeadas
(`ENEMY` para el cruce de bando, `AVATAR` para el salto arma→warframe); `MELEE`, `WEAPON` y
`GAMEPLAY` sólo las alcanza `AbilityRepository`, que sí rutea por la familia del token. Es el mismo
hueco que `arch-decisions.md` §18 lleva como drift 🔴.

**Por qué está separado de `WEAPON_ADD_FIRE_RATE`.** DE emite un único token upstream
(`WEAPON_FIRE_RATE`) tanto para Fury como para Gunslinger, pero son stats distintos:

- el **texto de la carta** ya los distingue — Fury: `+30% Attack Speed`; Gunslinger: `+72% Fire Rate`;
- el **raw** ya los trae separados — `attack.speed` en melee, `stats.fire_rate` en armas de fuego;
- **no significan lo mismo**: fire rate es cadencia absoluta (disparos/segundo); attack speed es un
  **multiplicador** sobre la animación del stance (el operando base no está en ninguna fuente — ver
  la deuda de cadencia melee más abajo).

Es el mismo principio de derivación que rige todo este documento: DE suministra tipos genéricos,
OmniFrame los normaliza al nodo correcto. Mantenerlos juntos hacía que `mod-stats.override.json`
declarara `label: "+X% Attack Speed"` con `upgrade_type: WEAPON_ADD_FIRE_RATE` — la contradicción
escrita en el propio dato normalizado.

> ⚠️ **Deuda destapada por esta separación (no resuelta acá):** `CombatCalculator` y
> `TimelineSimulator` consumen la cadencia como disparos/segundo (`timeStep = 1 / speed`,
> `weaponDps({fireRate})`). Aplicado a melee eso interpreta un **multiplicador** como cadencia
> absoluta. El bug es anterior a la separación; ésta solo lo hace visible. Una ley de cadencia melee
> necesita el swing time base por stance, que **no existe en ninguna fuente del pipeline**.

### AVATAR — habilidades

`attr = token` (auto-derivado).
> Evidencia por defecto: `[empirical]` — los 4 stats de habilidad son mecánica core conocida.

| Tipo OmniFrame D-6 | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `AVATAR_ADD_ABILITY_STRENGTH` | `[empirical]` | `C1` | Intensify, Blind Rage |
| `AVATAR_ADD_ABILITY_RANGE` | `[empirical]` | `C1` | Stretch, Overextended |
| `AVATAR_ADD_ABILITY_DURATION` | `[empirical]` | `C1` | Continuity, Narrow Minded |
| `AVATAR_ADD_ABILITY_EFFICIENCY` | `[empirical]` | `C1` | Streamline, Fleeting Expertise |
| `AVATAR_ADD_ABILITY_DAMAGE` | `[empirical]` ⚠ | `C2·F` | Archon Shards Topaz/Violet/Emerald — multiplicador directo sobre output de daño, condicional por status. ⚠ interacción con ABILITY_STRENGTH en engine sin definir |

### AVATAR — stats base

`attr = token` (auto-derivado).
> Evidencia por defecto: `[empirical]` — stats base del Warframe, ampliamente conocidos.

| Tipo OmniFrame D-6 | Modelo | Ejemplo de mod |
| :--- | :--- | :--- |
| `AVATAR_ADD_HEALTH_MAX` | `C1` | Vitality, Primed Vigor |
| `AVATAR_ADD_SHIELD_MAX` | `C1` | Redirection, Primed Vigor |
| `AVATAR_ADD_ARMOUR` | `C1` | Steel Fiber, Warcry (habilidad) |
| `AVATAR_ADD_ENERGY_MAX` | `C1` | Flow, Primed Flow |
| `AVATAR_ADD_MOVEMENT_SPEED` | `C1` | Volt Speed, Dispatch Overdrive, Wisp Reservoirs. **Nodo materializado**, base = `sprint_speed` del raw. El nombre del dato miente: la wiki declara que el stat base del arsenal *"is actually the Warframes base Movement Speed modifier"* — 1.0 = 6 m/s de walk. Es una **escala**, no un porcentaje. |
| `AVATAR_ADD_SPRINT_SPEED` | `C1` | Rush, Armored Agility, Hastened Steps, Speed Drift, **Amalgam Serration** (mod de rifle). **Stat distinto del anterior, no un alias**: acelera sólo la animación de sprint y *"do not affect a Warframe's Movement Speed, even though they increase the listed Sprint Speed stat in the arsenal"*. **Base sintética 100**: el sprint no tiene valor nato propio, se deriva del walk (`sprint = walk × 1.25 × (1 + Σ bonos)`) — el nodo acumula el `Σ bonos`, y los m/s serían una derivación cross-stat sin consumidor hoy. **Único carril cuyo corpus se equipa fuera del warframe**: 4 de sus 9 mods viven en rifle, aura, Parazon y Archwing. Ver [`../../references/wiki/mechanics/movement-speed.md`](../../references/wiki/mechanics/movement-speed.md). |
| `AVATAR_ADD_CASTING_SPEED` | `—` | Natural Talent. Velocidad de animación de cast; no afecta output del simulador simplificado. |
| `AVATAR_ADD_SHIELD_RECHARGE_RATE` | `C1` | Fast Deflection |
| `AVATAR_ADD_PARKOUR_VELOCITY` | `C1` | Amber Archon Shard (+15% / +22.5% tauforged), Arcane Agility, Arcane Consequence. **Tercer stat de movimiento**, distinto de los dos de arriba: gobierna bullet jump, double jump, rodar, sidespring y backspring. Movement Speed no lo toca. **Nodo materializado con base sintética 100** (100% = sin mods): a diferencia de `MOVEMENT_SPEED`, el raw no trae dato y no puede traerlo — el parkour no varía por warframe. Los 14 mods de la familia (Mobilize, Lightning Dash, Firewalker…) ya lo llevan en `mod-stats.override.json` y aterrizan; el `AVATAR_PARKOUR_BOOST` que se ve en `mods.json` es el token crudo de DE en el dataset generado, que el engine no lee. |
| `AVATAR_ADD_AIM_GLIDE_DURATION` | `C1` | Mobilize, Patagium, Lightning Dash, Piercing Step y 8 más — es el **segundo stat** que traen los mods de la familia parkour. Cubre también el **Wall Latch**, que comparte su timer. **Base 3 segundos, dato de la fuente, no sintética**: el nodo lee en su unidad real (`+20% → 3.6s`, no `120`). Cross-check del wiki: con Archgun desplegado cae ~70% a *"0.9 segundos sin aumentos"* = 3 × 0.3. |
| `AVATAR_ADD_SLIDE_SPEED` | `—` **acuñado sin nodo** | Maglev, Cunning Drift, Streamlined Form, Air Thrusters, Necramech Slipstream. Velocidad de deslizamiento — cuarto carril de movimiento. Sin nodo: **no hay base de velocidad de slide en ninguna fuente**, así que un nodo no sería verificable contra nada. |
| `AVATAR_ADD_SLIDE_FRICTION` | `—` **acuñado sin nodo** | Maglev, Cunning Drift, Streamlined Form (valores negativos: `-5…-30`). Resistencia a frenar — la otra faceta del mismo carril (la wiki las lista junto como *"Slide & Friction"*). **Entra o sale con su par:** los 3 mods traen las dos, y modelar una sola los haría computar la mitad de lo que dicen. |
| `AVATAR_ADD_HEALTH_ORB_EFFICIENCY` | `C1` | Amber Archon Shard (+100/+150%). Multiplicador estático sobre valor del orb; C2 lo usa al modelar economía de recursos. |
| `AVATAR_ADD_ENERGY_ORB_EFFICIENCY` | `C1` | Amber Archon Shard (+50/+75%). Ídem. Equilibrium añade complejidad de conversión — fórmula a definir en C2. |
| `AVATAR_ADD_HEALTH_REGEN` | `C1` | Arcane Grace, Arcane Victory. ⚠ **Hipótesis usuario**: toda regen de salud en Warframe es plana (HP/s), no porcentual — si fuera %, solo Nidus (con regen nata) tendría base relevante. Si se confirma: este token es duplicado de `AVATAR_FLAT_HEALTH_REGEN` y debe colapsarse. Requiere verificación de valor real de Arcane Grace rank 5 en juego |
| `AVATAR_ADD_HEALTH_DAMAGE_TO_ENERGY` | `—` | Rage, Hunter Adrenaline, Kinetic Diversion, Necramech Rage. Convierte % del daño recibido en salud → energía. Renombrado del misnomer DE-legacy `AVATAR_DAMAGE_POWER_MULTIPLIER`; premisa "escudos→energía (Kinetic Diversion)" desmentida vs raw — los 4 mods son salud→energía. Sin consumidor de engine aún. |

### AVATAR — planos post-escala (ADD_FLAT)

Fórmula verificada (wiki + test en juego):
```
Total = Base × (1 + Mods%) + FLAT
```
Los valores FLAT se suman **después** del pool de mods porcentuales. No se amplifican por Steel Fiber, Vitality, ni ningún otro mod.
> Evidencia por defecto: `[ref: armor.md / health.md / shield.md]` + `[empirical]` (test en juego).

| Tipo OmniFrame D-6 | Modelo | Fuentes confirmadas |
| :--- | :--- | :--- |
| `AVATAR_FLAT_HEALTH_MAX` | `C1` | Azure Archon Shard (+150/+225) |
| `AVATAR_FLAT_SHIELD_MAX` | `C1` | Azure Archon Shard (+150/+225) |
| `AVATAR_FLAT_ENERGY_MAX` | `C1` | Azure Archon Shard (+50/+75) |
| `AVATAR_FLAT_ARMOUR` | `C1` | Azure Archon Shard (+150/+225), Stone Skin (Focus), Arcanos de armor |
| `AVATAR_FLAT_HEALTH_REGEN` | `C1` | Azure Archon Shard (+5/+7.5 Health/s), Rejuvenation (aura) |
| `AVATAR_FLAT_ENERGY_REGEN` | `C1` | Energy Nexus, Energy Siphon (aura), Relentless Assault. ⚠ ¿la regen de energía es ADD_FLAT (E/s plano) o tiene mecánica de ramp-up (Energy Nexus sube con el tiempo)? |

> `AVATAR_BASE_ARMOUR` (BASE_FLAT) eliminado — no existe ninguna mecánica de armor pre-escala amplificada por mods. El token fue modelado incorrectamente; corregido.

### AVATAR — chance de resistir proc (CHANCE-family, desviación D-6)

Tokens de familia `AVATAR_CHANCE_RESIST_*` no siguen D-6 estrictamente (CHANCE no es una OPERATION de la convención). `resolveToken()` no los cubre → sin entrada en UPGRADE_MAP por ahora. Modelado C2 diferido (Fase 0 los trata como `—`).

> Distinto de `AVATAR_INJURY_BLOCK_CHANCE` (resist knockdown/stagger/falls — de-facto pipeline, no D-6, no en UPGRADES aún).

| Tipo OmniFrame | Resistencia | Arcane fuente | Modelo |
| :--- | :--- | :--- | :--- |
| `AVATAR_CHANCE_RESIST_SLASH` | Slash Status | Arcane Deflection | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_PUNCTURE` | Puncture Status | Arcane Defense | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_IMPACT` | Impact Status | Arcane Shield | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_HEAT` | Heat Status | Arcane Ice | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_COLD` | Cold Status | Arcane Warmth | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_ELECTRICITY` | Electricity Status | — (no arcane existente) | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_TOXIN` | Toxin Status | Arcane Detoxifier, Arcane Resistance | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_RADIATION` | Radiation Status | Arcane Healing | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_CORROSIVE` | Corrosive Status | Arcane Protection | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_GAS` | Gas Status | Arcane Liquid | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_MAGNETIC` | Magnetic Status | Arcane Nullifier | `—` (C2 futuro) |

### GAMEPLAY

> Evidencia por defecto: ver por token.

| Tipo OmniFrame D-6 | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `GAMEPLAY_MULT_FACTION_DAMAGE` | `[empirical]` | `C2·F` | Bane/Expel/Cleanse y familia. **Pool de facción** (`arch-decisions §16`): op `ADD` = los miembros **SUMAN** en su nodo global propio (Roar+Bane aditivos, ×2.428 verificado `faction-damage.md`). ⚠️ **El segmento `_MULT_` es incorrecto** — por §OPERATION (mapeo 1:1) `MULT` ⇒ op `MULTIPLICATIVE`, pero la op real es `ADD` (`UPGRADE_MAP` la pisa). Por D-6 debería ser `GAMEPLAY_ADD_FACTION_DAMAGE`. **No se renombra todavía**: sale junto con la normalización del token que el shim ya declara ↓. Ver `../domains/engine/design/vocabulary.md` §4 (L-8). **C2·F**: el gate depende de la facción del target, que vive en `EnemyState`/③ (NO en `SimulationContext`/C1). ⚠️ **Shim FLAGGED** (`ModRepository.C2F_FACTION_TOKENS_DEFERRED`): NO se emite en C1 hasta normalizar la semántica del token (facción + gate) y migrar a resolución. El pool C1 queda para bonos incondicionales (Roar, §15). |
| `GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE` | `[needs-verification]` | `C2·F` | Archon Shard Emerald. Instancias aditivas. ⚠ Scope real sin confirmar. Afecta proc de Toxin en C2. |

> `toPercent: true` en UPGRADE_MAP — el JSON almacena el valor como `1.30` (+30%); el engine lo convierte a `30` para `mods_add_pct`.

---

## Frontera negativa — qué NO puede declarar un token

Toda la gramática de arriba es **positiva**: dice qué se puede expresar. Por eso lo que no cabía se
metió igual, y cada caso terminó con su parche. Esta sección es el complemento que faltaba.

**El token declara tres cosas y sólo tres:** clase de entidad (`{dónde}`), operación (`{cómo}`) y
atributo (`{qué}`). Lo demás pertenece a otro portador:

| Eso NO es del token | Es de… |
|---|---|
| que el nodo **exista** | la **entidad** — un token `WEAPON_*` sobre un warframe no crea el nodo, no se aplica |
| el **alcance** (a cuál de las tres armas llega) | el **portador**, vía la sub-familia → `target_channel` |
| el **cuándo** (trigger, proc, duración) | la **fuente**, vía `condition` / `notes[]` |
| la **mecánica** (cómo se computa el valor) | la **op de familia**, y sólo si su disparador es el token |

**Test del eje nuevo.** Si lo que querés expresar es un **eje nuevo** —no un valor nuevo del eje
existente— **no es un token**, por natural que suene el nombre. "Curación por golpe escalada por N
status" suena a token y no lo es: mete un eje de efecto (curar) que el vocabulario no tiene.

**Y no se corrige en el engine.** Si una semántica rompe una regla pero el motor podría "adivinarlo"
por dominio, que haga falta adivinar **es el aviso** de que se metió composición en el token. Se
declara en el portador, o se lista abajo como inexpresable. Un `if` de materialización que silencia
el desvío convierte un error detectable en uno invisible.

---

## Registro de lo inexpresable

Lo que el vocabulario **no** puede decir hoy, con su motivo y su condición de reapertura. Existe
porque el modo de falla real de este sistema no es el token equivocado: es el **descarte silencioso**.
De **1451** `upgrade_type` no-nulos en los overrides, **216 (14,9%) no resuelven**, repartidos en **104
tokens distintos**. El objetivo declarado **no es cero descartes**: es **cero descartes sin nombre**.
Las filas de abajo cubren los 216 — cada una con la medición que la sostiene, no con el razonamiento
que la sugirió.

> **El oráculo es `npm run measure:tokens`, no esta página.** La herramienta parsea el vocabulario
> desde `modifier.ts`, así que ella no puede driftear respecto del código; **los números de arriba son
> una foto suya, y una foto envejece**. Se refrescan corriéndola, nunca editándolos a mano — y quien
> los use para decidir algo la corre primero. Al leer su salida: el `107` de la cabecera es el **tamaño
> del vocabulario**, no la cuenta de tokens descartados; confundirlos es fácil y ya pasó.
>
> Mide **una** de las dos compuertas (que el token resuelva); la otra —que el modifier **aterrice** en
> un nodo existente— vive en `__tests__/channel-routing.test.ts`, y sin ella este conteo puede bajar
> sin que nada compute.

| caso | por qué no es expresable | reapertura |
|---|---|---|
| `base_add_pct` | Bucket sin token y sin emisor: el vocabulario no tiene segmento que produjera `BASE_ADD_PCT`. Su caso motivador (crit relativo, Point Strike) lo resuelve `mods_add_pct`. | Un mecanismo que necesite un pool porcentual que componga **multiplicativamente** con `mods_add_pct`. Acta en [`../domains/engine/attribute-node-contract.md`](../domains/engine/attribute-node-contract.md). |
| `absoluteCritBonus` | El término post-escala de la fórmula de crit no tiene token: falta `WEAPON_FLAT_CRIT_CHANCE`, mientras su hermano `WEAPON_FLAT_STATUS_CHANCE` sí existe. | Clasificar qué fuentes reales le pertenecen (candidato: Arcane Avenger, hoy en el pool relativo). **No resoluble con el corpus local** — `critical-hits.md` da la fórmula y no enumera fuentes. Requiere test in-game. |
| `Healing Return` | Familia CO con efecto **no-daño**: escala por N status igual que CO, pero cura. No converge al nodo de CO (`WEAPON_ADD_DAMAGE`) y no tiene nodo propio. Pide op de familia + nodo + arista al estado del target: tres cosas nuevas para **1 caso** (D-20 puerta 3). | Un 2º caso de "efecto no-daño escalado por N tipos de status". |
| Lifesteal de arma | 4 portadores de **una misma forma** (% del daño → HP): Life Strike, Winds of Purity, Amalgam Daikyu Target Acquired (`WEAPON_LIFE_STEAL`) y Exodia Might (`WEAPON_ADD_LIFESTEAL`, el rename D-6 aplicado a 1 de 4). Pasa la puerta 1 de D-20 y el precedente `WEAPON_FLAT_PUNCH_THROUGH` neutraliza la objeción "sin consumidor" — **lo que falta es la decisión, no la evidencia**. | Unificar los dos tokens y acuñar, o declarar el eje de sustain fuera de scope. |
| multishot en melee | El `{dónde}` **no es taxonómico**: depende de la mecánica del arma (glaive / gunblade / incarnon), no de su clase. Ninguna sub-familia lo expresa. | Modelar el eje mecánica-de-arma, hoy inexistente. |
| swing time por stance | Gap de **fuente**, no de vocabulario: ninguna ley de cadencia melee es expresable sin ese dato, y el dato no está en ninguna fuente que consumimos. | Que la cosecha wiki lo cubra. |
| Toxic Lash / `Extra-hit Buffs` | No son modificadores: son **instancias** de daño extra. No pasan por ningún nodo, así que ningún token puede describirlos. | C2 — verificar antes si la Instancia admite N por hit (multishot las multiplica). |
| `AVATAR_CHANCE_RESIST_*` — **10 tokens / 11 usos** | Los tokens **existen en `UPGRADES`** y son regulares (`{dónde}_{qué}`), pero `resolveToken` no los resuelve: su segmento 1 es `CHANCE`, no una operación. Desviación D-6 declarada. | Gated por modelar **DR**: hasta entonces no hay bucket al que apuntar. |
| **7 tokens `AVATAR_*` que no son tokens** — los 5 `AVATAR_SENTINEL_{ARMOUR,CRIT,HEALTH,SHIELD,STATUS}_LINK` (Link Vitality, Link Fiber, Hunter Synergy, Mecha Overdrive, Hunter Recovery) + `AVATAR_NPC_HIT_CHANCE` (Emp Aura) y `AVATAR_MARKED_DAMAGE_AMOUNT` (Mecha Empowered), 1 uso cada uno | Fallan el **test del eje nuevo** de arriba, por dos motivos distintos. Los `*_LINK` meten el eje **leer de otra entidad** —[`../data/rules/overrides.md`](../data/rules/overrides.md) lo clasifica como **relacional → fórmula dedicada**—, y el mecanismo para eso ya existe (`source_entity` + `source_attribute`, el de Roar): no es un valor nuevo del eje, es un eje que el token no puede portar. Los otros dos ponen un efecto **contra el enemigo** bajo prefijo `AVATAR_`: el `{dónde}` miente sobre el sujeto. | **No es migración** —ya están fuera de `UPGRADES` y gritan en hidratación—: es **darles nombre**. Fórmula dedicada para los `*_LINK`; para los dos hostiles, decidir su sujeto real antes de acuñar nada. |
| **84 tokens / 195 usos** fuera de `UPGRADES` | Stats reales del juego que el proyecto no modela (`WEAPON_SYNDICATE_POWER` 24, `AVATAR_DAMAGE_TAKEN` 13, `WEAPON_DAMAGE_TYPE_BIAS` 12, `WEAPON_CONVERT_AMMO` 10, …). Cola larga dominada por tokens de **un solo uso**. Hoy son **invisibles** — ése es el defecto que este registro corrige. | Caso por caso, con el criterio de D-20. |
| 3 tokens de **basura de dato** | `"Slash Damage"` y `"Slash Damage Duration?"` —texto libre donde va un token— más un **array donde va un string** (`["AVATAR_ADD_MOVEMENT_SPEED","MELEE_ADD_ATTACK_SPEED"]`). No es un gap de vocabulario: es un defecto del override. | Corregir el dato. |

> **Cómo se lee un descarte.** Que un modifier **no aporte** no significa que se haya descartado.
> Un modifier con `condition` que no se cumple **sí aterriza** en su nodo y aporta 0 — eso es el gate
> funcionando, y el trace lo reporta (`cond=false`). El descarte silencioso es otra cosa: el token no
> resuelve, o resuelve y apunta a un nodo que no existe. Son **dos compuertas distintas** y sólo la
> primera es visible en el conteo de arriba.

---

## Gate 1 — Definiciones que requieren verificación

Tokens marcados `⚠` en las tablas: definición plausible pero con evidencia floja
(`[needs-verification]`) o decisión de operación/modelado sin confirmar. **No usar en engine
hasta resolver** (regla anti "trust-me-bro", `docs/governance/deuda-taxonomy.md`).

| Token | Estado post-Gate 1 | Acción pendiente |
| :--- | :--- | :--- |
| `WEAPON_ADD_HEADSHOT_MULT` | ✅ **Cerrado** — Op ADD confirmada y semántica resuelta **al revés de lo que asumía el gate**: "headshot" **no** es legacy de "weak point", es estrictamente **la cabeza**. Ley y composición en `references/wiki/mechanics/enemy-body-parts.md` | — |
| `WEAPON_FLAT_STATUS_CHANCE` | Sin resolver — modelado multi-pellet complejo | Investigación propia |
| `WEAPON_ADD_ACCURACY` | ✅ **Cerrado** — `WEAPON_SPREAD` era el mismo stat con nombre de DE, no una semántica distinta: sus 17 mods ya declaraban `% Accuracy` con el signo correcto. Unificados bajo este token; nodo materializado con base por ataque. El efecto (cono → impacto) queda en C2 | — |
| `AVATAR_ADD_ABILITY_DAMAGE` | Pending — engine de habilidades no diseñado aún | Defer hasta diseño de engine de habilidades |
| `AVATAR_ADD_HEALTH_REGEN` | Hipótesis usuario: toda regen en WF es plana (HP/s); si confirma, los 2 emisores del token `%` (Arcane Grace, Arcane Victory) estarían mal clasificados frente a los 4 del token plano. **No confundir con `L-9`:** ahí lo descartado es la fusión **mecánica** de los segmentos `ADD`/`FLAT` en `resolveToken` — ciega y sin evidencia. Esto es lo contrario: una pregunta **empírica** sobre 2 fuentes concretas. Si el juego dice que son la misma cosa, se re-clasifica el dato; el mecanismo sigue sin fusionarse. | Verificar valor real de Arcane Grace rank 5 en juego |
| `AVATAR_FLAT_ENERGY_REGEN` | Sin resolver — Energy Nexus puede tener ramp-up temporal | Investigación propia |
| `GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE` | Sin sujeto de prueba (no hay companion/habilidad con Toxin conocida) | Pendiente más pruebas; no bloquea schema ni datos |
| `WEAPON_FIRE_ITERATIONS` | ✅ **Cerrado** — alias conocido con UPGRADE_MAP entry; OQ-ENGINE-6 trackea la resolución formal | — |

> Los ⚠ que quedan **no bloquean el mapeo de datos** (Fases 2a–2c) pero sí bloquean implementación en engine.
> Cada investigación pendiente es su propio volumen; no resolver aquí sin evidencia.
