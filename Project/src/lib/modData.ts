import type { Mod } from './types'

let cache: Mod[] | null = null

export const fetchMods = async (): Promise<Mod[]> => {
  if (cache) return cache
  const res = await fetch('/data/mods.json')
  if (!res.ok) throw new Error('Failed to load mods.json')
  cache = await res.json()
  return cache!
}

export const fetchMod = async (name: string): Promise<Mod | undefined> => {
  const mods = await fetchMods()
  return mods.find(m => m.name.toLowerCase() === name.toLowerCase())
}
