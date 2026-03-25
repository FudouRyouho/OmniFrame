import type { Vehicle } from './types';
import { db, fetchWithCache } from './db';

let cache: Vehicle[] | null = null;

const fetchVehiclesFromJSON = async (): Promise<Vehicle[]> => {
  const res = await fetch('/data/vehicles.json');
  if (!res.ok) throw new Error('Failed to load vehicles.json');
  return res.json();
};

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.vehicles, fetchVehiclesFromJSON, 'vehicles');
  return cache;
};

export const fetchVehicle = async (name: string): Promise<Vehicle | undefined> => {
  const vehicles = await fetchVehicles();
  return vehicles.find(v => v.uniqueName === name || v.name.toLowerCase() === name.toLowerCase());
};
