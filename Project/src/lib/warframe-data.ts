/**
 * @domain Shared / Data / Warframe
 * @SSoT docs/domains/integration/runtime-hydration.md
 */
import type { Warframe, Ability, AbilityStatsData } from '../shared/types'
import { hydrateImageFromImageName } from './image-url'
import { matchesRouteIdentifier } from './route-id'

// ── Cache ─────────────────────────────────────────────────────────────────────

let cache: Warframe[] | null = null

/** Hidrata abilities con overrides runtime. */
const hydrateAbility = (ability: Ability, statsDb: Record<string, unknown>): Ability => {
  const dbEntry = statsDb[ability.unique_name]

  if (!dbEntry) {
    return {
      ...ability,
      name: ability.unique_name.split('/').pop() ?? 'Unknown',
      description: '',
      image_name: '',
      stats: {
        name: ability.unique_name.split('/').pop() ?? 'Unknown',
        description: '',
        image_name: '',
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
    name:        String(metadata.name        ?? ability.unique_name.split('/').pop() ?? 'Unknown'),
    description: String(metadata.description ?? ''),
    image_name:   String(metadata.image_name   ?? metadata.icon ?? ''),
    groups:      Array.isArray(groupsArray) ? groupsArray as AbilityStatsData['groups'] : [],
  }

  return {
    ...ability,
    name:        statsData.name,
    description: statsData.description,
    image_name:   statsData.image_name || ability.image_name,
    stats:       statsData,
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

const fetchWarframesFromJSON = async (): Promise<Warframe[]> => {
  const [wfRes, statsRes, passivesRes] = await Promise.all([
    fetch('/data/warframes.json'),
    fetch('/data/ability-stats.override.json').catch(() => null),
    fetch('/data/passives.json').catch(() => null),
  ])

  if (!wfRes.ok) throw new Error('Failed to load warframes.json')

  const warframes: Warframe[] = await wfRes.json()
  const statsDb: Record<string, unknown> = statsRes?.ok ? await statsRes.json() : {}
  const passivesDb: Record<string, { name: string; description: string }> =
    passivesRes?.ok ? await passivesRes.json() : {}

  return warframes.map(wf => ({
    ...hydrateImageFromImageName(wf),
    passive: wf.passive && typeof wf.passive === 'string'
      ? passivesDb[wf.passive]
      : wf.passive,
    passive_description:
      (wf.passive && typeof wf.passive === 'string'
        ? passivesDb[wf.passive]?.description
        : undefined) ?? wf.passive_description,
    abilities: wf.abilities.map(a => hydrateAbility(a, statsDb)),
  }))
}

export const fetchWarframes = async (): Promise<Warframe[]> => {
  if (cache) return cache
  const data = await fetchWarframesFromJSON()
  cache = data
  return data
}

export const fetchWarframe = async (identifier: string): Promise<Warframe | undefined> => {
  const items = await fetchWarframes()
  return items.find(w => matchesRouteIdentifier(w, identifier))
}

export type { Warframe }