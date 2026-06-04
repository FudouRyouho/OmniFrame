---
Estado: activo
Rol: auditoria-manual
Version: "v0.2.0"
Impacto_ID: "D-18"
Fidelidad_Fisica: "Project/public/data/mod-stats.override.json"
Fecha_de_creacion: "2026-06-02"
Fecha_de_actualizacion: "2026-06-03"
---

# Auditoría manual — mod-stats.override.json

> **Organización (2026-06-03):** las entradas se agrupan por **disposición** (qué acción
> requiere cada una), no por orden de captura. El bucket de debate real (Grupo F) se
> sub-clusteriza por **familia mecánica** para tomar familias enteras por sesión.
> Las lecturas bajo cada entrada se conservan **literales** — son captura, no conclusión.

| Grupo | Disposición | Acción |
|---|---|---|
| **A** | Ya tiene hogar | Linkear a deuda/OQ existente, no re-debatir |
| **B** | Fuera de scope | PvP/conclave, augments de sindicato, mecánicas removidas → park |
| **C** | Bug de dato | Mapeo/parseo incorrecto → corregir contra raw, no debatir modelo |
| **D** | Gap de schema | No es problema del override → discusión de schema aparte |
| **E** | Condition faltante | Alimenta cobertura `conditions/L3` |
| **F** | Debate real sin OQ | Token/mecánica nueva → backlog clusterizado por familia |

---

## Grupo A — Ya tiene hogar (linkear y sacar de triage)

> Estas entradas ya mapean a deuda documentada en `docs/data/status.md §Mods` o a una OQ.
> Cruzar referencia y no re-debatir. Espejo de deudas: `AVATAR_HEAL_RATE`,
> `WEAPON_ADD_ACCURACY`, Condition Overload family (`WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE`).

> [!NOTE]
> AVATAR_DAMAGE_TAKEN: practicamente la gran mayoria merecen revision por contesxto de "+n% {damage_type} Resistence", el propio token no lo mapea, posiblemente ¿condition entre mejor que un token dedicado hacia el bucket? posiblemente no ahora que lo pienso mejor... merece debate.
> — **Hogar:** `status.md §Mods` deuda `AVATAR_DAMAGE_TAKEN` + `references/wiki/mechanics/damage-reduction.md`.

> [!NOTE]
> Discusion ya establecida sobre "WEAPON_SPREAD" vs "WEAPON_ADD_ACURACY", token herado de DE, no modelado, debemos debatir y contrastar documentos para tener mas certezas de como "modelar" esto correctamente, ya que el token "WEAPON_SPREAD" no entra dentro de nuestra taxonomia.
> — **Hogar:** `status.md §Mods` deuda `[PIPE semantic:debt` `WEAPON_SPREAD` (verificar Narrow Barrel / Tainted Shell).

> [!NOTE]
> WEAPON_PUNCTURE_DEPTH: Token ya discutido con anterioridad, posiblemente tengamos suficiente informacion y documentacion para cerrar si renombrar a Punch Through es mas acertado que puncture depth.
> — **Hogar:** `status.md §Mods` deuda `WEAPON_PUNCTURE_DEPTH` (candidato `WEAPON_ADD_PUNCH_THROUGH`).

> [!NOTE]
> AVATAR_DAMAGE_POWER_MULTIPLIER: token que merece revision, se debatira con contraste documental.
> — **Hogar:** `status.md §Mods` deuda `AVATAR_DAMAGE_POWER_MULTIPLIER` (sub-mecánicas Rage/Hunter Adrenaline vs Kinetic Diversion).

> [!NOTE]
> WEAPON_FIRE_ITERATIONS: Debate ya abierto sobre el token heredado por parte de DE ¿Multishot es mas sincero en nuestra semantica? esto debe de debatirse con certeza, contrastando con la mecanica de pallets, ya documentada y posiblemente contrastar o investar mas con la wiki
> — **✅ CERRADO (2026-06-03):** `closed-decisions.md` **DC-OQ-ENGINE-6**. Token crudo conservado como alias → `WEAPON_ADD_MULTISHOT` (`op: ADD`) vía `UPGRADE_MAP`; 17 stats "+% Multishot". Evidencia `[ref: multishot.md]`, modelo `C1`. Rename = regex si alguna vez se decide. No re-debatir.

---

## Grupo B — Fuera de scope (park)

> PvP/conclave, augments de sindicato y mecánicas removidas. Marcar `out-of-model` y no debatir.

# /Lotus/Upgrades/Mods/PvPMods/Warframe/StaggerImmunityMod

> upgrade_type, canonico en teoria, pero, posiblemente marcarlo en revision para su taxonomia y semantica, sea lo mejor, contrastando con la wiki.

