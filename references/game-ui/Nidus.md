# NIDUS — /Lotus/Powersuits/Infestation/Infestation

##P If Nidus is killed with at least 15 stacks of Mutation, those 15 stacks are consumed; this grants 5s of invulnerability and restores Health to 50%.

//! Nidus have 15% Strength "passive" for "Rank bonuses"

## /Lotus/Powersuits/PowersuitAbilities/InfestRuptureAbility
// 1 - VIRULENCE
Drain: <ENERGY> 40 $EFFICIENCY
Damage: 200 $STRENGTH
Length: 16m $RANGE
Energy Refund / Hit: <DT_IMPACT> <DT_PUNCTURE> <DT_SLASH> 10  $EFFICIENCY //! Efficiency affect "negative".
#### TEEMING VIRULENCE
Critical Chance: 120% $STRENGTH
Duration: 15s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/InfestTendrilsAbility
// 2 - LARVA
Drain: <ENERGY> 25 $EFFICIENCY
Radius: 12m $RANGE
Duration: 7s $DURATION
#### LARVA BURST
Radius: 8m $RANGE
Area Damage: <DT_TOXIN> 600 $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/InfestLinkAbility
// 3 - PARASITIC LINK
Mutation Stacks Cost: 1
Duration: 60s $DURATION
Ally Range: 40m $RANGE
Damage Increase: 25% $STRENGTH
Enemy Range: 20m $RANGE
Damage Redirection: 50% $STRENGTH
#### PARASITIC VITALITY
Max Health: 4% $STRENGTH

## /Lotus/Powersuits/PowersuitAbilities/InfestPodsAbility
// 4 - RAVENOUS
Mutation Stacks Cost: 3
Explosion Radius: 4m $RANGE
Maggot Rupture Damage: <DT_BLAST> 150 $STRENGTH
Radius: 8m
Regen Rate / Second: 20 $STRENGTH
Duration: 40s $DURATION
#### INSATIABLE
Success Chance: 60% $STRENGTH