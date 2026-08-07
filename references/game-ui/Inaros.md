# INAROS — /Lotus/Powersuits/Sandman/Sandman

##P When Inaros takes lethal damage, he entombs himself in a sarcophagus and incarnates as sand to attack enemies, draining their lifeforce to revive himself.

## /Lotus/Powersuits/PowersuitAbilities/SandmanBlastAbility
// 1 - DESICCATION
Drain: <ENERGY> 25 $EFFICIENCY
Damage: <DT_TRUE> 150 $STRENGTH
Range: 15m $RANGE
Duration: 8s $DURATION
Damage / Second: <DT_TRUE> 8 $STRENGTH
Life Steal: 25%
#### DESICCATION’S CURSE
Success Chance: 100%

## /Lotus/Powersuits/PowersuitAbilities/SandmanStormAbility
// 2 - SANDSTORM
Drain: <ENERGY> 25 $EFFICIENCY
Damage / Second: <DT_SLASH> 500 $STRENGTH
Radius: 7,5m $RANGE
Duration: 4s $DURATION
Health Per Enemy: 50 $STRENGTH
#### ELEMENTAL SANDSTORM
Status Chance: 100% $STRENGTH
Range: 50%

## /Lotus/Powersuits/PowersuitAbilities/SandmanArmorAbility
// 3 - SCARAB SHELL
Status Protection Cost: 5%
Armor: 350 $STRENGTH
Health: 2.500
#### NEGATION ARMOR

## /Lotus/Powersuits/PowersuitAbilities/SandmanSwarmAbility
// 4 - SCARAB SWARM
Drain: <ENERGY> 100 $EFFICIENCY
Damage: <DT_CORROSIVE> 241 //! scale with health, literaly "vitality" maxed (100% health) affected this number "483". need discution for this edge-case
Range: 30m $RANGE
Spread Range: 12m $RANGE
Duration: 15s $DURATION
