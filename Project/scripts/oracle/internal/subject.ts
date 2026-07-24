/**
 * Resolución de sujeto (A1): nombre → `EnsembleIntention`. Único punto de traducción de A1 —
 * hoy indexa el catálogo de fixtures (`BUILDS`), gancho limpio para la boca de intención parcial
 * (Trabajo 2, diferido). Ver `docs/domains/oracle/design/architecture.md` §2 y §4.
 */
import { BUILDS } from '@core/engine/fixtures/builds';
import type { EnsembleIntention } from '@shared/types/ensemble';
import { OracleError } from './types';

/** Expande el sujeto a la lista de builds a recorrer (`all` → todas, si no → una). */
export function subjectNames(subject: string): string[] {
  return subject === 'all' ? Object.keys(BUILDS) : [subject];
}

/** Traduce un nombre de build a su intención. Falla limpio si no existe. */
export function resolveSubject(name: string): EnsembleIntention {
  const factory = BUILDS[name];
  if (!factory) {
    throw new OracleError(`build "${name}" no existe. Disponibles: ${Object.keys(BUILDS).join(', ')}, all.`);
  }
  return factory();
}
