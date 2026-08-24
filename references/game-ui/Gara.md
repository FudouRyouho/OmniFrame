# GARA — /Lotus/Powersuits/Glass/Glass

##P A chance to create a radial blind lasting 10s when Gara casts Abilities.

## /Lotus/Powersuits/PowersuitAbilities/GlassShankAbility
// 1 - SHATTERED LASH //! EXALTED
Drain: <ENERGY> 25 $EFFICIENCY
Range: 12m $RANGE
Damage: <DT_PUNCTURE> 400 $STRENGTH
Arcing Damage: <DT_SLASH> 400 $STRENGTH
Radius: 1,75m
#### SHATTERED STORM
Damage: 100%

## /Lotus/Powersuits/PowersuitAbilities/GlassShatterAbility
// 2 - SPLINTER STORM
Drain: <ENERGY> 50 $EFFICIENCY
Range: 30m $RANGE
Radius: 2,5m $RANGE
Damage / Second: <DT_IMPACT> <DT_PUNCTURE> <DT_SLASH> 250 $STRENGTH
Duration: 22s $DURATION
Damage Reduction: 70% $STRENGTH //! 90% cap
Damage Multiplier: 1,35x $STRENGTH
#### MENDING SPLINTERS
Health / Second: 15 $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/GlassFragmentAbility
// 3 - SPECTRORAGE
Drain: <ENERGY> 75 $EFFICIENCY
Duration: 22s $DURATION
Number Of Mirrors: 12 $RANGE
Damage: <DT_IMPACT> <DT_PUNCTURE> <DT_SLASH> 800 $STRENGTH
Area Damage: <DT_IMPACT> <DT_PUNCTURE> 1.500 $STRENGTH
#### SPECTROSIPHON
Energy Orb Drop: 50%

## /Lotus/Powersuits/PowersuitAbilities/GlassRingAbility
// 4 - MASS VITRIFY
Drain: <ENERGY> 75 $EFFICIENCY
Drain / Second: <ENERGY> 5 $DRAIN
Max Radius: 11m $DURATION $RANGE //! Double "upgrade" edge-case, needed check formulas for this ability.
Health: 2.600 $STRENGTH
Damage Multiplier: 1,5x $STRENGTH
Effect Duration: 16s $DURATION
Explosion Range: 15m $RANGE
Explosion Damage: <DT_PUNCTURE> <DT_SLASH> <DT_IMPACT> 800 $STRENGTH