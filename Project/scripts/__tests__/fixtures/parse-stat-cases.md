# FIXTURE — /Lotus/Powersuits/Fixture/Fixture

Fixture de `parse-ability-md.test.ts`. NO es corpus: no vive en `references/game-ui/` y no alimenta
ningún override. Cada línea es un caso real copiado del corpus, con el archivo de origen anotado.

## /Lotus/Powersuits/PowersuitAbilities/FixtureValuesAbility
// #31 gap 2 — valor negativo
Immolation Meter On Cast: -50%
Immolation Meter: -2% / s
Time / Kill: -4s
// #31 gap 3 — unidad compuesta (Rhino.md:8, Sevagoth.md:29, Vauban.md:43)
Speed: 48m/s
Range Increase: 2m/s
Debuff Amount: 10%/s $STRENGTH
// no-regresión — formas que YA parseaban antes del fix
Drain: <ENERGY> 25 $EFFICIENCY
Damage: <DT_IMPACT> 500 - 2.000 $STRENGTH
Radius: 5 - 15m $RANGE
Duration: 25s $DURATION
Energy Multiplier: 2x $STRENGTH
Angle: 180°
Health: 8.000
Speed Multiplier: 1,75x $STRENGTH $$AVATAR_ADD_MOVEMENT_SPEED $$MELEE_ADD_ATTACK_SPEED

## /Lotus/Powersuits/PowersuitAbilities/FixtureGroupsAbility
Radius: 16m $RANGE
// Titania.md:28 — el grupo entero se perdía porque su única stat era negativa
### DUST
Hit Chance: -50%
// sigue sin parsear A PROPÓSITO: icono POSTFIJO (Koumei.md:10), valor no deducible
### DICE
Damage: 25x <KOUMEI_DICE_1>
// sigue sin parsear A PROPÓSITO: falta el ':' que el README declara obligatorio (Nezha.md:42)
### SAFEGUARD
Strength 50%
