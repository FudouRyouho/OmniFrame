/**
 * @domain Engine / Contracts — qué clase de emisor es una instancia
 * @SSoT references/wiki/mechanics/universal-weapon-bonuses.md
 *
 * **El hermano de `unit-class.ts`, del lado source.** `unit_class` responde *"qué unidad ES el
 * receptor, cuando eso cambia qué ley recibe"* (un acólito topea Corrosive en 4). Esto responde la
 * misma pregunta del otro lado: **qué clase de emisor es, cuando eso cambia qué buff puede recibir**.
 *
 * ─── POR QUÉ EXISTE, Y POR QUÉ NO ES UN TOKEN ─────────────────────────────────────────────────────
 *
 * El juego tiene una clase que nosotros no teníamos: habilidades que **están codificadas como armas**.
 * La fuente las nombra — *"often referred to as **"Weapon Damage Abilities"**, as the game treats them
 * like weapons for the purposes of which buffs they are eligible for"* — y `Ability_Damage` lo repite
 * sin metáfora: *"some Warframe Abilities **coded as "weapons""***.
 *
 * ⚠️ **Esto NO se modela acuñando un token.** Se midió: sobre 116 tokens `AVATAR_*` del dato real de
 * DE, **ninguno tipa daño emitido** — los únicos tipados del lado avatar son `AVATAR_CHANCE_RESIST_*`
 * (recibir), y el único emisor es `AVATAR_ADD_ABILITY_DAMAGE`, **sin tipo**. Un `AVATAR_ADD_HEAT_DAMAGE`
 * sería un vocablo que el juego no tiene y que ninguna fuente pediría. La elegibilidad es una **marca
 * del emisor**, no una familia de token; el token de daño quedó reducido a su trabajo legítimo —el
 * bucket de upgrade— por el corte de `damage-logic.ts` §los dos trabajos.
 *
 * ─── POR QUÉ ES UNA LISTA Y NO UNA REGLA ──────────────────────────────────────────────────────────
 *
 * La fuente insinúa un criterio (*"usually ones that are **projectile-based**"*) y **su propia tabla lo
 * desmiente**: Warding Halo, el círculo de fuego de Uriel y Sun Portal son campos persistentes, no
 * proyectiles. Derivar la marca de "es un proyectil" sería inventar una regla que el juego no aplica.
 * La lista la mantiene DE y la publica la wiki; nosotros la importamos y la verificamos contra el
 * catálogo — el test de integridad es el que impide que una entrada muera en silencio cuando el dato
 * se mueva (mismo patrón que `curateEnemies` con `UNIT_CLASSES`).
 */

/**
 * Las habilidades que el juego trata como armas para elegibilidad de buffs, por `unique_name`.
 *
 * Resueltas contra `public/data/ability-stats.override.json`, **no escritas de memoria**: el nombre de
 * la wiki es display y la clave del catálogo es el path de Lotus, que casi nunca coincide (Shuriken es
 * `GlaiveAbility`, Polarize es `ShieldRegenAbility`, Warding Halo es `NezhaSashAbility`).
 *
 * ⚠️ **Falta Jade Stars (Sirius)** — la wiki la lista y el catálogo **no la tiene**. No se inventa la
 * clave: el dataset de ítems está deliberadamente atrasado (`OQ-DATA-16`), así que la entrada aparece
 * cuando el dato la traiga. Declarar un `unique_name` inexistente haría fallar el test de integridad,
 * que es exactamente lo que ese test existe para atrapar.
 */
