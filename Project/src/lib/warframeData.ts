/**
 * warframeData — fetch y cache de datos estáticos de Warframes.
 *
 * Responsabilidades de esta capa:
 *   - Fetch de los JSON estáticos generados por generate-data.mjs
 *   - Cache en memoria para evitar peticiones redundantes
 *   - Hidratación runtime: merge de ability-stats.json + passives.json
 *     sobre los punteros que genera el pipeline de build
 *
 * @note La hidratación de abilities y passives ocurre aquí (runtime) porque
 * ability-stats.json es editable desde el Editor UI sin pasar por el pipeline
 * de build. Cuando el pipeline absorba completamente ability-stats.json,
 * esta hidratación deberá moverse a generate-data.mjs (DT-1).
 *
 * No hace:
 *   - Lógica de cálculo
 *   - Decisiones de presentación
 *   - Transformaciones de formato (eso es generate-data.mjs)
 */
import type { Warframe, Ability, AbilityStatsData } from './types'

// ── Cache ─────────────────────────────────────────────────────────────────────

let cache: Warframe[] | null = null

// ── Transformación de abilities ───────────────────────────────────────────────

/**
 * Hidrata una ability con los datos de ability-stats.json.
 * Maneja la transición de estructura legacy (array) a nueva (objeto).
 *
 * @note Estructura legacy: array de rows con { name, description, icon, ...stats }
 * @note Estructura nueva: { name, description, icon, stats: AbilityStat[] }
 */
const hydrateAbility = (ability: Ability, statsDb: Record<string, unknown>): Ability => {
  const dbEntry = statsDb[ability.uniqueName]

  if (!dbEntry) {
    return {
      ...ability,
      name: ability.uniqueName.split('/').pop() ?? 'Unknown',
      description: '',
      icon: '',
      stats: {
        name: ability.uniqueName.split('/').pop() ?? 'Unknown',
        description: '',
        icon: '',
        groups: [],
      },
    }
  }

  // Normalizar estructura legacy (array) → nueva (objeto con groups[])
  const isNewStructure = !Array.isArray(dbEntry)
  const metadata = isNewStructure ? dbEntry as Record<string, unknown> : ((dbEntry as unknown[])[0] ?? {}) as Record<string, unknown>
  const groupsArray = isNewStructure
    ? (dbEntry as { groups: unknown[] }).groups
    : []

  const statsData: AbilityStatsData = {
    name:        String(metadata.name        ?? ability.uniqueName.split('/').pop() ?? 'Unknown'),
    description: String(metadata.description ?? ''),
    icon:        String(metadata.icon        ?? ''),
    groups:      Array.isArray(groupsArray) ? groupsArray as AbilityStatsData['groups'] : [],
  }

  return {
    ...ability,
    name:        statsData.name,
    description: statsData.description,
    icon:        statsData.icon,
    stats:       statsData,
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export const fetchWarframes = async (): Promise<Warframe[]> => {
  if (cache) return cache

  const [wfRes, statsRes, passivesRes] = await Promise.all([
    fetch('/data/warframes.json'),
    fetch('/data/ability-stats.json').catch(() => null),
    fetch('/data/passives.json').catch(() => null),
  ])

  if (!wfRes.ok) throw new Error('Failed to load warframes.json')

  const warframes: Warframe[] = await wfRes.json()
  let statsDb: Record<string, unknown> = statsRes?.ok ? await statsRes.json() : {}
  const passivesDb: Record<string, { name: string; description: string }> =
    passivesRes?.ok ? await passivesRes.json() : {}

  // Dev: merge localStorage backup si existe (Editor UI sin guardar al disco)
  if (typeof window !== 'undefined') {
    const backup = localStorage.getItem('ability-stats-backup')
    if (backup) {
      try {
        statsDb = { ...statsDb, ...JSON.parse(backup) }
      } catch {
        console.error('warframeData: failed to parse ability-stats-backup from localStorage')
      }
    }
  }

  cache = warframes.map(wf => ({
    ...wf,
    passive: wf.passive && typeof wf.passive === 'string'
      ? passivesDb[wf.passive]
      : wf.passive,
    passiveDescription:
      (wf.passive && typeof wf.passive === 'string'
        ? passivesDb[wf.passive]?.description
        : undefined) ?? wf.passiveDescription,
    abilities: wf.abilities.map(a => hydrateAbility(a, statsDb)),
  }))

  return cache
}

export const fetchWarframe = async (name: string): Promise<Warframe | undefined> => {
  const warframes = await fetchWarframes()
  return warframes.find(w => w.name.toLowerCase() === name.toLowerCase())
}

export type { Warframe }
