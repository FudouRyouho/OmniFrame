// ── Vehicle ───────────────────────────────────────────────────────────────────
// Agrupa Necramechs (category: 'Warframes' en la fuente) y Archwings (category: 'Archwing')
// Ambos se separan de warframes.json en el pipeline de generacion.

import type { BaseItem } from './base';

export type VehicleKind = 'necramech' | 'archwing';

export interface Vehicle extends BaseItem {
  kind: VehicleKind;
  description: string;
  imageName: string;
  category: string;
  health: number | null;
  shield: number | null;
  armor: number | null;
  isPrime: boolean;
  tradable: boolean;
  abilities: { uniqueName: string }[];
}
