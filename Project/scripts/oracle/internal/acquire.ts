/**
 * Capa 2 — Adquisición: `OracleQuery → AcquiredResult`. Ejerce el motor por sus puertos
 * públicos (`consume`, `project`, `computeCombatMetrics`, trace) y devuelve la forma NATIVA
 * del motor, SIN formatear. El seam con la capa de presentación (§2.1) es donde nacen los
 * contratos que luego se promueven a `@shared`. Ver `docs/domains/oracle/design/architecture.md`.
 */
import { consume } from '@core/engine/output/consume';
import { computeCombatMetrics } from '@core/engine/output/combat-metrics';
import { AbilityRepository, resolveAbilityStrength } from '@core/engine/resolve/hydration/AbilityRepository';
import { project } from '@shared/view-model';
import { EnemyRepository } from '@core/engine/simulate/enemies/EnemyRepository';
import { vitalsOf } from '@core/engine/simulate/EntityState';
import { hostileOnly } from '@core/engine/fixtures/builds';
import { damageReductionFromArmor } from '@core/engine/formulas/enemy/armor-mitigation';
import { effectiveHealthVsEnemy } from '@core/engine/formulas/enemy/effective-health';
import type { SimulationContext, SimulationEntity } from '@core/engine/contracts';
import { resolveSubject, subjectNames } from './subject';
import { OracleError, type OracleQuery, type AcquiredResult } from './types';

export function acquire(q: OracleQuery): AcquiredResult {
  switch (q.lens) {
    case 'nodes':
      return {
        lens: 'nodes',
        builds: subjectNames(q.subject).map((name) => ({
          name,
          entities: consume(resolveSubject(name), { flags: {} }).snapshot(),
        })),
      };

    case 'display':
      return {
        lens: 'display',
        builds: subjectNames(q.subject).map((name) => ({
          name,
          view: project(consume(resolveSubject(name), { flags: {} }).snapshot()),
        })),
      };

    case 'metrics': {
      // UN SOLO ESCENARIO. `consume` resuelve el mundo entero —el hostil con su nivel ya compuesto y
      // los modifiers del escenario encima— y de ahí salen LAS DOS puntas: el arma y el objetivo.
      // Antes esta lente descartaba el objetivo resuelto y construía uno nuevo desde `--vs`/`--lvl`,
      // que nunca había visto el escenario: un build que declaraba nivel 100 corrido con `--lvl 50`
      // daba C1 a 100 y C2 a 50, y un debuff `ENEMY_*` compuesto en C1 no llegaba al daño.
      const intention = resolveSubject(q.subject);
      const scene = consume(intention, { flags: {} }).snapshot();
      const weapon = firstWeapon(scene, q.subject);

      // Si el build DECLARA su hostil, ése es el objetivo — con lo que el escenario le hizo. Si no
      // declara ninguno, los flags `--vs`/`--lvl`/`--eximus` lo declaran y se resuelve por el mismo
      // camino. Un build con hostil propio ignora `--eximus`: la declaración del escenario manda,
      // mismo criterio que ya regía para `--vs`/`--lvl`.
      const declared = scene.find((e) => e.tags.includes('enemy'));
      const target = declared ?? hostileEntity(q.a2.enemy, q.a2.level, q.a2.eximus);
      const targetLevel = declared ? (intention.hostile[0]?.level ?? q.a2.level) : q.a2.level;

      const metrics = computeCombatMetrics(weapon, target, baseContext(), q.a2.duration);
      return {
        lens: 'metrics', build: q.subject, weapon, target,
        targetName: displayName(target), targetLevel,
        metrics, duration: q.a2.duration,
      };
    }

    case 'trace': {
      const c = consume(resolveSubject(q.subject), { flags: {} }, { trace: true });
      const node = q.node as string; // dispatch garantiza --node presente para trace
      // Sobre la entidad que POSEE el nodo (no la primera weapon): traza warframes (AVATAR_*)
      // igual que armas, y desambigua builds multi-entidad.
      //
      // Se selecciona con `at()` y no con `weapon()`: acá ya se tiene la entidad, así que lo que
      // corresponde es su coordenada. `weapon()` busca por molde y con dos participantes del mismo
      // ítem devolvería el primero — que no es necesariamente el que tiene el nodo.
      const entity = entityWithNode(c.snapshot(), node, q.subject);
      return { lens: 'trace', build: q.subject, entityId: entity.id, node, steps: c.at(entity.id).trace(node) };
    }

    case 'enemy': {
      // Por el mismo camino que cualquier participante: se declara un escenario con este hostil solo
      // y se lee lo que C1 resolvió. Es lo que hace que esta lente y `metrics` no puedan divergir.
      const entity = hostileEntity(q.subject, q.a2.level, q.a2.eximus);
      const vitals = vitalsOf(entity);
      const dr = damageReductionFromArmor(vitals.armor);
      const ehp = effectiveHealthVsEnemy(vitals.armor, {
        health: vitals.health, shield: vitals.shields, overguard: vitals.overguard,
      });
      return {
        lens: 'enemy', query: q.subject, level: q.a2.level,
        entity, name: displayName(entity), vitals, dr, ehp,
      };
    }

    case 'ability': {
      // dispatch ya garantiza --ability presente para esta lente.
      const abilityId = q.ability as string;
      const scene = consume(resolveSubject(q.subject), { flags: {} }).snapshot();
      // Sin warframe en el build, no hay caster que declare el nodo — `resolveAbilityStrength` y
      // `getEmissions` ya degradan a su default (1 / sin peer) con un id que no matchea ninguna entidad.
      const sourceId = warframeEntity(scene)?.id ?? '';
      const strength = resolveAbilityStrength(sourceId, scene); // sólo para mostrar — F3 ya no lo re-deriva
      const emissions = AbilityRepository.getEmissions(abilityId, sourceId, scene);
      return { lens: 'ability', build: q.subject, abilityId, strength, emissions };
    }

    default:
      // 'intention' (u otra lente sin adquisición) — dispatch ya la rechaza; guarda por si acaso.
      throw new OracleError(`lente "${q.lens}" no adquirible.`);
  }
}

