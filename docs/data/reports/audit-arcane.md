---
Estado: activo
Rol: auditoria-manual
Version: "v0.1.0"
Impacto_ID: "D-18"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Fecha_de_creacion: "2026-06-02"
Fecha_de_actualizacion: "2026-06-02"
---

# Auditoría manual — arcane-stats.override.json

---

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/AmmoEfficiencyOnSliding

> ✅ Resuelto 2026-06-02. condition token compuesto queda (OR semántico válido). Notas añadidas: weapon-type gate (Dual Pistols, no modelable hoy), OR semántico documentado para futura array de condition, sinergia Zazvat-Kar.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/MaxEnergyForArmor

> ✅ Resuelto 2026-06-02. Fórmula cross-stat documentada (AddEnergy = Armor × |val1|, cap 1000, dinámico). Bug Violet Archon Shard / threshold 500 Energy capturado en notes. Ref OQ-W-6.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/AbilityStrengthForMaxHealth

> ✅ Resuelto 2026-06-02. Fórmula real continua documentada: round(MaxHealth ÷ 250 × |val1|%). Cap |val2| correcto. Cross-stat (MaxHealth → AbilityStrength), ref OQ-W-6.

# /Lotus/Upgrades/CosmeticEnhancers/Defensive/IncreaseMaxHealthOnHealthPickup

> ✅ Resuelto 2026-06-02. Stacking acumulativo: per_stack = |val1|, cap 50×, max rank 5 = 1200 HP. Patrón per_stack+cap gateado por consumidor (D-20).

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/HealCompanionOnSixMeleeKills

> ✅ Resuelto 2026-06-02. condition: null (trigger parametrizado contador+ventana, puerta 3 D-20). Notas añadidas: mecánica heal instantáneo, tipos de companion, no-revive, ciclo de trigger.

# /Lotus/Upgrades/CosmeticEnhancers/Defensive/StealDefensiveStatsOnRoll

> ✅ Resuelto 2026-06-02. condition añadida (on_roll_through_enemy). ability-like (puerta 2): roba Armor + Shields + Overguard simultáneamente (label solo dice "defenses"). Caps: Armor 1k, OG 10k, Shields → Overshields. Radio ~4m, toma enemigo con mayor Armor.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/RadialKnockdownOnEnergyPickup

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): Knockdown = CC mecánica, sin token. Notas expandidas: proc = base_value, mecánica de knockdown, inmunidades. Doc creado: docs/data/references/wiki/mechanics/knockdown.md

# /Lotus/Upgrades/CosmeticEnhancers/Defensive/InvulnerabilityOnDeathOnMercyKill

> ✅ Resuelto 2026-06-02. Dos fases documentadas: acumulación (mercy kill → +1 stack, cap 9×) + consumo (fatal damage → 3 stacks → invulnerabilidad |val1|s). Stacks como recurso consumible. ability-like (puerta 2).

# /Lotus/Upgrades/CosmeticEnhancers/Defensive/ShieldMaxForAbilityStrength

> ✅ Resuelto 2026-06-02 (sesión anterior). Fórmula cross-stat + Arcane Revive en notes. Sin condition. Ref OQ-W-6. Ver override para detalle.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/AbilityHeatProcsGiveCritChance

> ✅ Resuelto 2026-06-02. Notas expandidas: Universal Weapon Bonus, stack per infliction (no per proc), todos los stacks expiran/refrescan juntos, excepciones por habilidad (Flechette sí, Breach Surge no), Archon Vitality sin efecto.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/AbilityPowerOnFreeze

> ✅ Resuelto 2026-06-02. Fidelidad fix: upgrade_type: null → tokens correctos + base_value: [2] para constantes AS/AD (patrón SecondaryCritOnHit). Notas: stacking colectivo (todos expiran/refrescan juntos), companion weapons excluidas.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/AbilityStatusProcsGiveAbilityStrengthAndEfficiency

