# EQUINOX — /Lotus/Powersuits/YinYang/YinYang

##P 10% of Health Orbs are converted into Energy, and 10% of Energy Orbs are, converted into Health.

## /Lotus/Powersuits/PowersuitAbilities/YinYangSwitchAbility
// 1 - METAMORPHOSIS
Drain: <ENERGY> 25 $EFFICIENCY
Duration: 25s $DURATION
### Day
Damage Multiplier: 1,25x $STRENGTH
Speed Increase: 15% $STRENGTH
### Night
Shield Capacity: 150 $STRENGTH
Armor: 250 $STRENGTH
#### DUALITY
Duration: 10s $DURATION
Damage Multiplier: 300%

## /Lotus/Powersuits/PowersuitAbilities/YinYangTargetAbility
// 2 - REST & RAGE
Drain: <ENERGY> 25 $EFFICIENCY
Range: 50m
Duration: 22s $DURATION
Radius: 5m
### Day
Damage Vulnerability: 50% $STRENGTH
Speed Increase: 20% $STRENGTH
### Night
Wakeup Health Threshold: 50%
#### CALM & FRENZY
Radius: 5m
Duration: 100%

## /Lotus/Powersuits/PowersuitAbilities/YinYangAuraAbility
// 3 - PACIFY & PROVOKE
Drain: <ENERGY> 10 $EFFICIENCY
Radius: 16m
### Day
Energy / Ability: <ENERGY> 3 $EFFICIENCY
Strength: 20% $STRENGTH
### Night
Energy / Enemy: <ENERGY> 0,5 $EFFICIENCY
Damage Multiplier: 0,5x $STRENGTH
#### PEACEFUL PROVOCATION
Slow: 40% $STRENGTH
Strength: 15% $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/YinYangBurstAbility
// 4 - MEND & MAIM
Drain: <ENERGY> 50 $EFFICIENCY
Drain / Second: <ENERGY> 3,5 $DURATION
Radius: 18m
### Day
Damage: <DT_SLASH> 150 $STRENGTH
Damage Multiplier: 0,75x
### Night
Health Multiplier: 0,75x
Shield / Kill: 25 $STRENGTH
#### ENERGY TRANSFER
Conversion Percent: 100%
