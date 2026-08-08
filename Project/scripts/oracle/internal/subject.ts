/**
 * Resolución de sujeto (A): nombre → `Scene`. Único punto de traducción de A, desde
 * dos fuentes: el catálogo de fixtures (`BUILDS`, por nombre) o un archivo JSON parcial (por path,
 * completado sobre el skeleton canónico). Ver `docs/domains/oracle/design/architecture.md` §2 y §4.
 */
import { readFileSync } from 'node:fs';
import { BUILDS } from '@core/engine/fixtures/builds';
import type { Scene } from '@shared/types/scene';
import { OracleError } from './types';
import { sceneFromPartial, isPlainObject, type DeepPartial } from './partial';

/** Expande el sujeto a la lista de builds a recorrer (`all` → catálogo entero, si no → una). */
export function subjectNames(subject: string): string[] {
  return subject === 'all' ? Object.keys(BUILDS) : [subject];
}

/** Traduce un sujeto a su intención: archivo `.json` (parcial) o build del catálogo. */
export function resolveSubject(subject: string): Scene {
  if (looksLikePath(subject)) return loadPartial(subject);

  const factory = BUILDS[subject];
  if (!factory) {
    throw new OracleError(`build "${subject}" no existe. Disponibles: ${Object.keys(BUILDS).join(', ')}, all.`);
  }
  return factory();
}

// ─── archivo JSON parcial ───

function looksLikePath(subject: string): boolean {
  return subject.endsWith('.json') || subject.includes('/');
}

function loadPartial(path: string): Scene {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    throw new OracleError(`no pude leer el archivo "${path}".`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new OracleError(`el archivo "${path}" no es JSON válido: ${(e as Error).message}`);
  }

  if (!isPlainObject(raw)) {
    throw new OracleError(`el archivo "${path}" debe ser una Scene (parcial), no ${Array.isArray(raw) ? 'un array' : typeof raw}.`);
  }
  return sceneFromPartial(raw as DeepPartial<Scene>);
}