> ✅ Resuelto 2026-06-02. condition añadida (on_ability_inflicts_unique_status_type). Notas: 1 stack por tipo único (cap realista 13), refresco con cualquier daño de habilidad, excepciones (Sickening Pulse sólo refresca, Knockdown oculto no cuenta).

# /Lotus/Upgrades/CosmeticEnhancers/Utility/RadialHealOnHealthPickup

> ✅ Resuelto 2026-06-02. upgrade_type: null correcto (no existe token para AoE ally heal). Notas: efecto es heal de aliados (no self), radio 25m, proc 60% + cooldown 15s constantes.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/NoCostCastChanceOnCast

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): mechanic de 3 charges energía-cero, sin token. Notas: anti-loop (habilidades negadas no re-procan), habilidades sin costo no activan ni consumen, solo cast inicial gratis en canalizadas.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/SlowerBleedOutOnPredeath

> No aparece en wiki (404) ni en el juego live. Existe en los archivos internos de DE (fuente @wfcd/items con level_stats poblado). Posible cut content / arcano nunca lanzado. Verificación pendiente: datamine histórico o confirmación de que nunca fue obtenible. El override conserva los valores de la fuente. No tocar hasta confirmar.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/DamageReductionDuringRevive

> ✅ Resuelto 2026-06-02. DR durante revive, valores negativos correctos. Candidato a AVATAR_ADD_DAMAGE_REDUCTION gateado por while_reviving. Sin mecánica adicional.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/InvisibilityOnFinisher

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): invisibilidad = mecánica de estado, sin token engine. 15% proc chance constante (no en base_value). Notas: tipos de finisher válidos, ausencia de interacción con duration mods.

# /Lotus/Upgrades/CosmeticEnhancers/Defensive/RadialViralAttackOnOverguardGain

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): radial AoE + Viral status = mecánica, sin token. Notas: 10 stacks = max WF, escala con múltiplos 3k, LoS, sin cooldown.

# /Lotus/Upgrades/CosmeticEnhancers/Zariman/SecondaryOnStatusProcBonusDamage

> ✅ Resuelto 2026-06-02. Daño tipo DINÁMICO (adopta tipo del proc). No afectado por damage/crit mods. Excepciones: Void/ColdMaggots no activan, Toxic Lash sí. Sin cooldown. Sin token — tipo resuelto en runtime.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/ChannelKillEnergyRate

> ✅ Resuelto 2026-06-02. Stacking documentado: max 3×, total rank 3 = 15 energy/s. Token energy rate incierto, candidato AVATAR_ADD_ENERGY_RATE flagueado en notes. Arcano Zaw (4 ranks).

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/MeleeArcaneProjectileOnJump

> ✅ Resuelto 2026-06-02 (sesión anterior). ability-like (puerta 2): proyectil melee en Aim Glide. Valores de wiki (false null @wfcd). Nota mecánica: 30m threshold + fórmula combo.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/MeleeArcaneShockwaveOnJump

> ✅ Resuelto 2026-06-02 (sesión anterior). ability-like (puerta 2): shockwave AoE. Valores de wiki. Nota mecánica: dimensiones, daño Blast/Viral, suspend duration.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/GroundSlamPull

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): pull = desplazamiento de enemigos a rango melee, sin token. proc:50% constante. Zaw (4 ranks).

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/FinisherLifesteal

> ✅ Resuelto 2026-06-02. Life Steal = % daño → HP. Token candidato WEAPON_ADD_LIFESTEAL. proc:50% constante, duration:8s. Zaw (4 ranks).

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/LongbowDamageOnHeadshot

> ✅ Resuelto 2026-06-02. 1-charge buff: bonus al siguiente disparo individual. Bow exclusivo (no crossbows). Consecutivos headshots mantienen buff activo. Token WEAPON_ADD_DAMAGE correcto; engine necesita modelar patrón '1-charge'.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/CritDamageForPunctureStatus

