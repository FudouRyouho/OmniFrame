/**
 * Capa 1 — Dispatch: `argv → OracleQuery`. Único lugar que lee tokens crudos; ninguna otra
 * capa vuelve a tocar `process.argv`. Parser propio, zero-dep (coherente con el proyecto: no
 * hay librería de args y no se agrega una para esto). Ver `docs/domains/oracle/design/architecture.md` §2.
 */
import { LENSES, FORMATS, OracleError, type Lens, type Format, type A2Query, type OracleQuery } from './types';

export const USAGE = `oráculo — banco de trabajo del motor (D2)

  uso: npm run oracle -- <lente> <sujeto> [flags]

  lentes (punto de observación del pipeline):
    nodes    <build|all>   AttributeNode crudos (C1)
    display  <build|all>   ViewModelContract proyectado (C1 display)
    metrics  <build>       CombatMetrics vs un target (C1+C2)   [usa --vs --lvl --dur]
    trace    <build>       procedencia de un nodo (C1)          [requiere --node]
    enemy    <nombre>      enemigo escalado (health/armor/DR/EHP) [usa --lvl]
    intention              (declarada, no implementada — requiere exponer la salida de B)

  flags:
    --vs <enemy>    target para metrics        (default "Arid Butcher")
    --lvl <n>       nivel del enemigo          (default 100)
    --dur <n>       duración de sim en s       (default 6)
    --node <attr>   atributo para trace
    --format text|json                          (default text)

  ejemplos:
    npm run oracle -- display lanka
    npm run oracle -- metrics cedo --vs "Arid Butcher" --lvl 120 --dur 8
    npm run oracle -- trace boltor --node WEAPON_ADD_DAMAGE --format json
    npm run oracle -- enemy "Arid Butcher" --lvl 215`;

export function isHelpRequest(tokens: string[]): boolean {
  return tokens.length === 0 || tokens[0] === 'help' || tokens.includes('--help') || tokens.includes('-h');
}

export function parseArgs(tokens: string[]): OracleQuery {
  const { positionals, flags } = splitTokens(tokens);

  const lensRaw = positionals[0];
  if (!lensRaw) throw new OracleError(`falta la lente. Válidas: ${LENSES.join(', ')}.`);
  if (!isLens(lensRaw)) throw new OracleError(`lente "${lensRaw}" inválida. Válidas: ${LENSES.join(', ')}.`);
  const lens: Lens = lensRaw;

  if (lens === 'intention') {
    throw new OracleError(
      'lente "intention" declarada pero no implementada: requiere exponer la salida de B (intención hidratada) desde @core; diferida.',
    );
  }

  const subject = positionals[1] ?? '';
  if (!subject) {
    const what = lens === 'enemy' ? 'el nombre de un enemigo' : 'una build (o "all")';
    throw new OracleError(`la lente "${lens}" requiere un sujeto: ${what}.`);
  }
  if (subject === 'all' && lens !== 'nodes' && lens !== 'display') {
    throw new OracleError(`la lente "${lens}" opera sobre un sujeto único; no acepta "all".`);
  }

  const node = flags.node ?? null;
  if (lens === 'trace' && !node) throw new OracleError('la lente "trace" requiere --node <attr>.');

  const a2: A2Query = {
    enemy: flags.vs ?? 'Arid Butcher',
    level: parseNumFlag(flags.lvl, 'lvl', 100),
    duration: parseNumFlag(flags.dur, 'dur', 6),
  };

  return { lens, subject, a2, node, format: parseFormat(flags.format) };
}

// ─── helpers ───

function splitTokens(tokens: string[]): { positionals: string[]; flags: Record<string, string> } {
  const positionals: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t.startsWith('--')) {
      positionals.push(t);
      continue;
    }
    const eq = t.indexOf('=');
    if (eq !== -1) {
      flags[t.slice(2, eq)] = t.slice(eq + 1);
      continue;
    }
    const key = t.slice(2);
    const val = tokens[i + 1];
    if (val === undefined || val.startsWith('--')) throw new OracleError(`la flag --${key} espera un valor.`);
    flags[key] = val;
    i++;
  }
  return { positionals, flags };
}

function isLens(x: string): x is Lens {
  return (LENSES as readonly string[]).includes(x);
}

function parseFormat(raw: string | undefined): Format {
  if (raw === undefined) return 'text';
  if (!(FORMATS as readonly string[]).includes(raw)) {
    throw new OracleError(`formato "${raw}" inválido. Válidos: ${FORMATS.join(', ')}.`);
  }
  return raw as Format;
}

function parseNumFlag(raw: string | undefined, name: string, fallback: number): number {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new OracleError(`la flag --${name} espera un número, recibió "${raw}".`);
  return n;
}
