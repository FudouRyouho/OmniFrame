# VOLT — /Lotus/Powersuits/Volt/Volt

##P Grounded movement generates an electrical charge building up 10 Damage per meter that is unleashed with the next attack.

## /Lotus/Powersuits/PowersuitAbilities/ShockAbility
// 1 - SHOCK
Drain: <ENERGY> 15 $EFFICIENCY
Chain Links: 5
Damage: <DT_ELECTRICITY> 200 $STRENGTH
Range: 15m $RANGE
#### SHOCK TROOPER
Radius: 15m $RANGE
Extra Damage: <DT_ELECTRICITY> 100% $STRENGTH
Duration: 40s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/SpeedAbility
// 2 - SPEED
Drain: <ENERGY> 25 $EFFICIENCY
Radius: 25m $RANGE
Duration: 12s $DURATION
Speed Multiplier: 1,75x $STRENGTH
Reload Speed: 25% $STRENGTH
#### SHOCKING SPEED
Area Damage: <DT_ELECTRICITY> 300 $STRENGTH
Radius: 3m $RANGE

## /Lotus/Powersuits/PowersuitAbilities/ShieldAbility
// 3 - ELECTRIC SHIELD
Drain: <ENERGY> 50 $EFFICIENCY
Duration: 25s $DURATION
Extra Damage: <DT_ELECTRICITY> 50%
#### TRANSISTOR SHIELD
Damage Absorption: 300% $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/OverLoadAbility
// 4 - DISCHARGE
Drain: <ENERGY> 100 $EFFICIENCY
Radius: 20m $RANGE
Effect Radius: 8m $RANGE
Duration: 4s
Damage / Second: <DT_ELECTRICITY> 1.200 $STRENGTH
Effect Duration: 6s $DURATION
#### CAPACITANCE
Damage Absorption: <SHIELD> 3%