> ✅ Resuelto 2026-06-02. Fórmula: round(PunctureStatus% × 0.1 × |val1|x), cap +50x crit multiplier. Cross-stat passive, ref OQ-W-6.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/ReplayLightCritHits

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): instancia independiente (re-rolllea status, crit tier). Yellow crits únicamente. Bugs conocidos: Toxic Lash y Xata's Whisper.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/MeleeProcsSpread

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): spread elemental AoE. NO spread físicos/Void/CC. Proc:20% constante. Cannot refresh while active documentado. Faction bonus ×2/×3. Optimal: single-element builds.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/MeleeDamageForActiveShields

> ✅ Resuelto 2026-06-02. Cross-stat (Current Shields → Melee Damage). Fórmula: (Shields / 200) × |val1|%, cap 420%. Overshields al 50%. Dinámico. Ref OQ-W-6.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PullEnemiesOnMeleeKill

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): pull mechanic, sin token. proc = base_value (20→45%). Radio 18m constante. Misma mecánica que Exodia Hunt.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/HealAlliesOnEnergySpent

> ✅ Resuelto 2026-06-02. Fórmula: HP = EnergyCost × |val1|. Solo costo inicial del cast. Affinity Range ≈ 50m. Sin token para heal proporcional a energía.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryHeadshotCritMultOnHeadshot

> ✅ Resuelto 2026-06-02 (arcano real: Primary Blight, Toxin status). Stacking documentado: 40× cap, totales rank 5 = 144% Crit Dmg + 72% Multishot. ⚠ uniqueName incongruente con efecto real (posible rename histórico).

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/DamageForBonusArmour

> ✅ Resuelto 2026-06-02. Cross-stat (Armor > 1000 → Primary Dmg): +1% por unidad sobre threshold, cap escalable (250→500%). Threshold 1000 constante. Ref OQ-W-6.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/StatusAndAmmoEfficiencyOnWeakpointHit

> ✅ Resuelto 2026-06-02. Stacking: 10× cap, totales rank 5 = 300% Status Chance + 60% Ammo Efficiency. Weak point = headshots + bodypart markers.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryDamageOnNoMelee

> ✅ Resuelto 2026-06-02 (batch familia Deadhead/Dexterity/Merciless). base_value: null documentado: +20% Damage/stack, cap 3×, 24s. Stacking gateado D-20. Stats pasivos (Headshot Mult, Recoil) correctos.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryDamageOnMeleeKill

> ✅ Resuelto 2026-06-02 (batch familia). base_value: null documentado: +10% Damage/stack, cap 6×, 20s. Combo Duration correcto.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryEnergyRegenOnImpactProc

> ✅ Resuelto 2026-06-02. Stacking: cap 3×, total rank 5 = 3.6 energy/s. Token candidato AVATAR_ADD_ENERGY_RATE.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryCritDmgAndMultishotOnColdProc

> ✅ Resuelto 2026-06-02. Stacking: cap 40×, totales rank 5 = 120% Crit Dmg + 90% Multishot. Estructura idéntica a Primary Blight.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryDamageOnKill

> ✅ Resuelto 2026-06-02 (batch familia). base_value: null documentado: +5% Damage/stack, cap 12×, 4s. Reload Speed correcto.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryJamEnemyWeaponsOnMagneticProc

> ✅ Resuelto 2026-06-02. ability-like (puerta 2): jam ≠ pull — weapon disable CC ~4s. Radio 15m desde target. Solo afecta enemigos armados. Cooldown descendente documentado.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryDamagePerAmmoOnReload

> ✅ Resuelto 2026-06-02. Fórmula no-lineal con MaxMagazineSize (ejemplos en notes). base_value = duración buff. Partial reload proporcional. Holster-reload mods reducen drásticamente efectividad.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/BurningCystOnKill