# /Lotus/Upgrades/Mods/Shotgun/DualStat/RadiationClipShotgunMod

> mismo caso que "StaggerImmunityMod"

# /Lotus/Upgrades/Mods/Syndicate/SilvaAegisMod

> Mod de sindicado, mecanica poco "documentada" sobre el blocking, merece debate, notas y contraste con la informacion en la wiki, tanto sobre el propio mod de aumento como de la mecanica, tecnicamente, fuera de scope por ser mod de aumento.
> — *Si se modela la mecánica de blocking, cruzar con la familia parry/block (Grupo F).*

# /Lotus/Upgrades/Mods/Syndicate/SupraMod

> Caso particular, el mod es +20 base, texto extraido de la wiki "Unlike other rifle mods that affect status chance, Entropy Burst is an additive effect rather than a multiplicative one. This gives the  Supra/ Vandal, with its base status chance of 30%, a 50% Status Chance (30% + 20%), rather than 36% (30% × (1 + 20%))."

# /Lotus/Upgrades/Mods/Syndicate/ObexMod

> Todos los tokens merecen revision, marcado explisito, son mecanicas muy "particulares", esperable de un mod de aumento.

# /Lotus/Upgrades/Mods/PvPMods/Pistol/DespairEnergyDrainAoE

> mod con mecanica particular, exclusivo de conclave (PVP) asi que en resumen "zzz"

> [!NOTE]
> WEAPON_PARRY_DAMAGE_REFLECTED: Token que merece revision, aunque, propio del conclave, fuera de scope general.

> [!NOTE]
> AVATAR_STAMINA_RECHARGE_RATE, AVATAR_STAMINA_MAX: token legacy de DE, posiblemente, merece revision, ¿stamina = energy?

---

## Grupo C — Bug de dato (mapeo/parseo)

> Corrección contra el raw, no debate de modelo.

# /Lotus/Upgrades/Mods/Melee/WeaponGlaiveOnKillBuffSecondary

> ¿Mal mapeado? ¿Error de parseo? en teoria el token correcto es "on_kill", no slide, merece revision del mod.json raw, en teoria el texto es "On Melee Kill"

---

## Grupo D — Gap de schema (no es problema del override)

> El override está bien; lo que falta es estructura/contexto que el schema de origen no prototipó.

# /Lotus/Types/Friendly/Pets/KubrowPetPrecepts/KubrowDigPrecept

> mod espesifico de "SAHASA KUBROW", token ¿raro? label... no mal mapeado, pero falta contexto de la "habilidad en si", aunque tecnicamente este contexto lo añade el campo "description" de mods.json, esto posiblemente sea un gap derivado, del schema, merece una discucion aparte, no es "problema del override" como tal, si no de como se prototipo el schema de mods.json

> [!WARNING]
> Casos problematicos, fuera del contexto del override, merecen un analisis para cerrar ideas y conceptos:
> "KubrowDigPrecept"

# /Lotus/Types/Friendly/Pets/CatbrowPetPrecepts/CatbrowTransfusionPrecept

> Vasca Kavat mod espesifico, necesita revision.

### Set Mods — bonus de conjunto como entidad ausente (2026-06-03)

> **Lectura:** los 91 mods bajo `/Lotus/Upgrades/Mods/Sets/<Set>/...` tienen **dos gaps distintos**:
>
> - **Gap A — pertenencia al set.** No hay campo `set`/`kind`/`category` que los agrupe, pero
>   **es derivable** del `unique_name` (`/Mods/Sets/<Set>/`). 19 sets, 91 miembros. Análogo a la
>   deuda `conclave?: boolean`: recuperable, bajo riesgo → `pipeline:debt` o campo derivado.
> - **Gap B — el bonus de conjunto en sí.** Ej: *"Gladiator Set: +X% melee crit per combo
>   stack"*. **No es un stat de ningún mod individual** — es un efecto del *set*, parametrizado
>   por nº de piezas equipadas (stack) y a menudo con condition propia. **No va en
>   `mod-stats.override.json`** (shape per-mod no lo representa): es una entidad nueva
>   (`set → {bonus, escala por piezas, miembros, condition}`), en territorio OQ-DATA-4
>   (stacking + condition) + noción de "piece-count" inexistente en cualquier schema.
>
> **Decisión (2026-06-03):** investigación de wiki **capturada** en `references/set-mods.md`
> (19 sets con bonus + escala por piezas + condition) + **OQ-DATA-6** abierta, gateada por
> consumidor (linkeada a OQ-DATA-4/OQ-DATA-1). Override **sin tocar**. Hallazgo: el portador del
> bonus es la entrada `<Codename>setmod` (`type: "Mod Set Mod"`), presente pero vacía.
> Ver `docs/data/references/set-mods.md` y `docs/governance/open-questions.md#OQ-DATA-6`.

