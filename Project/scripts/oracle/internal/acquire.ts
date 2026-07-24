/**
 * Capa 2 — Adquisición: `OracleQuery → AcquiredResult`. Ejerce el motor por sus puertos
 * públicos (`consume`, `project`, `computeCombatMetrics`, trace) y devuelve la forma NATIVA
 * del motor, SIN formatear. El seam con la capa de presentación (§2.1) es donde nacen los
 * contratos que luego se promueven a `@shared`. Ver `docs/domains/oracle/design/architecture.md`.
 */
import { consume } from '@core/engine/output/consume';
import { computeCombatMetrics } from '@core/engine/output/combat-metrics';
import { project } from '@shared/view-model';
import { EnemyRepository } from '@core/engine/simulate/enemies/EnemyRepository';
import { damageReductionFromArmor } from '@core/engine/formulas/enemy/armor-mitigation';
import { effectiveHealthVsEnemy } from '@core/engine/formulas/enemy/effective-health';
import { BASELINE_GAME_LAWS } from '@core/engine/contracts';
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
      const weapon = firstWeapon(consume(resolveSubject(q.subject), { flags: {} }).snapshot(), q.subject);
      const target = EnemyRepository.scale(findEnemy(q.a2.enemy), q.a2.level);
      const metrics = computeCombatMetrics(weapon, target, baseContext(), q.a2.duration);
      return { lens: 'metrics', build: q.subject, weapon, target, metrics, duration: q.a2.duration };
    }

    case 'trace': {
      const c = consume(resolveSubject(q.subject), { flags: {} }, { trace: true });
      const node = q.node as string; // dispatch garantiza --node presente para trace
      // Sobre la entidad que POSEE el nodo (no la primera weapon): traza warframes (AVATAR_*)
      // igual que armas, y desambigua builds multi-entidad. `weapon()` selecciona por id, cualquier domain.
      const entity = entityWithNode(c.snapshot(), node, q.subject);
      return { lens: 'trace', build: q.subject, entityId: entity.id, node, steps: c.weapon(entity.id).trace(node) };
    }

    case 'enemy': {
      const scaled = EnemyRepository.scale(findEnemy(q.subject), q.a2.level);
      const dr = damageReductionFromArmor(scaled.current_armor);
      const ehp = effectiveHealthVsEnemy(scaled.current_health, scaled.current_armor, scaled.current_shields);
      return { lens: 'enemy', query: q.subject, level: q.a2.level, scaled, dr, ehp };
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
  return { active_profile_id: 'base', flags: {}, variables: {}, laws: { ...BASELINE_GAME_LAWS } };
}

/** La primera arma del build. Multi-arma: toma la primera (selección explícita = trabajo futuro). */
function firstWeapon(entities: SimulationEntity[], build: string): SimulationEntity {
  const weapon = entities.find((e) => e.domain === 'weapon');
  if (!weapon) throw new OracleError(`el build "${build}" no tiene entidad de arma (domain=weapon).`);
  return weapon;
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

function findEnemy(query: string) {
  const dna = EnemyRepository.find(query);
  if (!dna) throw new OracleError(`enemigo "${query}" no encontrado (probá el name display o el unique_name).`);
  return dna;
}
