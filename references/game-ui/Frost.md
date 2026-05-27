# FROST — /Lotus/Powersuits/Frost/Frost

##P Cold Status Effects from Frost's Abilities last 100% longer. Frost gains 50 Armor for ach enemy afflicted with <DT_COLD> Cold within & <AFFINITY> Affinity Range.

## /Lotus/Powersuits/PowersuitAbilities/IcicleAbility
// 1 - FREEZE
Drain: <ENERGY> 25 $EFFICIENCY
Damage: <DT_COLD> 350 $STRENGTH
Area Damage: <DT_COLD> 150 $STRENGTH
Freeze Duration: <DT_COLD> 15s $DURATION
Radius: 5m $RANGE
### FREEZE FORCE
Radius: 15m $RANGE
Extra Damage: <DT_COLD> 100% $STRENGTH
Duration: 40s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/IceSpikeAbility
// 2 - ICE WAVE
Drain: <ENERGY> 50 $EFFICIENCY
Damage: <DT_COLD> 700 $STRENGTH
Freeze Duration: <DT_COLD> 10s $DURATION
Wave Width: 3m $RANGE
Wave Length: 20m $RANGE
Angle: 45° $RANGE
#### ICE WAVE IMPEDANCE
Duration 12s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/IceShieldAbility
// 3 - SNOW GLOBE
Drain: <ENERGY> 50 $EFFICIENCY
Radius: 5m $RANGE
Cold Status / Second: <DT_COLD> 0,33
Freeze Duration: <DT_COLD> 10s $DURATION
Health: 5.075 $STRENGTH
Time Invulnerable: 4s
Area Damage: <DT_COLD> 150 $STRENGTH
#### CHILLING GLOBE
Status Chance: 50%

## /Lotus/Powersuits/PowersuitAbilities/AvalancheAbility
// 4 - AVALANCHE
Drain: <ENERGY> 100 $EFFICIENCY
Damage: <DT_COLD> 1.500 $STRENGTH
Radius: 15m $RANGE
Freeze Duration: <DT_COLD> 8s $DURATION
Armor Reduction: 60% $STRENGTH
Explosion Radius: 4,5m $RANGE
Explosion Damage: <DT_COLD> 400 $STRENGTH
#### ICY AVALANCHE
Overguard: 60 $STRENGTH
Overguard Cap: 15.000 $STRENGTH
Armor To Overguard Conversion: 20% $STRENGTH

//! "Biting Frost" augment its "passive" like, meaby check this before passives schema testing