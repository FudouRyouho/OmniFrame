# GAUSS — /Lotus/Powersuits/Runner/Runner

##P Moving generates an electrical current that fills Gauss' battery. Shields recharge up to 120% faster while the Recharge Delay is up to 80% shorter, based on the battery level.

## /Lotus/Powersuits/PowersuitAbilities/RunnerRushAbility
// 1 - MACH RUSH
Drain: <ENERGY> 15 $EFFICIENCY
Drain / Second: <ENERGY> 12,5 $DRAIN
Range: 12m
Speed: 25m/s
Radius: 4m $RANGE
Explosion Radius: 10m $RANGE
Explosion Damage: <DT_IMPACT> 800 $STRENGTH
#### MACH CRASH
Radius: 8m $RANGE

## /Lotus/Powersuits/PowersuitAbilities/RunnerPlatingAbility
// 2 - KINETIC PLATING
Drain: <ENERGY> 50 $EFFICIENCY
Duration: 30s $DURATION
Damage Reduction: 20 - 100% $STRENGTH //! only affected first value, second value cap on 100
Energy Conversion: 5%

## /Lotus/Powersuits/PowersuitAbilities/RunnerTransferAbility
// 3 - THERMAL SUNDER
Drain: <ENERGY> 50 $EFFICIENCY
Radius: 12m $RANGE
Duration: 15s $DURATION
Status Duration: 4-8s $DURATION
Cold Damage: <DT_COLD> 150 - 750 $STRENGTH
Heat Damage: <DT_HEAT> 300 - 1.500 $STRENGTH
#### THERMAL TRANSFER
Extra Damage: 75% $STRENGTH
Duration: 30s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/RunnerRedlineAbility
// 4 - REDLINE
// Do NOT add $$ tokens to the four speed buffs below: they are min-max ranges and the
// battery level (passive) decides where inside the range each one lands. Annotating them
// would emit one extreme silently. Deferred on purpose — see wiki/warframes/gauss/redline.md
Drain: <ENERGY> 100 $EFFICIENCY
Duration: 30s $DURATION
Fire Rate: 15-75% $DURATION
Attack Speed: 8 - 40% $DURATION
Reload Speed: 10 - 50% $DURATION
Casting Speed: 10 - 50% $DURATION
Area Damage: <DT_IMPACT> <DT_PUNCTURE> 400 $STRENGTH