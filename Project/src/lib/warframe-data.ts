/**
 * @domain Shared / Data / Warframe
 * @SSoT docs/domains/integration/runtime-hydration.md
 */
import type { Warframe, Ability, AbilityStatsData } from '../shared/types'
import { db, fetchWithCache } from './db'
import { hydrateImageFromImageName } from './image-url'
import { matchesRouteIdentifier } from './route-id'

// ── Cache ─────────────────────────────────────────────────────────────────────

let cache: Warframe[] | null = null

/** Hidrata abilities con overrides runtime. */
const hydrateAbility = (ability: Ability, statsDb: Record<string, unknown>): Ability => {
  const dbEntry = statsDb[ability.uniqueName]

  if (!dbEntry) {
    return {
      ...ability,
      name: ability.uniqueName.split('/').pop() ?? 'Unknown',
      description: '',
      imageName: '',
      stats: {
        name: ability.uniqueName.split('/').pop() ?? 'Unknown',
        description: '',
        imageName: '',
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
    imageName:   String(metadata.imageName   ?? metadata.icon ?? ''),
    groups:      Array.isArray(groupsArray) ? groupsArray as AbilityStatsData['groups'] : [],
  }

  return {
    ...ability,
    name:        statsData.name,
    description: statsData.description,
    imageName:   statsData.imageName || ability.imageName,
    stats:       statsData,
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetch interno que carga el JSON y hace la hidratación.
 * Usado por fetchWithCache como fallback cuando IndexedDB está vacío.
 */
const fetchWarframesFromJSON = async (): Promise<Warframe[]> => {
  const [wfRes, statsRes, passivesRes] = await Promise.all([
    fetch('/data/warframes.json'),
    fetch('/data/ability-stats.override.json').catch(() => null),
    fetch('/data/passives.json').catch(() => null),
  ])

  if (!wfRes.ok) throw new Error('Failed to load warframes.json')

  const warframes: Warframe[] = await wfRes.json()
  let statsDb: Record<string, unknown> = statsRes?.ok ? await statsRes.json() : {}
  const passivesDb: Record<string, { name: string; description: string }> =
    passivesRes?.ok ? await passivesRes.json() : {}

    }
  }

  return warframes.map(wf => ({
    ...hydrateImageFromImageName(wf),
    passive: wf.passive && typeof wf.passive === 'string'
      ? passivesDb[wf.passive]
      : wf.passive,
    passiveDescription:
      (wf.passive && typeof wf.passive === 'string'
        ? passivesDb[wf.passive]?.description
        : undefined) ?? wf.passiveDescription,
    abilities: wf.abilities.map(a => hydrateAbility(a, statsDb)),
  }))
}

export const fetchWarframes = async (): Promise<Warframe[]> => {
  if (cache) return cache

  // Usar IndexedDB con fallback a JSON
  cache = await fetchWithCache(db.warframes, fetchWarframesFromJSON, 'warframes')
  return cache
}

export const fetchWarframe = async (identifier: string): Promise<Warframe | undefined> => {
  const warframes = await fetchWarframes()
  return warframes.find(w => matchesRouteIdentifier(w, identifier))
}

export type { Warframe }