# LAVOS — /Lotus/Powersuits/Alchemist/Alchemist

//! Lavos not have energy pool, he use cooldown and reductions, it's a unique mechanics for her, edge-case.

##! Energy and Universal Orbs give Lavos status immunity for 10s. Hold any ability to imbue the next cast with additional Elemental Damage and Status.
//! VALENCE FORMATION it's a "global" or "passive like" augment

//! EFFICIENCY in lavos have diferents mechanics "Modifies ability cooldown reduction granted by Transmutation Probe."

//! lavos have "STATUS DURATION": "Scales with Ability Duration. Modifies the duration of any status dealt by Lavos with either abilities or weapons.

## /Lotus/Powersuits/PowersuitAbilities/AlchemistSerpentAbility
// 1 - 
Cooldown: <TIMER> 8 $EFFICIENCY
Range: 10m $RANGE
Damage: <DT_TOXIN> 1.000 $STRENGTH
Health Drain: 15% $STRENGTH
#### SWIFT BITE
Cooldown Reduction: 4s $EFFICIENCY
Range: 30%

## /Lotus/Powersuits/PowersuitAbilities/AlchemistVialAbility
// 2 - 
Cooldown: <TIMER> 5
Range: 30m $RANGE
Damage / Second: <DT_COLD> 250 $STRENGTH
Number Of Charges: 24
Duration: 8s $DURATION
Explosion Radius: 9m $RANGE

## /Lotus/Powersuits/PowersuitAbilities/AlchemistTransmuteAbility
// 3 - 
Cooldown: <TIMER> 10
Damage: <DT_ELECTRICITY> 250 $STRENGTH
Range: 6m $RANGE
Cooldown Reduction: 1,5s $EFFICIENCY
#### LINGERING TRANSMUTATION
Duration: 15s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/AlchemistDistillAbility
// 4 - 
Cooldown: <TIMER> 30
Range: 25m $RANGE
Damage: <DT_HEAT> 2.000 $STRENGTH
