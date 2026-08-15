/**
 * Oráculo del motor — entry del CLI (D2). Adaptador no-reactivo: consume el motor por su puerto
 * `consume()` y serializa a stdout, hermano del adaptador reactivo (UI). Ver el dominio en
 * `docs/domains/oracle/` (identidad + organización target).
 *
 * Tres capas (§2 de `design/architecture.md`): dispatch (`argv → OracleQuery`) → adquisición
 * (`OracleQuery → AcquiredResult`, forma nativa del motor) → presentación (`text|json`).
 * Este archivo sólo orquesta: bootstrap de data → parse → acquire → present.
 *
 *   npm run oracle -- <lente> <sujeto> [flags]   |   npm run oracle -- help
 */
import { loadEngineData } from '@core/engine/bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { parseArgs, isHelpRequest, USAGE } from './internal/dispatch';
import { acquire } from './internal/acquire';
import { present } from './internal/present';
import { OracleError } from './internal/types';

const tokens = process.argv.slice(2);

if (isHelpRequest(tokens)) {
  console.log(USAGE);
  process.exit(0);
}

await loadEngineData(new NodeAdapter());

try {
  const query = parseArgs(tokens);
  present(acquire(query), query.format);
} catch (e) {
  if (e instanceof OracleError) {
    console.error(`oráculo: ${e.message}`);
    process.exit(1);
  }
  throw e;
}
