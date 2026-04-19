import type { Mod } from './types'
import { db, fetchWithCache } from './db'
import { hydrateImageFromImageName } from './image-url'
import { matchesRouteIdentifier } from './route-id'

let cache: Mod[] | null = null

const fetchModsFromJSON = async (): Promise<Mod[]> => {
  const res = await fetch('/data/mods.json')
  if (!res.ok) throw new Error('Failed to load mods.json')
  const data: Mod[] = await res.json()
  return data.map(hydrateImageFromImageName)
}

export const fetchMods = async (): Promise<Mod[]> => {
  if (cache) return cache
  cache = await fetchWithCache(db.mods, fetchModsFromJSON, 'mods')
  return cache
}

export const fetchMod = async (identifier: string): Promise<Mod | undefined> => {
  const mods = await fetchMods()
  return mods.find(m => matchesRouteIdentifier(m, identifier))
}