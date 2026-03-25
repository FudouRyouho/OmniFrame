import type { Weapon } from './types'
import { db, fetchWithCache } from './db'

let cache: Weapon[] | null = null

const fetchWeaponsFromJSON = async (): Promise<Weapon[]> => {
  const res = await fetch('/data/weapons.json')
  if (!res.ok) throw new Error('Failed to load weapons.json')
  return res.json()
}

export const fetchWeapons = async (): Promise<Weapon[]> => {
  if (cache) return cache
  cache = await fetchWithCache(db.weapons, fetchWeaponsFromJSON, 'weapons')
  return cache
}

export const fetchWeapon = async (name: string): Promise<Weapon | undefined> => {
  const weapons = await fetchWeapons()
  return weapons.find(w => w.name.toLowerCase() === name.toLowerCase())
}
