/**
 * @domain Shared / Data / Weapon
 * @SSoT docs/domains/integration/runtime-hydration.md
 */
import type { Weapon } from '../shared/types'
import { hydrateImageFromImageName } from './image-url'
import { matchesRouteIdentifier } from './route-id'

let cache: Weapon[] | null = null

const fetchWeaponsFromJSON = async (): Promise<Weapon[]> => {
  const res = await fetch('/data/weapons.json')
  if (!res.ok) throw new Error('Failed to load weapons.json')
  const data: Weapon[] = await res.json()
  return data.map(hydrateImageFromImageName)
}

export const fetchWeapons = async (): Promise<Weapon[]> => {
  if (cache) return cache
  const data = await fetchWeaponsFromJSON()
  cache = data
  return data
}

export const fetchWeapon = async (identifier: string): Promise<Weapon | undefined> => {
  const weapons = await fetchWeapons()
  return weapons.find(w => matchesRouteIdentifier(w, identifier))
}