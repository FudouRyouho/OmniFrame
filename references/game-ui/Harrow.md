# HARROW — /Lotus/Powersuits/Priest/Priest

##P Overshield capacity doubled. Start missions at maximum energy.

## /Lotus/Powersuits/PowersuitAbilities/PriestCondemnAbility
// 1 - CONDEMN
Drain: <ENERGY> 25 $EFFICIENCY
Range: 20m $RANGE
Range Increase: 2,5m $RANGE
Duration: 6s $DURATION
Shield / Hit: 150 $STRENGTH
#### TRIBUNAL
Energy: 100%

## /Lotus/Powersuits/PowersuitAbilities/PriestPenanceAbility
// 2 - PENANCE
Drain: <ENERGY> 50 $EFFICIENCY
Initial Heal: 50% $STRENGTH
Duration / 100 Shields: <SHIELD> 1,54s $DURATION
Life Steal: 5% $STRENGTH
Base Duration: 4s $DURATION
Fire Rate: 35% $STRENGTH
Reload Speed: 70% $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/PriestRavageAbility
// 3 - THURIBLE
Drain: <ENERGY>25 $EFFICIENCY
Energy Conversion: 15% $EFFICIENCY $STRENGTH //! Double "upgrade" edge-case, needed check formulas for this ability.
Duration: 35s $DURATION
Radius: 20m $RANGE
Headshot Multiplier: 4x
#### WARDING THURIBLE
Damage Reduction: 50% $STRENGTH 
Energy / Second: <ENERGY> 1 $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/PriestPactAbility
// 4 - COVENANT
Drain: <ENERGY> 100 $EFFICIENCY
Protection Duration: 6s $DURATION
Retaliation Duration: 12s $DURATION
Crit / 100 Damage: 1,5% $STRENGTH
Headshot Multiplier: 4x
#### LASTING COVENANT
Duration: 3s $DURATION