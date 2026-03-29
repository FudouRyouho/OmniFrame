import type { Companion } from './types';
import { db, fetchWithCache } from './db';
import { hydrateImageFromImageName } from './image-url';
import { matchesRouteIdentifier } from './route-id';

let cache: Companion[] | null = null;

const fetchCompanionsFromJSON = async (): Promise<Companion[]> => {
  const res = await fetch('/data/companions.json');
  if (!res.ok) throw new Error('Failed to load companions.json');
  const data: Companion[] = await res.json();
  return data.map(hydrateImageFromImageName);
};

export const fetchCompanions = async (): Promise<Companion[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.companions, fetchCompanionsFromJSON, 'companions');
  return cache;
};

export const fetchCompanion = async (identifier: string): Promise<Companion | undefined> => {
  const companions = await fetchCompanions();
  return companions.find(c => matchesRouteIdentifier(c, identifier));
};
