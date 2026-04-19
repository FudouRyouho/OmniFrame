import type { Vehicle } from './types';
import { db, fetchWithCache } from './db';
import { hydrateImageFromImageName } from './image-url';
import { matchesRouteIdentifier } from './route-id';

let cache: Vehicle[] | null = null;

const fetchVehiclesFromJSON = async (): Promise<Vehicle[]> => {
  const res = await fetch('/data/vehicles.json');
  if (!res.ok) throw new Error('Failed to load vehicles.json');
  const data: Vehicle[] = await res.json();
  return data.map(hydrateImageFromImageName);
};

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  if (cache) return cache;
  cache = await fetchWithCache(db.vehicles, fetchVehiclesFromJSON, 'vehicles');
  return cache;
};

export const fetchVehicle = async (identifier: string): Promise<Vehicle | undefined> => {
  const vehicles = await fetchVehicles();
  return vehicles.find(v => matchesRouteIdentifier(v, identifier));
};