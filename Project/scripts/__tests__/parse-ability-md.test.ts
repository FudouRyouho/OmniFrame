/**
 * @domain Tooling / Parser de corpus de habilidades
 *
 * Ejercita `parse-ability-md.ts` COMO BINARIO, no como módulo: los dos scripts del par
 * (`parse-ability-md` imprime, `apply-ability-md` escribe el override) corren su CLI en el
 * top-level, así que importarlos dispararía `process.exit`. `parse-ability-md` es el read-only
 * de los dos y emite el JSON parseado a stdout — es el que se puede observar sin efectos.
 *
 * Existe porque #31 fue una pérdida SILENCIOSA: `parseStat` devolvía `null`, `flushGroup`
 * descartaba el grupo, y `tsc -b` / `validate:docs` / la suite salían verdes igual. Nada assertaba
 * que el override tuviera los grupos que el `.md` declara, así que el gap sólo era visible
 * barriendo el corpus a mano. Este test es el assert que faltaba.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const FIXTURE = path.resolve(__dirname, 'fixtures/parse-stat-cases.md')
const SCRIPT  = path.resolve(__dirname, '../parse-ability-md.ts')

type Stat  = { label: string; base_value: number | number[]; upgrade_by?: string; upgrade_type?: string | string[] }
type Group = { id?: string; label?: string; exclusive?: boolean; stats: Stat[] }

let parsed: Record<string, { groups: Group[] }>
let stderr: string

const VALUES = '/Lotus/Powersuits/PowersuitAbilities/FixtureValuesAbility'

/** Las stats del grupo base (el que no tiene `id`) de una ability del fixture. */
function baseStats(key: string): Stat[] {
  return parsed[key].groups.filter(g => !g.id).flatMap(g => g.stats)
}

function statByPrefix(key: string, prefix: string): Stat | undefined {
  return baseStats(key).find(s => s.label.startsWith(`${prefix}:`))
}

function group(id: string): Group | undefined {
  return Object.values(parsed).flatMap(a => a.groups).find(g => g.id === id)
}

beforeAll(() => {
  // `tsx` vía npx: mismo camino que `npm run parse:ability`. `spawnSync` y no `execFileSync`
  // porque hacen falta LAS DOS puntas: stdout es el JSON parseado y stderr son los warn, que son
  // la otra mitad del fix — sin ellos la pérdida seguiría siendo silenciosa.
  const run = spawnSync('npx', ['tsx', SCRIPT, FIXTURE], {
    cwd: path.resolve(__dirname, '../..'),
    encoding: 'utf-8',
  })
  if (run.status !== 0) throw new Error(`parse-ability-md.ts falló (${run.status}):\n${run.stderr}`)
  parsed = JSON.parse(run.stdout)
  stderr = run.stderr
}, 120_000)

describe('parseStat — valores negativos (#31, gap 2)', () => {
  it('lee el signo en un porcentaje', () => {
    expect(statByPrefix(VALUES, 'Immolation Meter On Cast')).toEqual({
      label: 'Immolation Meter On Cast: |val1|%',
      base_value: -50,
    })
  })

  it('lee el signo en una unidad de tiempo', () => {
    expect(statByPrefix(VALUES, 'Time / Kill')?.base_value).toBe(-4)
  })
})

describe('parseStat — unidad compuesta (#31, gap 3 — no estaba en el issue)', () => {
  it('conserva la barra en la unidad (`48m/s`, Rhino.md:8)', () => {
    expect(statByPrefix(VALUES, 'Speed')).toEqual({
      label: 'Speed: |val1|m/s',
      base_value: 48,
    })
  })

  it('tolera espacios alrededor de la barra, con signo (`-2% / s`, Ember.md:33)', () => {
    expect(statByPrefix(VALUES, 'Immolation Meter')).toEqual({
      label: 'Immolation Meter: |val1|% / s',
      base_value: -2,
    })
  })

  it('la unidad compuesta convive con `$UPGRADE_BY` (`10%/s $STRENGTH`, Vauban.md:43)', () => {
    expect(statByPrefix(VALUES, 'Debuff Amount')).toEqual({
      label: 'Debuff Amount: |val1|%/s',
      base_value: 10,
      upgrade_by: 'AVATAR_ABILITY_STRENGTH',
    })
  })
})

describe('parseStat — no-regresión: el signo opcional no rompe el rango min-max', () => {
  it('el `-` separador sigue siendo separador, no signo', () => {
    expect(statByPrefix(VALUES, 'Damage')).toEqual({
      label: 'Damage: <DT_IMPACT> |val1| - |val2|',
      base_value: [500, 2000],
      upgrade_by: 'AVATAR_ABILITY_STRENGTH',
    })
    expect(statByPrefix(VALUES, 'Radius')?.base_value).toEqual([5, 15])
  })

  it('las formas que ya parseaban siguen igual', () => {
    expect(statByPrefix(VALUES, 'Duration')?.base_value).toBe(25)
    expect(statByPrefix(VALUES, 'Energy Multiplier')?.label).toBe('Energy Multiplier: |val1|x')
    expect(statByPrefix(VALUES, 'Angle')?.label).toBe('Angle: |val1|°')
    expect(statByPrefix(VALUES, 'Health')?.base_value).toBe(8000) // separador de miles europeo
    expect(statByPrefix(VALUES, 'Drain')).toEqual({
      label: 'Drain: <ENERGY> |val1|',
      base_value: 25,
      upgrade_by: 'ENERGY_COST',
    })
  })

  it('los N `$$` por renglón siguen emitiendo array', () => {
    expect(statByPrefix(VALUES, 'Speed Multiplier')?.upgrade_type)
      .toEqual(['AVATAR_ADD_MOVEMENT_SPEED', 'MELEE_ADD_ATTACK_SPEED'])
  })
})

describe('flushGroup — el grupo entero dejó de desaparecer (#31)', () => {
  it('un grupo cuya ÚNICA stat es negativa ahora sobrevive (Titania DUST)', () => {
    // Éste es el modo de falla completo del issue: `parseStat` → null, `stats: []`,
    // y `flushGroup` descarta el grupo sin dejar rastro en el override.
    expect(group('dust')).toEqual({
      id: 'dust',
      label: 'DUST',
      exclusive: true,
      stats: [{ label: 'Hit Chance: |val1|%', base_value: -50 }],
    })
  })
})

describe('lo que NO se recupera es deliberado, no un gap sin cerrar', () => {
  it('icono POSTFIJO sigue fuera: el valor no es deducible del texto', () => {
    expect(group('dice')).toBeUndefined()
  })

  it("una línea sin ':' sigue fuera: viola la convención que declara references/game-ui/README.md", () => {
    expect(group('safeguard')).toBeUndefined()
  })

  it('pero ya no se pierden en silencio — el script las nombra', () => {
    expect(stderr).toContain('Damage: 25x <KOUMEI_DICE_1>')
    expect(stderr).toContain('Strength 50%')
  })
})
