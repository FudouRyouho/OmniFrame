# RHINO — /Lotus/Powersuits/Rhino/Rhino

##P Emit a shockwave dealing 100 damage after landing from a great height.

## /Lotus/Powersuits/PowersuitAbilities/RhinoChargeAbility
// 1 - RHINO CHARGE
Drain: <ENERGY> 25 $EFFICIENCY
Speed: 48m/s
Range: 12m $RANGE
Damage: <DT_IMPACT> 650 $STRENGTH
Radius: 2m $RANGE
Combo Window: 1s $DURATION
#### IRONCLAD CHARGE
Armor Increase: 50% $STRENGTH
Duration: 10s $DURATION

## /Lotus/Powersuits/PowersuitAbilities/IronSkinAbility
// 2 - IRON SKIN
Drain: <ENERGY> 50 $EFFICIENCY
Overguard: 1.925 $STRENGTH
Time Invulnerable: 3s
#### IRON SHRAPNEL
Damage: <DT_PUNCTURE> 100%
Radius: 8m $RANGE

## /Lotus/Powersuits/PowersuitAbilities/RhinoRoarAbility
// 3 - ROAR
Drain: <ENERGY> 75 $EFFICIENCY
Duration: 30s $DURATION
Radius: 25m $RANGE
Damage Increase: 50% $STRENGTH $$GAMEPLAY_MULT_FACTION_DAMAGE
#### PIERCING ROAR
Radius: 25m $RANGE
Debuff Duration: 1x $DURATION

## /Lotus/Powersuits/PowersuitAbilities/RhinoStompAbility
// 4 - RHINO STOMP
Drain: <ENERGY> 100 $EFFICIENCY
Damage: <DT_BLAST> 800 $STRENGTH
Radius: 25m $RANGE
Speed Decrease: 97,5%
Duration: 8s $DURATION
#### REINFORCING STOMP
Restoration: 4%