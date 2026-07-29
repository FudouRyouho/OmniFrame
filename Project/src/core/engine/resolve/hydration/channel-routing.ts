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