// ─── helpers ───

/** ⚠️ Limitación heredada: `active_profile_id='base'` no propaga el perfil real del build
 *  (ej. Lanka 'charged_shot'); afecta sólo el lookup de reload_time (fidelidad menor). */
function baseContext(): SimulationContext {
  return { active_profile_id: 'base', flags: {}, variables: {} };
}

/** La primera arma del build. Multi-arma: toma la primera (selección explícita = trabajo futuro). */
function firstWeapon(entities: SimulationEntity[], build: string): SimulationEntity {
  const weapon = entities.find((e) => e.domain === 'weapon');
  if (!weapon) throw new OracleError(`el build "${build}" no tiene entidad de arma (domain=weapon).`);
  return weapon;
}

/** El warframe del build, si tiene uno — `undefined` es legítimo (ej. un build sólo-arma). */
function warframeEntity(entities: SimulationEntity[]): SimulationEntity | undefined {
  return entities.find((e) => e.domain === 'warframe');
}

/** La entidad que posee el nodo pedido (para trace). Multi-entidad con el mismo nodo: la primera. */
function entityWithNode(entities: SimulationEntity[], node: string, build: string): SimulationEntity {
  const hit = entities.find((e) => e.attributes[node]);
  if (!hit) {
    throw new OracleError(
      `ningún entity del build "${build}" tiene el nodo "${node}". Entidades: ${entities.map((e) => e.id).join(', ')}.`,
    );
  }
  return hit;
}

/**
 * Warden y Prosecutor son Eximus que la wiki declara EXENTOS de Overguard (Health extra en su lugar,
 * no modelado) — `--eximus` genérico les daría el número creíble y falso que #38 vetó para el caso
 * general. Detección por nombre, imperfecta a propósito (mismo riesgo que `OQ-ENGINE-31` ya midió
 * fallar para Acolytes): un falso negativo deja el estado tan roto como sin esta guarda, nunca peor.
 * Gap completo, con la cita de la wiki y el catálogo real: #50.
 */
const EXIMUS_OVERGUARD_EXEMPT = /warden|prosecutor/i;

/**
 * El hostil como PARTICIPANTE resuelto: declara un escenario con él solo y devuelve lo que C1
 * compuso. Reemplaza al `EnemyRepository.scale(dna, level)` que armaba un objeto paralelo — el
 * objetivo entra al cálculo por el mismo camino que todos los demás, o no entra.
 *
 * `EnemyRepository.find` sobrevive porque hace otra cosa: resolver un nombre display ("Arid Butcher")
 * al `unique_name` canónico. Eso es búsqueda, no composición.
 */
function hostileEntity(query: string, level: number, isEximus?: boolean): SimulationEntity {
  const dna = EnemyRepository.find(query);
  if (!dna) throw new OracleError(`enemigo "${query}" no encontrado (probá el name display o el unique_name).`);
  if (isEximus && EXIMUS_OVERGUARD_EXEMPT.test(dna.name ?? dna.unique_name)) {
    throw new OracleError(
      `"${dna.name ?? dna.unique_name}" — la wiki declara a Warden/Prosecutor Eximus EXENTOS de ` +
        `Overguard (Health extra en su lugar, no modelado). --eximus acá daría un número falso. Ver #50.`,
    );
  }
  const entity = consume(hostileOnly(dna.unique_name, level, isEximus), { flags: {} }).snapshot()[0];
  if (!entity) throw new OracleError(`el enemigo "${query}" no resolvió a ninguna entidad.`);
  return entity;
}

/** Nombre legible de un participante: el display del catálogo si existe, si no su `unique_name`. */
function displayName(entity: SimulationEntity): string {
  return EnemyRepository.find(entity.unique_name)?.name ?? entity.unique_name;
}
