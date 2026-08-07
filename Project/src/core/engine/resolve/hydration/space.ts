import type { Ensemble } from "../../contracts";

/**
 * EL ESPACIO — quiénes participan de una simulación, antes de hidratar a ninguno.
 *
 * POR QUÉ EXISTE. El conjunto de participantes se construía inline dentro de `StaticHydrator.hydrate`
 * con cuatro `push` sobre el ensemble, y eso ataba dos cosas que no son la misma: **qué existe** en la
 * simulación y **cómo se hidrata** cada cosa. Con el conjunto adentro del hidratador, el loadout no era
 * *una* fuente de participantes — era la única posible, y nada que no fuera warframe o arma podía
 * existir aunque el motor supiera resolverlo.
 *
 * Separarlos vuelve al loadout un **poblador**: aporta cuatro participantes, y otro poblador podría
 * aportar un compañero, un objetivo de defensa o un enemigo sin tocar la hidratación.
 *
 * Lo que este módulo NO hace: no hidrata, no resuelve, no conoce nodos ni modifiers. Sólo dice quién
 * está y con qué viene.
 */
export interface EntityIntent {
  entity_id: string;
  /**
   * Canal del ensemble ('warframe' | 'primary' | 'secondary' | 'melee'). Se estampa en la entidad y
   * es lo que consulta el ruteo por canal (`channel-routing.ts`). El bridge también lo escribe, pero
   * POST-resolve y sólo para la salida — demasiado tarde para que C lo use.
   */
  channel: string;
  /**
   * Marcas de ruteo con las que este participante entra al espacio. Viven en el intent y no en el
   * DNA porque son una propiedad de **participar**, no de ser un ítem: un enemigo no tiene DNA de
   * arsenal del cual derivarlas, y el mismo ítem puede entrar con marcas distintas según el rol.
   */
  routes: string[];
  slots: Record<number, { mod_id?: string; level?: number }>;
  profile_id: string;
  evolution_perks?: Record<number, string>;
  arcanes?: Record<number, { arcane_id: string; rank: number }>;
}

/**
 * Poblador de loadout: el warframe y hasta tres armas equipadas.
 *
 * El orden importa y se conserva — el warframe primero, porque los buffs cross-entity que emite
 * necesitan que las armas ya existan cuando se resuelven (`AbilityRepository` recibe el array de
 * entidades completo).
 */
export function populateFromLoadout(ensemble: Ensemble): EntityIntent[] {
  const intents: EntityIntent[] = [];

  intents.push({
    entity_id: ensemble.warframe.id,
    channel: "warframe",
    routes: ["avatar"],
    slots: ensemble.warframe.slots,
    profile_id: "base",
    arcanes: ensemble.warframe.arcanes,
  });

  const weapons = [
    ['primary',   ensemble.weapons.primary]  as const,
    ['secondary', ensemble.weapons.secondary] as const,
    ['melee',     ensemble.weapons.melee]     as const,
  ];

  for (const [channel, weapon] of weapons) {
    if (!weapon) continue;
    intents.push({
      entity_id: weapon.id,
      channel,
      // `MELEE_*` apunta al arma cuerpo a cuerpo *equipada*: es propiedad del slot, no del ítem.
      routes: channel === 'melee' ? ['weapon', 'melee'] : ['weapon'],
      slots: weapon.slots,
      profile_id: weapon.active_profile_id,
      evolution_perks: weapon.evolution_perks,
      arcanes: weapon.arcanes,
    });
  }

  // El compañero entra por la MISMA lista que el loadout, no por un camino paralelo: es la prueba
  // de que el espacio es el conjunto de participantes y el loadout sólo uno de sus pobladores.
  if (ensemble.companion) {
    intents.push({
      entity_id: ensemble.companion.id,
      channel: "companion",
      // Un compañero recibe `AVATAR_*` sin ser un warframe — lo que el ruteo por `domain` no podía
      // expresar y la fuente sí declara (`references/wiki/warframes/valkyr/warcry.md`).
      routes: ["avatar"],
      slots: ensemble.companion.slots,
      profile_id: "base",
    });
  }

  // El objetivo, si se declaró. Entra por la misma lista: es un participante más.
  if (ensemble.enemy) {
    intents.push({
      entity_id: ensemble.enemy.id,
      channel: "enemy",
      routes: ["enemy"],
      slots: {},
      profile_id: "base",
    });
  }

  return intents;
}
