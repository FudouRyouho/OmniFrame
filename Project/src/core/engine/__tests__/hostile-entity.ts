/**
 * Objetivos para tests de C2 — el reemplazo de `EnemyRepository.scale(dna, level)`.
 *
 * El estado ya no nace de un `ScaledEnemy` paralelo sino de la **entidad resuelta de C1**
 * (`simulation-architecture.md` §El escenario consolidado), así que un test que necesita un target
 * necesita una entidad. Hay dos maneras legítimas y NO son intercambiables:
 *
 *   `hostileEntity`   → del CATÁLOGO, por el camino real (escenario → C1). Lo que llega al estado es
 *                       lo que el escenario compuso, debuffs incluidos. Para tests que ejercen datos
 *                       reales del juego (DR de un Arid Butcher, matriz ③ contra un Charger).
 *   `syntheticHostile`→ INVENTADO, sin catálogo ni pipeline. Para tests de LEY pura, donde el target
 *                       es un banco de pruebas con números elegidos a mano y la facción es neutral.
 *
 * La distinción importa: un test de ley que pase por el catálogo se rompe cuando el dato del juego
 * cambia, y uno de dato que use números inventados no prueba nada.
 */
import type { SimulationEntity, AttributeNode } from '../contracts';
import type { UnitClass } from '../contracts/unit-class';
import { consume } from '../output/consume';
import { hostileOnly } from '../fixtures/builds';
import { EnemyRepository } from '../simulate/enemies/EnemyRepository';

/**
 * Entidad hostil del catálogo, resuelta por el camino real. Requiere `loadEngineData` previo.
 * Acepta `unique_name` o el nombre display ("Arid Butcher") — la búsqueda la hace `EnemyRepository`,
 * que sobrevive a la disolución de `scale` porque resolver un nombre no es componer un participante.
 */
export function hostileEntity(query: string, level: number): SimulationEntity {
  const dna = EnemyRepository.find(query);
  if (!dna) throw new Error(`hostileEntity: "${query}" no existe en el catálogo de enemigos.`);
  const found = consume(hostileOnly(dna.unique_name, level), { flags: {} })
    .snapshot()
    .find(e => e.unique_name === dna.unique_name);
  if (!found) throw new Error(`hostileEntity: "${query}" no resolvió a ninguna entidad.`);
  return found;
}

/** Nodo ya resuelto: en un objetivo sintético no hay mods que aplicar, así que `final === base`. */
const flat = (value: number): AttributeNode => ({
  base: value, base_flat: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1, final: value,
});

export interface SyntheticHostileSpec {
  health?: number;    // default 1000
  armor?: number;     // default 0 — sin armadura, sin DR
  shields?: number;   // default 0 — sin escudos, todo hit va a salud
  faction?: string;
  uniqueName?: string;
  /**
   * Qué unidad es (`contracts/unit-class.ts`) — la llave de los desvíos de ley del receptor. Se
   * **declara**, igual que los vitales y que los stacks del harness: lo que se ejerce es la ley, no de
   * dónde salió la clase. Que en el dato real venga de `enemy-stats.override.json` es otro test.
   */
  unitClass?: readonly UnitClass[];
}

/**
 * Objetivo inventado, sin pasar por el catálogo. Sólo materializa los nodos que el spec declara —
 * mismo criterio de **gate por presencia** que `ItemRepository`: un nodo con base 0 acepta un buff
 * porcentual y devuelve un 0 que parece verdadero, mientras que la ausencia no aterriza nada.
 */
export function syntheticHostile(spec: SyntheticHostileSpec = {}): SimulationEntity {
  const health = spec.health ?? 1000;
  const armor = spec.armor ?? 0;
  const shields = spec.shields ?? 0;

  const attributes: Record<string, AttributeNode> = { ENEMY_ADD_HEALTH_MAX: flat(health) };
  if (armor > 0) attributes.ENEMY_ADD_ARMOUR = flat(armor);
  if (shields > 0) attributes.ENEMY_ADD_SHIELD_MAX = flat(shields);

  return {
    id: spec.uniqueName ?? 'synthetic-hostile',
    unique_name: spec.uniqueName ?? 'synthetic-hostile',
    persistence: 'TE',
    tags: ['enemy'],
    routes: ['enemy'],   // a qué destinos responde — el ruteo de modifiers
    channel: 'enemy',    // qué física base le toca (`contracts/unit-class.ts`)
    ...(spec.faction ? { faction: spec.faction } : {}),
    // Qué unidad ES, cuando eso cambia qué ley recibe. Grano distinto del canal, no un duplicado: un
    // acólito lleva `channel: 'enemy'` —lo necesita para tener vitales— y otra ley de status.
    ...(spec.unitClass ? { unit_class: spec.unitClass } : {}),
    attributes,
  };
}

/**
 * El espejo del anterior **del lado jugador**: mismos tres vitales, familia `AVATAR_*` y el canal que
 * elija el caso. Existe porque las leyes se eligen por **clase de unidad** y no por marca de ruteo
 * (`contracts/unit-class.ts`), así que un test de ley del lado jugador necesita un portador cuyos
 * nodos y cuyo canal concuerden — pisarle el `channel` a un hostil deja los vitales en 0 en silencio.
 *
 * `routes: ['avatar']` en los dos casos, y eso **es el punto**: el compañero porta la misma marca de
 * ruteo que el warframe —la necesita, para recibir `AVATAR_*`— y recibe otra ley.
 */
export function syntheticAvatar(
  spec: SyntheticHostileSpec & { channel?: string } = {},
): SimulationEntity {
  const health = spec.health ?? 1000;
  const armor = spec.armor ?? 0;
  const shields = spec.shields ?? 0;

  const attributes: Record<string, AttributeNode> = { AVATAR_ADD_HEALTH_MAX: flat(health) };
  if (armor > 0) attributes.AVATAR_ADD_ARMOUR = flat(armor);
  if (shields > 0) attributes.AVATAR_ADD_SHIELD_MAX = flat(shields);

  return {
    id: spec.uniqueName ?? `synthetic-${spec.channel ?? 'warframe'}`,
    unique_name: spec.uniqueName ?? `synthetic-${spec.channel ?? 'warframe'}`,
    persistence: 'TE',
    tags: [spec.channel ?? 'warframe'],
    routes: ['avatar'],
    channel: spec.channel ?? 'warframe',
    ...(spec.faction ? { faction: spec.faction } : {}),
    attributes,
  };
}
