# SARYN — /Lotus/Powersuits/Saryn/Saryn

##P Status Effects inflicted upon enemies last 25% longer.
//! need check passive es globalty (affect weapons, companions, etc) in wiki or formulas.

## /Lotus/Powersuits/PowersuitAbilities/PoisonAbility
// 1 - SPORES
Drain: <ENERGY> 25 $EFFICIENCY
Range: 60m $RANGE
Damage / Second: <DT_CORROSIVE> 10 $STRENGTH
Damage Growth / Enemy: <DT_CORROSIVE> 2 $STRENGTH
Status Chance: 50% $STRENGTH
Spread Radius: 16m $RANGE
Decay Rate: 10% $DURATION
Reset Decay: 20% $STRENGTH
#### REVEALING SPORES
Radius: 40m $RANGE
#### VENOM DOSE
Radius: 15m $RANGE
Extra Damage: <DT_CORROSIVE> 100% $STRENGTH
Duration: 40s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/ShedAbility
// 2 - MOLT
Drain: <ENERGY> 50 $EFFICIENCY
Duration: 40s $DURATION
Health: 500 $STRENGTH
Radius: 10m $RANGE
Damage: <DT_TOXIN> 400 $STRENGTH
Speed Multiplier: 1,5x $STRENGTH
Buff Duration: 5s $DURATION
#### REGENERATIVE MOLT
Health / Second: 50 $STRENGTH
Heal Time: 10s

## /Lotus/Powersuits/PowersuitAbilities/WeaponPoisonAbility
// 3 - TOXIC LASH
Drain: <ENERGY> 50 $EFFICIENCY
Extra Damage: <DT_TOXIN> 30% $STRENGTH
Duration: 45s $DURATION
#### CONTAGION CLOUD
Effect Radius: 5m $RANGE
Duration: 12s $DURATION
Damage / Second: <DT_TOXIN> 300 $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/ExplosiveDissolveAbility
// 4 - MIASMA
Drain: <ENERGY> 75 $EFFICIENCY
Radius: 20m $RANGE
Damage / Second: <DT_VIRAL> 150 $STRENGTH
Duration: 6s $DURATION
Spore Damage Multiplier: 4x