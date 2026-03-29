import type { ArchwingWeapon } from './types';
import { db, fetchWithCache } from './db';
import { hydrateImageFromImageName } from './image-url';
import { matchesRouteIdentifier } from './route-id';

let cache: ArchwingWeapon[] | null = null;

const fetchArchwingWeaponsFromJSON = async (): Promise<ArchwingWeapon[]> => {
  const res = await fetch('/data/archwing-weapons.json');
  if (!res.ok) throw new Error('Failed to load archwing-weapons.json');
  const data: ArchwingWeapon[] = await res.json();
  return data.map(hydrateImageFromImageName);
};

export const fetchArchwingWeapons = async (): Promise<ArchwingWeapon[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.archwingWeapons, fetchArchwingWeaponsFromJSON, 'archwing-weapons');
  return cache;
};

export const fetchArchwingWeapon = async (identifier: string): Promise<ArchwingWeapon | undefined> => {
  const weapons = await fetchArchwingWeapons();
  return weapons.find(w => matchesRouteIdentifier(w, identifier));
};
