# GRENDEL — /Lotus/Powersuits/Devourer/Devourer

##P Each enemy consumed grants 250 bonus armor.

## /Lotus/Powersuits/PowersuitAbilities/DevourerDevourAbility
// 1 - FEAST
Drain: <ENERGY> 25 $EFFICIENCY
Radius: 25m $RANGE
Damage: <DT_TOXIN> 500 $STRENGTH
Damage / Second: 2%
#### GOURMAND
Drain: <HEAL> 200 $EFFICIENCY //! cost energy is disable, drain heal on use
Armor: 150

## /Lotus/Powersuits/PowersuitAbilities/DevourerConsumeAbility
// 2 - NOURISH
Drain: <ENERGY> 50 $EFFICIENCY
Damage: 20% $STRENGTH
Duration: 25s $DURATION
Radius: 25m $RANGE
Health: 1000 $STRENGTH
Energy Multiplier: 2x $STRENGTH
Explosion Damage: <DT_VIRAL> 250 $STRENGTH
Explosion Radius: 12m $RANGE
Damage Increase: <DT_VIRAL> 75% $STRENGTH
#### HEARTY NOURISHMENT
Duration: 5s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/DevourerBowlAbility
// 3 - PULVERIZE
Drain / Second: <ENERGY> 3 $DRAIN
Damage: <DT_IMPACT> 500 - 2.000 $STRENGTH
Damage / Second: <DT_TOXIN> 25 $STRENGTH
Health / Second: 200 $STRENGTH
Armor Reduction: 50% $STRENGTH
Area Damage: <DT_IMPACT> 150 - 500 $STRENGTH
Radius: 5 - 15m $RANGE
#### CATAPULT
Energy: 5 $EFFICIENCY

## /Lotus/Powersuits/PowersuitAbilities/DevourerRegurgitateAbility
// 4 - REGURGITATE
Drain <ENERGY> 50 $EFFICIENCY
Damage: <DT_TOXIN> 2.000 $STRENGTH
Radius: 6m $RANGE
Armor Reduction: 75% $STRENGTH
#### GASTRO
Duration: 8s $DURATION
Damage: <DT_GAS> 250 $STRENGTH
Status Effect / Second: <DT_GAS> 1
Falloff Per Bounce: 75%