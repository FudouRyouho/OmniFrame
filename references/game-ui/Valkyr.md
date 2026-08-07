# VALKYR — /Lotus/Powersuits/Berserker/Berserker

##P Valkyr accumulates Rage when hitting or killing enemies with melee weapons, increasing her Melee Damage up to 300%. Taking fatal damage when the Rage meter is above 150% consumes the meter, preventing death and granting 5s of invulnerability.

## /Lotus/Powersuits/PowersuitAbilities/GrappleHookAbility
// 1 - RIP LINE
Drain: <ENERGY> 25 $EFFICIENCY
Range: 75m $RANGE
Radius: 9m $RANGE
Damage: <DT_SLASH> 600 $STRENGTH
Combo Window: 1s $DURATION
#### SWING LINE

## /Lotus/Powersuits/PowersuitAbilities/BerserkerScreamAbility
// 2 - WARCRY
Drain: <ENERGY> 75 $EFFICIENCY
Duration: 20s $DURATION
Armor Increase: 50% $STRENGTH $$AVATAR_ADD_ARMOUR
Attack Speed: 50% $STRENGTH $$MELEE_ADD_ATTACK_SPEED
#### ETERNAL WAR
Time / Kill: 2s $DURATION
Max Duration: 40s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/ShieldBashAbility
// 3 - PARALYSIS
Drain: <ENERGY> 25 $EFFICIENCY
Duration: 15s $DURATION
Radius: 10m $RANGE
Damage: <DT_IMPACT> 400 $STRENGTH
Knockback Strength: 1.000 $STRENGTH
Damage Vulnerability: 50% $STRENGTH
Speed Decrease: 30% $STRENGTH //! cap 75%
#### PROLONGED PARALYSIS

## /Lotus/Powersuits/PowersuitAbilities/LastStandAbility
// 4 - HYSTERIA //! EXALTED
Drain: <ENERGY> 25 $EFFICIENCY
Damage: <DT_SLASH> <DT_PUNCTURE> 250 $STRENGTH
Drain / Second: <ENERGY> 5 $DRAIN
Life Steal: <HEALTH> 100 $STRENGTH
Armor Increase: 3x
#### ENRAGED
#### HYSTERICAL ASSAULT