export const WEAPON_DAMAGE_ABILITIES: readonly string[] = [
  "/Lotus/Powersuits/PowersuitAbilities/GlaiveAbility",              // Ash — Shuriken
  "/Lotus/Powersuits/PowersuitAbilities/PacifistDisarmAbility",      // Baruuk — Desolate Hands
  "/Lotus/Powersuits/PowersuitAbilities/DragonBreathAbility",        // Chroma — Spectral Scream (+ Afterburn)
  "/Lotus/Powersuits/PowersuitAbilities/FireBallAbility",            // Ember — Fireball
  "/Lotus/Powersuits/PowersuitAbilities/RadialJavelinAbility",       // Excalibur — Radial Javelin
  "/Lotus/Powersuits/PowersuitAbilities/UmbraRadialJavelinAbility",  // Excalibur Umbra — ídem
  "/Lotus/Powersuits/PowersuitAbilities/GarudaShieldAbility",        // Garuda — Dread Mirror
  "/Lotus/Powersuits/PowersuitAbilities/GarudaUnstoppableAbility",   // Garuda — Seeking Talons
  "/Lotus/Powersuits/PowersuitAbilities/RunnerRedlineAbility",       // Gauss — Redline
  "/Lotus/Powersuits/PowersuitAbilities/KoumeiStringsAbility",       // Koumei — Kumihimo
  "/Lotus/Powersuits/PowersuitAbilities/ShieldRegenAbility",         // Mag — Polarize
  "/Lotus/Powersuits/PowersuitAbilities/SoulPunchAbility",           // Nekros — Soul Punch
  "/Lotus/Powersuits/PowersuitAbilities/NezhaSashAbility",           // Nezha — Warding Halo
  "/Lotus/Powersuits/PowersuitAbilities/NokkoLaunchAbility",         // Nokko — Sporespring
  "/Lotus/Powersuits/PowersuitAbilities/NullStarAbility",            // Nova — Null Star (+ Neutron Star)
  "/Lotus/Powersuits/PowersuitAbilities/OraxiaSpidersAbility",       // Oraxia — Widow's Brood
  "/Lotus/Powersuits/PowersuitAbilities/RevenantMarkAbility",        // Revenant — Enthrall
  "/Lotus/Powersuits/PowersuitAbilities/HopliteImpaleAbility",       // Styanax — Axios Javelin
  "/Lotus/Powersuits/PowersuitAbilities/HopliteArmyAbility",         // Styanax — Final Stand
  "/Lotus/Powersuits/PowersuitAbilities/TempleShredAbility",         // Temple — Pyrotechnics
  // Uriel — el círculo de fuego que Gulphagor deja al hacer latch. ⚠️ La correspondencia NO es 1:1:
  // la fuente lista el **campo**, y la habilidad del catálogo es la que invoca a la criatura. Entra
  // igual porque la elegibilidad es del warframe y la fuente lo dice sin ambigüedad — *"buffs must be
  // applied to **Uriel himself** […] buffs on Gulphagor will have no effect"*. Es el rol *dueño* con
  // una entidad derivada de habilidad en el medio (`OQ-ENGINE-11`), y el primer caso de la lista donde
  // la marca viaja más lejos que la habilidad que la porta.
  "/Lotus/Powersuits/PowersuitAbilities/DemonFrameCloneAbility",     // Uriel — Demonium (Gulphagor)
  "/Lotus/Powersuits/PowersuitAbilities/WerewolfHowlAbility",        // Voruna — Ulfrun's Descent
  "/Lotus/Powersuits/PowersuitAbilities/WispHarnessAbility",         // Wisp — Breach Surge (+ Cataclysmic Gate)
  "/Lotus/Powersuits/PowersuitAbilities/TenguBurstAbility",          // Zephyr — Airburst
  // Vauban: la fuente declara el orbe de **las cuatro** habilidades, no una.
  "/Lotus/Powersuits/PowersuitAbilities/ZapTrapAbility",             // Vauban — Tesla Nervos
  "/Lotus/Powersuits/PowersuitAbilities/TrapperMultinadeAbility",    // Vauban — Minelayer (incl. Tether/Flechette Orb)
  "/Lotus/Powersuits/PowersuitAbilities/LevTrapAbility",             // Vauban — Bastille
  "/Lotus/Powersuits/PowersuitAbilities/TrapperStrikeAbility",       // Vauban — Photon Strike
] as const;

const _WDA = new Set(WEAPON_DAMAGE_ABILITIES);

/**
 * ¿Esta habilidad es de las que el juego trata como arma?
 *
 * Devuelve `false` para lo que no está en la lista, y eso **no** es *"no sabemos"*: la fuente enumera,
 * así que ausencia de la lista es ausencia de la clase. Lo que sí es *"no sabemos"* son las habilidades
 * que la wiki lista y el catálogo todavía no trae — ver la nota de Jade Stars arriba.
 */
export function isWeaponDamageAbility(uniqueName: string | undefined): boolean {
  return uniqueName !== undefined && _WDA.has(uniqueName);
}
