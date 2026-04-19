import type { Arcane } from './types';
import { db, fetchWithCache } from './db';
import { hydrateImageFromImageName } from './image-url';
import { matchesRouteIdentifier } from './route-id';

let cache: Arcane[] | null = null;

const fetchArcanesFromJSON = async (): Promise<Arcane[]> => {
  const res = await fetch('/data/arcanes.json');
  if (!res.ok) throw new Error('Failed to load arcanes.json');
  const data: Arcane[] = await res.json();
  return data.map(hydrateImageFromImageName);
};

export const fetchArcanes = async (): Promise<Arcane[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.arcanes, fetchArcanesFromJSON, 'arcanes');
  return cache;
};

export const fetchArcane = async (identifier: string): Promise<Arcane | undefined> => {
  const arcanes = await fetchArcanes();
  return arcanes.find(a => matchesRouteIdentifier(a, identifier));
};