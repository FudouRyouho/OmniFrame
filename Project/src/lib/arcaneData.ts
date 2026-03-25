import type { Arcane } from './types';
import { db, fetchWithCache } from './db';

let cache: Arcane[] | null = null;

const fetchArcanesFromJSON = async (): Promise<Arcane[]> => {
  const res = await fetch('/data/arcanes.json');
  if (!res.ok) throw new Error('Failed to load arcanes.json');
  return res.json();
};

export const fetchArcanes = async (): Promise<Arcane[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.arcanes, fetchArcanesFromJSON, 'arcanes');
  return cache;
};

export const fetchArcane = async (name: string): Promise<Arcane | undefined> => {
  const arcanes = await fetchArcanes();
  return arcanes.find(a => a.uniqueName === name || a.name.toLowerCase() === name.toLowerCase());
};