---

## Grupo E — Condition faltante (alimenta `conditions/L3`)

# /Lotus/Upgrades/Mods/Warframe/Kahl/KahlAvatarAbilityRangeMod

> condition faltante, ya debatido anteriormente, añadir notas y debatir en contraste con la informacion disponible o wiki.

# /Lotus/Upgrades/Mods/Warframe/AvatarGroundFireDmgMod

> condition faltante "during" event.

---

## Grupo F — Debate real de token/mecánica sin OQ (por familia)

> **Barrido "¿ya tiene hogar?" (2026-06-03).** Cruce de todos los tokens F contra `modifier.ts`
> (`UPGRADES[]`), `upgrade-tokens.md`, `closed-decisions.md` y deuda de `status.md`. Resultado:
> a diferencia de F.4 (cerrado) y F.5 (modelado en engine), **el resto de F es orphan / out-of-model**
> — ya cubierto colectivamente por la deuda "~255 entradas non-D6" de `status.md §Mods`, sin debate
> activo hasta que haya consumidor (gate D-20). **No se debaten ahora.**
>
> | Token | Home-status |
> |---|---|
> | `WEAPON_ADD_RANGE` (F.1) | ✅ Investigado + parcialmente resuelto 2026-06-03 (ver §F.1): beam range **acuñado** como `WEAPON_ADD_BEAM_RANGE` (D-17). Quedan diferidos: archgun range → OQ-DATA-7, unidad flat/% → OQ-DATA-8. |
> | `AVATAR_INJURY_BLOCK_CHANCE` (F.8) | documentado en `upgrade-tokens.md` |
> | resto (F.1 `ATTRACTION_RANGE`, F.2, F.3, F.6, F.7, F.8 `ANIM_RATE`, F.9, F.10) | **orphan / out-of-model** — captura-only, diferido por gate de consumidor |

### F.1 — Fall-off / range

# /Lotus/Upgrades/Mods/Archwing/Rifle/ArchwingRifleRangeMod