> ✅ Resuelto 2026-06-02 (batch familia Residual). ability-like (puerta 2): zona Heat. Solo duración escala. Notas: constantes de zona, límite 2 puddles, Theorem interaction.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/IceMistOnKill

> ✅ Resuelto 2026-06-02 (batch familia Residual). ability-like (puerta 2): zona Cold. Solo duración escala. Notas: constantes de zona, límite 2 puddles, Theorem interaction.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/LightningStrikeOnKill

> ✅ Resuelto 2026-06-02 (batch familia Residual). ability-like (puerta 2): zona Electricity. Solo duración escala. Notas: constantes de zona, límite 2 puddles, Theorem interaction.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/ToxicBloodOnKill

> ✅ Resuelto 2026-06-02 (batch familia Residual). ability-like (puerta 2): zona Toxin. Solo duración escala. Notas: constantes de zona, límite 2 puddles, Theorem interaction.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/SecondaryDamageOnNoMelee

> ✅ Resuelto 2026-06-02 (batch familia). base_value: null: +20% Damage/stack, cap 3×, 24s. Trigger: 'Precision Headshot Kill' (scoped) vs Primary Deadhead ('Headshot Kill').

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/SecondaryDamageOnMeleeKill

> ✅ Resuelto 2026-06-02 (batch familia). base_value: null: +10% Damage/stack, cap 6×, 20s. Mirror de Primary Dexterity.

# /Lotus/Upgrades/CosmeticEnhancers/Utility/ExtraProcOnProc

> ✅ Resuelto 2026-06-02. Second random proc del pool del arma. Sin chain (previene loop). Procs secundarios cuentan para Arcane Impetus.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/SecondaryCritOnHit"

> ✅ Resuelto 2026-06-02 (sesión anterior). base_value: [10] para +10% constante + [1-6] para contador de reset. Patrón valor constante hardcodeado.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/OverguardSteal

> ✅ Resuelto 2026-06-02. Dos efectos en label: (1) 1 OG propio por 100 dmg a OG enemigo + (2) x|val1| extra dmg a OG. Segundo stat entry (x8 constante) posible artefacto del generator — flagueado en notes, pendiente limpieza.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/RadialDamageOnMaxRadiationStackHit

> ✅ Resuelto 2026-06-02. AoE proporcional al hit: |val1|% del daño del golpe en |val2|m radio. Tipo dinámico. Threshold 10 stacks Radiation. Sin token.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/SecondaryDamageOnKill

> ✅ Resuelto 2026-06-02 (batch familia). base_value: null: +5% Damage/stack, cap 12×, 4s. Mirror de Primary Merciless.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/ShotgunMultishotAndReloadSpeedOnCloseKill

> ✅ Resuelto 2026-06-02. condition token on_shotgun_kill_within_5m queda (threshold espacial ≠ contador+ventana, es condition directa válida). Notas expandidas: duration 15s, distancia player→target al momento del kill, weapon-type gate shotguns + Archguns (Hotfix 40.0.3).

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/OrbsOnResidualContact

> ✅ Resuelto 2026-06-02 (batch familia Theorem). ability-like (puerta 2): globes orbitantes. Cross-arcane runtime dependency documentada: tipo de daño dinámico desde Residual zone activa, no modelable estáticamente.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/WeaponDamageOnResidualContact

> ✅ Resuelto 2026-06-02 (batch familia Theorem). WEAPON_ADD_DAMAGE correcto. Notas: stacking cap 15x, duration, tipo del bonus = dinámico desde Residual zone.

# /Lotus/Upgrades/CosmeticEnhancers/Offensive/CompanionDamageOnResidualContact

> ✅ Resuelto 2026-06-02 (batch familia Theorem). Sin token companion damage. Notas: stacking cap 15x, duration 20s, radio 90m, tipo dinámico desde Residual zone.

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
- **Stacking estructural (per_stack+cap):** ≥6 casos de misma forma — listo para estructura cuando exista consumidor (puente diferido a `OQ-DATA-2`).