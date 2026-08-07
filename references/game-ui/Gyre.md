# GYRE — /Lotus/Powersuits/Gyre/Gyre

##P Gyre's abilities have a 10% chance to deal critical damage for each Electrical status that affects the enemy.

## /Lotus/Powersuits/PowersuitAbilities/GyrePulseAbility
// 1 - ARCSPHERE
Drain: <ENERGY> 25 $EFFICIENCY
Duration: 10s $DURATION
Radius: 4 - 7m $RANGE
Damage: <DT_ELECTRICITY> 2.000 $STRENGTH
Damage / Second: <DT_ELECTRICITY> 250 $STRENGTH
#### CONDUCTIVE SPHERE
Extra Damage: <DT_ELECTRICITY> 75% $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/GyreSphereAbility
// 2 - COIL HORIZON
Drain: <ENERGY> 50 $EFFICIENCY
Damage / Second: <DT_ELECTRICITY> 1.500 $STRENGTH
Explosion Damage: <DT_ELECTRICITY> 1.250 $STRENGTH
Explosion Radius: 12m $RANGE
#### COIL RECHARGE
Duration: 20s $DURATION
Discharge Range: 5m
Discharge Damage: <DT_ELECTRICITY> 500 $STRENGTH
Discharge / Meter: 15m
Discharge Chains: 5
Discharge Frequency: 4 - 0,25s
Discharge Frequency Reduction: 0,5s

## /Lotus/Powersuits/PowersuitAbilities/GyreEnergizedAbility
// 3 - CATHODE GRACE
Drain: <ENERGY> 75 $EFFICIENCY
Cooldown: <TIMER> 60
Duration: 8s $DURATION
Duration / Kill: 3s $DURATION
Critical Chance: 50% $STRENGTH
Energy Rate: <ENERGY> 1,5 $STRENGTH
#### CATHODE CURRENT
Damage: 200%

## /Lotus/Powersuits/PowersuitAbilities/GyreOverchargedAbility
// 4 - ROTORSWELL
Drain: <ENERGY> 100 $EFFICIENCY
Duration: 22s $DURATION
Range: 4m $RANGE
Damage: <DT_ELECTRICITY> 250 $STRENGTH
Discharge Range: <DT_ELECTRICITY> 10m $RANGE
Discharge Damage: <DT_ELECTRICITY> 500 $STRENGTH
#### REVERSE ROTORSWELL
Damage Redirection: 35% $STRENGTH
Status Chance: <DT_ELECTRICITY> 10% $STRENGTH

//! Gyre have a "native" critical chance/damage on abilitys, "CATHODE GRACE" affected abilitys, weapons, I no remenber if affect a companions