> Mod de Archgun, aqui el "problema" es la semantica de "WEAPON_ADD_RANGE" porque en terminos practicos, no funciona igual que lo que ya conocemos en "Armas melee convencionales", en este contexto afecta al fall-out, merece revision y contraste con la wiki, posiblemente discusion, anotaciones en references/* y distincion de upgrade_*, esto ya se habia "discutido en el aire".

# /Lotus/Upgrades/Mods/Archwing/Melee/ArchwingMeleeRangeIncMod

> "WEAPON_ADD_ATTRACTION_RANGE", merece revision propia, debate y discusion, con contraste de datos en la wiki.

> **Investigación cerrada (2026-06-03) — duda resuelta: `WEAPON_ADD_RANGE` SÍ está sobrecargado.**
> Los 8 stats cubren **3 mecánicas físicamente distintas**:
> - **Melee reach** (canónico, `upgrade-tokens.md:178` = "alcance melee"): Reach, Primed Reach, Extend (archmelee), Necramech Reach.
> - **Beam range** (alcance del rayo): Sinister Reach, Ruinous Extension, Sequence Burn — labels "+m Beam Range".
> - **Archgun range** (falloff en el espacio): Ballista Measure.
> - Aparte: `WEAPON_ADD_ATTRACTION_RANGE` (Extend "In Space") = vacuum/atracción, ya token propio.
>
> **No hay colisión de cómputo** (modelo `—`, sin engine; mods class-locked → nunca coexisten en una entidad). Es **sobrecarga semántica**, no bug runtime — la intuición de bucket contextual-por-arma se sostiene.
>
> **Drift detectado:** `decisions.md:319` ya registra `WEAPON_ADD_BEAM_RANGE` (inexistente) y **nombra a Sinister Reach** como mod a investigar; pero Galvanized Acceleration parquea beam range bajo `WEAPON_ADD_PROJECTILE_SPEED + note`, mientras estos 3 beam mods están bajo `WEAPON_ADD_RANGE`. **Dos estrategias de parking divergentes** para el mismo concepto faltante.
>
> **✅ Beam range RESUELTO (2026-06-03):** acuñado `WEAPON_ADD_BEAM_RANGE` en `UPGRADES[]` (data-first, gate D-20 cumplido con 4 mods). Re-map de Sinister Reach / Ruinous Extension / Sequence Burn; Galvanized Acceleration split 1-label-1-stat. D-17 y `upgrade-tokens.md` actualizados. Thermagnetic Shells verificado: no es beam range.
> **Diferido como OQ:**
> - **Archgun range** (Ballista Measure `+% Range`, sigue bajo `WEAPON_ADD_RANGE`) → **OQ-DATA-7** (requiere investigación; posible D-* propio o captura en D-17).
> - **Unidad flat (`+Xm`) vs porcentaje (`+%`)** conviviendo bajo el mismo token de range/beam → **OQ-DATA-8** (choca entre tipos de mod; etapa muy temprana para diferenciar).

### F.2 — Radial / explosión

# /Lotus/Upgrades/Mods/Pistol/ProjectileExplosionChanceMod

> mod atipico, token, teoricamente correcto, pero merece notas propias, contraste con la wiki y su correcta "marca".

# /Lotus/Upgrades/Mods/Rifle/WeaponResistSelfDamageMod

> Cosa extremadamente similar a "ArchwingRifleRangeMod", en este caso no es un mod de aumento o arch-gun, pero si atipico, por su mecanica derivada a los "radial attacks".

# /Lotus/Upgrades/Mods/Pistol/ThrowingExplosionChanceMod

> mismo caso que "WeaponResistSelfDamageMod"

> [!NOTE]
> WEAPON_EXPLOSION_RADIUS: token que merece revision, asociado a radial attacks

### F.3 — Pickup / orbs

# /Lotus/Upgrades/Mods/PvPMods/Pistol/RestoreShieldsOnKillMod

> token "GAMEPLAY_PICKUP_AMOUNT" herado por parte de ¿DE? merece discusion y contraste con las conditions no modeladas bajo el concepto de "pick up orbs", posiblemente analogos y sea una pista para mejorar el vocablo en ambos sentidos haciendo convergencia de "accion > ejecucion", un debate mas teorico o reflexivo, que buscando cerrar este punto.

> [!NOTE]
> WEAPON_PICKUP_SHOOT_BONUS: Mecanica propia de "pickup", merece revision, debate, contraste con /references y wiki.

### F.4 — Multishot / pellets → ✅ RESUELTO (movido a Grupo A)

> Cerrado en `closed-decisions.md` DC-OQ-ENGINE-6. `WEAPON_FIRE_ITERATIONS` = alias de `WEAPON_ADD_MULTISHOT`. Ver Grupo A.

### F.5 — Faction damage

> [!IMPORTANT]
> GAMEPLAY_MULT_FACTION_DAMAGE:, familia "cleanse" o "expeler", Aqui no hay un problema como tal, pero ya habiamos planteado si el token "GAMEPLAY_MULT_FACTION_DAMAGE", debe expresar a la "faccion" que hace mas daño (en este caso corpus) o tener un condition "target", posiblemente el condition sea mas limpio, merece discusion propia sobre "las familias" de estos mods, revision de documentos ya establecidos y si es necesario hacer mas contraste con la wiki, aqui posiblemente el debate deba plantearse teorico o prototipado.

> **Investigación cerrada (2026-06-03):**
> - **Token + modelo de engine: YA DECIDIDO.** `GAMEPLAY_MULT_FACTION_DAMAGE` es token D-6,
>   modelo `C2·F` (`upgrade-tokens.md:306`). El engine apila los 42 mods (Bane/Expel/Cleanse/Smite
>   × facción) aditivo en un nodo sintético `faction_damage_bonus` (base 100) y `CombatCalculator`
>   lo aplica como multiplicador **cuando `target.faction` coincide** (`attribute-node-contract.md §5`).
>   → Tu intuición "condition target" **es la dirección elegida**, resuelta a nivel combate, no como
>   token en el mod. Wiring pendiente en engine: `impact-matrix.md` items 🔴. Drift menor ya
>   registrado: `faction_damage_bonus` → `FACTION_DAMAGE_BONUS` (casing).
> - **Hueco genuino OPEN:** la **facción objetivo no está estructurada**. `tags: []`, sin campo
>   `faction` en `mods.json` ni en el override; vive solo en el label (`"x Damage to Grineer"`).
>   `CombatCalculator` necesita esa facción estructurada para matchear `target.faction`.
>   **Mismo shape que `OQ-DATA-5`** (restricción/parámetro que hoy vive solo en `label`; OQ-DATA-5
>   ya anticipa "¿aplica también a mods?"). Vocabulario destino: `semantic/factions.md`.
>
> **Dirección registrada (2026-06-03, decisión del usuario):** la facción objetivo se expresa como
> **token de `condition`** (ej. `damage_corpus` / `vs_corpus` / `while_target_is_corpus` — **spelling
> diferido**), **no** como campo `target_faction` nuevo. Motivo: `condition` ya es campo por-stat
> (`string | null`) → **sin cambio de schema ni edición del contrato de engine**. Captura el target
> estructurado ahora; difiere (a) el spelling del token y (b) el rediseño de engine "un nodo aditivo →
> nodo por facción" (el problema de corrección multi-facción queda anotado para el debate de engine).
> Naturaleza: sub-clase de "estado/identidad del target" (familia `while_target_*`/`while_enemy_*`,
> eje `OQ-SEM-2`). Acuñación del token formal **gateada** por madurez de la taxonomía de condition
> (post-ingesta completa de overrides; `conditions.md §Altitud de los debates`). No aplicar a los 42
> mods todavía. **Latente, no en debate activo.**

### F.6 — Parazon

> [!NOTE]
> AVATAR_REHACK_CHANCE , AVATAR_TIME_LIMIT_INCREASE: ¿Heradado de DE? debatir, marcar y añadir nota, mecanica especial de "Parazon", posiblemente se necesite añadir notas adicionales, posiblemente ¿Esto deba no ser parte del pipeline? aunque en teoria la parazon tiene sus "mecanicas" que se "pueden" utilizar en builds dedicadas, pero mayormente son la mecanica de "mercy" (ejecucion, por ejemplo, sinergias de velocidad de movimiento con el warframe Ash)

### F.7 — Parry / block

> [!NOTE]
> WEAPON_PARRY_DAMAGE_BLOCKED, WEAPON_PARRY_COUNTER_CHANCE, WEAPON_PARRY_COUNTER_CHANCE_STAGGER, WEAPON_PARRY_COUNTER_CHANCE_STUN: Merece revision sobre el token, la mecanica y contraste con la documentacion.

> [!NOTE]
> WEAPON_POWER_DAMAGE_BLOCK: Necesita revision.

### F.8 — Knockdown

> [!NOTE]
> AVATAR_INJURY_BLOCK_CHANCE, AVATAR_INJURY_ANIM_RATE: token que merece revision, asociado a la mecanica de Knockdown resist.

### F.9 — Sentinel

> [!NOTE]
> AVATAR_SENTINEL_PACK_LEADER_REVERSE, AVATAR_SENTINEL_PACK_LEADER: token que merece revision y debate en contraste con la wiki.

### F.10 — Singletons (mecánica propia, sin familia aún)

# /Lotus/Upgrades/Mods/Rifle/WeaponGrenadeStickyMod

> Posiblemente upgrade_type muy generoso, merece debate, ¿Mecanica?, ¿Extencion de mecanica?... complicado de definir sin datos reales.

# /Lotus/Upgrades/Mods/Nightwave/BroncoNightwaveMod

> mod con mecanica particular, merece revision y debate.

# /Lotus/Upgrades/Mods/Aura/RobotPoorAimAuraMod

> token heredado de DE, merece revision y debate.

> [!NOTE]
> WEAPON_DAMAGE_TYPE_BIAS: Mecanica poco discutiva, el token no es el problema, como tal, pero si merece teorizacion y contraste con informacion (/references y wiki)

> [!WARNING]
> WEAPON_SYNDICATE_POWER: En resumidas cuentas, tenemos que "decidir" que hacer con esto, documentar en /references en base a investigacion con la wiki y prototipar, cerrarlo hoy, es complejo, pero saber de su existencia y organizarlo, es viable.

> [!NOTE]
> GAMEPLAY_POWER_TO_HEALTH_ON_DEATH: ¿Mecanica propia? ¿Convercion directa? realmente no lo se, merece debate y contraste con datos. (revision al token y mecanica.)

> [!NOTE]
> WEAPON_BODYSHOT_MULTIPLIER: merece revision en contraste con la documentacion.

> [!NOTE]
> WEAPON_NULLIFIER_BUBBLE_POP_CHANCE: ok, no tengo idea de que es esto.

> [!NOTE]
> AVATAR_FULL_ENERGY_EFFECT_RANGE: Este token, mod y mecanica necesita revision, discusion y debate.

> [!WARNING]
> AVATAR_PROC_TIME: Necesita revision, de la mecanica, el token y posiblemente añadir documentacion por parte de la wiki.

> [!WARNING]
> AVATAR_REVENGE_DAMAGE_AMOUNT: Necesita revision tanto el token como la mecanica.

> [!NOTE]
> AVATAR_ENERGY_ON_FULL_SHIELD_REGEN: Necesita revision.

> [!NOTE]
> AVATAR_BLEEDOUT_MODIFIER: Necesita revision.

---
