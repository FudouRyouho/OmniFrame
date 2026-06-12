/**
 * @domain Engine / Hydration
 * @status en-desarrollo
 */
import { isUpgrade, UPGRADE_MAP, resolveToken } from "@shared/types/modifier";
import type { ModifierOperation } from "@shared/types/modifier";

export interface ShardResolution {
  attr: string;
  op: ModifierOperation;
  target_channel?: string;
  value: number;
}

/**
 * Repositorio de datos de Archon Shards para el engine.
 * Requiere inicialización explícita via load() antes del primer uso.
 * El catálogo tiene la forma del JSON público: Record<shardType, { stats: ShardStat[] }>.
 */
export class ShardRepository {
  private static catalog: Record<string, any> = {};

  public static load(data: Record<string, any>): void {
    this.catalog = data;
  }

  /**
   * Resuelve un shard equipado a su attr ID, operación, channel y valor final.
   * Devuelve null si el upgrade_type no está en el vocabulario D-6 o si el shard
   * no tiene upgrade_type definido (efectos no modelados aún, ej. energy on spawn).
   */
  public static resolve(shardType: string, statId: string, isTau: boolean): ShardResolution | null {
    const shardEntry = this.catalog[shardType];
    if (!shardEntry) return null;

    const stat = (shardEntry.stats as any[])?.find((s: any) => s.id === statId);
    if (!stat?.upgrade_type) return null;
    const upgradeType: string = stat.upgrade_type;
    if (!isUpgrade(upgradeType)) return null;

    const entry = UPGRADE_MAP[upgradeType] ?? resolveToken(upgradeType);
    if (!entry) return null;

    const rawValue = Array.isArray(stat.value) ? stat.value[isTau ? 1 : 0] : stat.value;
    const value = entry.toPercent ? (rawValue - 1) * 100 : rawValue;

    return { attr: entry.attr, op: entry.op, target_channel: entry.target_channel, value };
  }
}
