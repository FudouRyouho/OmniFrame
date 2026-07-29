/**
 * @domain Engine / Hydration / Channel routing
 * @SSoT docs/data/decisions.md (D-6 §sub-familia) + docs/governance/open-questions.md (OQ-ENGINE-11)
 *
 * Resuelve el `{cuál}` de un modifier: qué entidad(es) alcanza un canal.
 *
 * POR QUÉ EXISTE. El canal es del **token**, no de la pertenencia: un warframe contiene TRES armas,
 * así que "las armas del warframe" no dice *cuál*. Un Archon Shard de crit melee, o un arcano de
 * warframe que buffea la primaria, declaran su destino en el token (`WEAPON_MELEE_ADD_CRIT_MULT`,
 * `WEAPON_PRIMARY_ADD_DAMAGE`) — y el salto lateral (Blade Charger: kill con rifle → daño de melee)
 * no lo deriva ninguna contención.
 *
 * DEVUELVE UNA LISTA, NO UN VALOR. Hoy un canal resuelve a 0 o 1 entidad, pero la verdad del juego
 * es N: `references/wiki/systems/archon-shards/archon-shards-table.md` dice, para los tres shards de
 * canal, *"Affects Exalted Weapons of the appropriate class"*. Las exaltadas no están modeladas
 * (`OQ-ENGINE-11`), y ese mismo OQ ya se comprometió a materializarlas como **arma de canal real**
 * para que "el ruteo agnóstico de buffs de C la alcance gratis". Con firma escalar ese "gratis" es
 * falso —la exaltada le pisaría el slot al arma equipada, o quedaría fuera—; con lista, aterriza sin
 * volver a tocar esta función.
 *
 * POR QUÉ FILTRA ENTIDADES Y NO LEE EL `Ensemble`. `Ensemble.weapons` tiene **un slot por canal**:
 * una exaltada no entra ahí sin cambiarle la forma. Las entidades ya construidas sí admiten N por
 * canal, y `StaticHydrator` estampa `channel` al construirlas. Filtrar la lista de entidades es la
 * única de las dos vías que cumple la promesa de arriba.
 */
import type { EntityId, SimulationEntity } from "../../contracts";

/**
 * Entidades que alcanza un canal. Vacío = el canal no tiene arma equipada (el modifier se descarta;
 * mismo criterio que tenía el loop de shards).
 */
export function resolveChannelEntities(
  channel: string,
  entities: SimulationEntity[],
): EntityId[] {
  return entities.filter(e => e.channel === channel).map(e => e.id);
}

/**
 * Entidades que alcanza la FAMILIA de un token — el `{dónde}` cuando no hay sub-familia.
 *
 * Segundo eje del mismo `{cuál}` de arriba, para el cruce cross-entity. `resolveToken` sólo emite
 * `target_channel` bajo `WEAPON` (la sub-familia es exclusiva de esa familia: preguntar "¿cuál de
 * las tres armas?" no tiene sentido en `AVATAR`), así que un buff que sale de un warframe hacia
 * `AVATAR_ADD_MOVEMENT_SPEED` o `MELEE_ADD_ATTACK_SPEED` llega acá **sin canal** y sin nada que
 * diga a qué entidad apunta.
 *
 * La familia ya lo dice, y es la misma doctrina que gobierna la materialización de nodos: el token
 * declara el dominio. `AVATAR_*` es del warframe, `MELEE_*` del arma cuerpo a cuerpo, `WEAPON_*`
 * de toda arma equipada (el ALL-scope de Roar).
 *
 * La alternativa —fan-out a todas las entidades y dejar que el modifier se pierda donde el nodo no
 * existe— *funciona* hoy por accidente (verificado: el buff de reload de Speed llega a una melee y
 * se descarta porque el nodo no está). Pero es ruteo por ausencia: el día que dos entidades
 * materialicen el mismo token, el buff aterriza en las dos sin que nadie lo haya declarado.
 */
export function resolveFamilyEntities(
  family: string,
  entities: SimulationEntity[],
): EntityId[] {
  switch (family) {
    case 'AVATAR':   return entities.filter(e => e.domain === 'warframe').map(e => e.id);
    case 'MELEE':    return entities.filter(e => e.channel === 'melee').map(e => e.id);
    // `WEAPON` y `GAMEPLAY` comparten destino y NO por conveniencia: el pool global de daño
    // (`GAMEPLAY_MULT_FACTION_DAMAGE`, el de Roar) vive en el arma igual que un stat de arma
    // — `arch-decisions §16`. La familia dice "pool global", el dominio sigue siendo el arma.
    case 'WEAPON':
    case 'GAMEPLAY': return entities.filter(e => e.domain === 'weapon').map(e => e.id);
    // Sin caso ⇒ el buff no aterriza. Deliberado: una familia nueva debe declarar su destino
    // acá, no heredar el de las armas por descarte. El censo del override cubre las cuatro.
    default:         return [];
  }
}
