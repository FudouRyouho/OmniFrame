import type { PolarityType } from '../../src/shared/types/index.ts'

// ── Normalization State ──────────────────────────────────────────────────────

export interface PolarityNormalizationState {
  missingPolarityCount: number
  unknownPolarities: Map<string, number>
}

export function createPolarityNormalizationState(): PolarityNormalizationState {
  return {
    missingPolarityCount: 0,
    unknownPolarities: new Map(),
  }
}

// ── Normalization Map ────────────────────────────────────────────────────────

const RAW_POLARITY_TO_CANONICAL: Record<string, PolarityType> = {
  madurai: 'madurai',
  vazarin: 'vazarin',
  naramon: 'naramon',
  zenurik: 'zenurik',
  unairu: 'unairu',
  penjaga: 'penjaga',
  umbra: 'umbra',
  universal: 'omni',
  aura: 'omni',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function formatCountMap(map: Map<string, number>): string {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} (${count})`)
    .join(', ')
}

// ── Normalization ────────────────────────────────────────────────────────────

export function normalizePolarityValue(
  rawPolarity: string | null | undefined,
  state: PolarityNormalizationState,
): PolarityType | null {
  if (!rawPolarity || rawPolarity.trim() === '') {
    state.missingPolarityCount += 1
    return null
  }

  const normalized = rawPolarity.trim().toLowerCase()
  const canonical = RAW_POLARITY_TO_CANONICAL[normalized]

  if (canonical) {
    return canonical
  }

  // Valor fuera del vocabulario → null (no unknown)
  incrementCount(state.unknownPolarities, rawPolarity.trim())
  return null
}

// ── Reporting ────────────────────────────────────────────────────────────────

export function reportPolarityNormalizationState(state: PolarityNormalizationState) {
  if (state.missingPolarityCount > 0) {
    console.log(
      `[generate-data][polarity] polarity ausente en ${state.missingPolarityCount} items → valor null`,
    )
  }

  if (state.unknownPolarities.size > 0) {
    console.warn(
      `[generate-data][polarity] polarity sin vocabulario canonico: ${formatCountMap(state.unknownPolarities)}`,
    )
  }
}
