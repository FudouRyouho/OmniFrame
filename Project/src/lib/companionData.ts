import type { Companion } from './types';
import { db, fetchWithCache } from './db';

let cache: Companion[] | null = null;

const fetchCompanionsFromJSON = async (): Promise<Companion[]> => {
  const res = await fetch('/data/companions.json');
  if (!res.ok) throw new Error('Failed to load companions.json');
  return res.json();
};

export const fetchCompanions = async (): Promise<Companion[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.companions, fetchCompanionsFromJSON, 'companions');
  return cache;
};

export const fetchCompanion = async (name: string): Promise<Companion | undefined> => {
  const companions = await fetchCompanions();
  return companions.find(c => c.uniqueName === name || c.name.toLowerCase() === name.toLowerCase());
};
