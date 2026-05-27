/**
 * @domain Shared / Types
 * @SSoT docs/data/schemas/archon-shards/schema.md
 */

export interface ArchonShardStat {
  id: string;
  label: string;
  value: [number, number]; // [normal, tauforged]
  upgrade_type: string | null;
  condition: string | null;
}

export interface ArchonShardEntry {
  name: string;
  image_name: string;
  stats: ArchonShardStat[];
}

export type ArchonShardCatalog = Record<string, ArchonShardEntry>;
