/**
 * @domain Shared / Types
 * @SSoT docs/data/schemas/archon-shards/schema.md
 */

import type { ConditionInput } from './condition';

export interface ArchonShardStat {
  id: string;
  label: string;
  value: [number, number]; // [normal, tauforged]
  upgrade_type: string | null;
  condition: ConditionInput | null;
}

export interface ArchonShardEntry {
  name: string;
  image_name: string;
  stats: ArchonShardStat[];
}

export type ArchonShardCatalog = Record<string, ArchonShardEntry>;
