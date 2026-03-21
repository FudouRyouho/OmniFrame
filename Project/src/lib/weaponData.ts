import type { Weapon } from './types'

let cache: Weapon[] | null = null

export const fetchWeapons = async (): Promise<Weapon[]> => {
  if (cache) return cache
  const res = await fetch('/data/weapons.json')
  if (!res.ok) throw new Error('Failed to load weapons.json')
  cache = await res.json()
  return cache!
}

export const fetchWeapon = async (name: string): Promise<Weapon | undefined> => {
  const weapons = await fetchWeapons()
  return weapons.find(w => w.name.toLowerCase() === name.toLowerCase())
}
