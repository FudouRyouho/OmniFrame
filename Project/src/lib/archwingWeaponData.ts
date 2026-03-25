import type { ArchwingWeapon } from './types';
import { db, fetchWithCache } from './db';

let cache: ArchwingWeapon[] | null = null;

const fetchArchwingWeaponsFromJSON = async (): Promise<ArchwingWeapon[]> => {
  const res = await fetch('/data/archwing-weapons.json');
  if (!res.ok) throw new Error('Failed to load archwing-weapons.json');
  return res.json();
};

export const fetchArchwingWeapons = async (): Promise<ArchwingWeapon[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.archwingWeapons, fetchArchwingWeaponsFromJSON, 'archwing-weapons');
  return cache;
};

export const fetchArchwingWeapon = async (name: string): Promise<ArchwingWeapon | undefined> => {
  const weapons = await fetchArchwingWeapons();
  return weapons.find(w => w.uniqueName === name || w.name.toLowerCase() === name.toLowerCase());
};
