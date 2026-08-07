# EMBER — /Lotus/Powersuits/Ember/Ember

##P Receive 5% Ability Strength for every enemy within <AFFINITY> Affinity Range, affected by <DT_HEAT> Heat.

## /Lotus/Powersuits/PowersuitAbilities/FireBallAbility
// 1 - FIREBALL
Drain: <ENERGY> 25 $EFFICIENCY
Damage: <DT_HEAT> 400 - 800 $STRENGTH
Area Damage: <DT_HEAT> 150 - 300 $STRENGTH
Radius: 3m $RANGE
Combo Window: 1,5s $DURATION
Immolation Meter: 1% / s
#### FIREBALL FRENZY
Radius: 15m $RANGE
Extra Damage: <DT_HEAT> 100% $STRENGTH
Duration: 40s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/EmberImmolationAbility
// 2 - IMMOLATION
Drain: <ENERGY> 50 $EFFICIENCY
Drain Increase / Second: <ENERGY> 0,4 $DRAIN
Damage Reduction: 40 - 85% $STRENGTH //! 50 - 90% cap
Immolation Meter: 0,5% / s
#### IMMOLATED RADIANCE
Damage Reduction: 20 - 43% $STRENGTH //! needed check cap for this

## /Lotus/Powersuits/PowersuitAbilities/FireBlastAbility
// 3 - FIRE BLAST
Drain: <ENERGY> 75 - 25 $EFFICIENCY
Damage: <DT_HEAT> 200 $STRENGTH
Radius: 25m $RANGE
Immolation Meter On Cast: -50%
Immolation Meter: -2% / s
Armor Reduction: 50 - 100%
#### HEALING FLAME
Health: 25 - 50 $STRENGTH
Overguard Cap: 10.000 $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/EmberInfernoAbility
// 4 - INFERNO
Energy / Target: <ENERGY> 10 $EFFICIENCY
Explosion Radius: 25m $RANGE
Initial Damage: <DT_IMPACT> <DT_HEAT> 2.500 $STRENGTH
Damage / Second: <DT_HEAT> 350 - 700 $STRENGTH
Duration: 15s $DURATION
Immolation Meter: 3% / s
Angle: 67,5°
#### EXOTHERMIC
Drop Chance: 15%


//! NEEDED CHECK FORMULAS FOR THIS