/**
 * @dev AbilityStatsViewer
 * Visualizador de ability-stats.override.json — JSON fragment + preview por habilidad.
 * Ruta: /dev/ability-stats
 *
 * Data: warframes.json (sidebar) + ability-stats.override.json (contenido).
 * El override usa paths /PowersuitAbilities/, warframes.json usa /Warframe/Abilities/.
 * Se resuelve por último segmento del path (tail). Un conflicto conocido:
 * GrappleHookAbility — se prefiere PowersuitAbilities sobre ArchwingAbilities.
 */
import { useState, useEffect } from 'react'
import { resolveLabel, DEFAULT_ENGINE_VARS } from '@lib/abilityCalc'
import { resolveLocalImageUrl } from '@lib/image-url'
import type { AbilityStatsData, AbilityStatEntry } from '@shared/types'

// ── Tipos locales ─────────────────────────────────────────────────────────────

interface WfAbility {
  unique_name: string
  name: string
  image_name?: string
}

interface WfEntry {
  unique_name: string
  name: string
  image_name?: string
  is_prime: boolean
  abilities: WfAbility[]
}

// ── Vocab visual (upgrade_by) ─────────────────────────────────────────────────

const UB_COLOR: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH:   'text-orange-400',
  AVATAR_ABILITY_RANGE:      'text-blue-400',
  AVATAR_ABILITY_DURATION:   'text-green-400',
  AVATAR_ABILITY_EFFICIENCY: 'text-yellow-400',
  ENERGY_COST:               'text-cyan-400',
  ENERGY_DRAIN:              'text-cyan-300',
}

const UB_SHORT: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH:   'STR',
  AVATAR_ABILITY_RANGE:      'RNG',
  AVATAR_ABILITY_DURATION:   'DUR',
  AVATAR_ABILITY_EFFICIENCY: 'EFF',
  ENERGY_COST:               'Drain',
  ENERGY_DRAIN:              'Energy/s',
}

// ── Status localStorage ───────────────────────────────────────────────────────

const STORAGE_KEY = 'ability-stats-viewer-status-v1'

function loadStatuses(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

function saveStatuses(s: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

// ── Índice override por tail ──────────────────────────────────────────────────

function buildTailIndex(override: Record<string, unknown>): Map<string, AbilityStatsData> {
  const index = new Map<string, AbilityStatsData>()
  for (const [key, val] of Object.entries(override)) {
    if (key.startsWith('$') || !val || typeof val !== 'object') continue
    const tail = key.split('/').pop()!
    // Preferir PowersuitAbilities sobre ArchwingAbilities en colisión
    if (!index.has(tail) || key.includes('PowersuitAbilities')) {
      index.set(tail, val as AbilityStatsData)
    }
  }
  return index
}

// ── StatRow ───────────────────────────────────────────────────────────────────

function StatRow({ entry }: { entry: AbilityStatEntry }) {
  const resolved = resolveLabel(entry.label, entry, DEFAULT_ENGINE_VARS)
  const color = UB_COLOR[entry.upgrade_by ?? ''] ?? 'text-ui-primary/40'
  const tag   = UB_SHORT[entry.upgrade_by ?? ''] ?? entry.upgrade_by ?? ''

  return (
    <div className="flex items-baseline justify-between gap-3 py-1 border-b border-ui-primary/8 last:border-0">
      <span className="text-sm text-ui-primary/80">{resolved}</span>
      <span className={`text-[10px] font-mono shrink-0 ${color}`}>{tag}</span>
    </div>
  )
}

// ── AbilityCard ───────────────────────────────────────────────────────────────

function AbilityCard({
  ability,
  stats,
  reviewed,
  onToggleReviewed,
}: {
  ability: WfAbility
  stats: AbilityStatsData | undefined
  reviewed: boolean
  onToggleReviewed: () => void
}) {
  const [showJson, setShowJson] = useState(false)
  const hasStats = !!stats && stats.groups.some(g => g.stats.length > 0)
  const imageName = stats?.image_name || ability.image_name || ''

  return (
    <div className={`border rounded-xl overflow-hidden mb-3 transition-colors ${
      reviewed
        ? 'border-ui-accent/25 bg-ui-accent/3'
        : 'border-ui-primary/10 bg-ui-primary/2'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {imageName ? (
          <img
            src={resolveLocalImageUrl(imageName)}
            alt=""
            className="w-9 h-9 rounded border border-ui-primary/10 object-contain shrink-0 bg-ui-primary/5"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-9 h-9 rounded border border-ui-primary/10 bg-ui-primary/5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-ui-primary/90">
            {stats?.name || ability.name || <span className="italic text-ui-primary/25">sin nombre</span>}
          </div>
          <div className="text-[10px] text-ui-primary/25 font-mono truncate">{ability.unique_name}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {hasStats && (
            <button
              onClick={() => setShowJson(v => !v)}
              className="text-[10px] font-mono text-ui-primary/30 hover:text-ui-primary/60 transition-colors px-2 py-1 rounded hover:bg-ui-primary/5"
            >
              {showJson ? 'JSON ▲' : 'JSON ▼'}
            </button>
          )}
          <button
            onClick={onToggleReviewed}
            title={reviewed ? 'Marcar como pendiente' : 'Marcar como revisado'}
            className={`w-3 h-3 rounded-full border transition-colors ${
              reviewed
                ? 'bg-ui-accent border-ui-accent'
                : 'bg-transparent border-ui-primary/30 hover:border-ui-accent/50'
            }`}
          />
        </div>
      </div>

      {/* Sin datos */}
      {!hasStats && (
        <div className="px-4 pb-3 text-[11px] text-ui-primary/25 font-mono italic">
          sin datos en override
        </div>
      )}

      {/* JSON fragment */}
      {hasStats && showJson && (
        <div className="border-t border-ui-primary/8 mx-4 mb-3">
          <pre className="text-[10px] text-ui-primary/40 font-mono overflow-x-auto py-3 leading-relaxed">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}

      {/* Preview */}
      {hasStats && (
        <div className="border-t border-ui-primary/8 px-4 pb-3 pt-2 flex flex-col gap-3">
          {stats!.groups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-ui-accent/70 mb-1">
                  {group.label}
                </div>
              )}
              {group.stats.map((entry, si) => (
                <StatRow key={si} entry={entry} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  warframes,
  selected,
  onSelect,
  statuses,
}: {
  warframes: WfEntry[]
  selected: string | null
  onSelect: (id: string) => void
  statuses: Record<string, boolean>
}) {
  const [search, setSearch]       = useState('')
  const [showPrimes, setShowPrimes] = useState(false)

  const visible = warframes
    .filter(wf => showPrimes || !wf.is_prime)
    .filter(wf => wf.name.toLowerCase().includes(search.toLowerCase()))

  const getWfStatus = (wf: WfEntry): 'done' | 'partial' | 'pending' => {
    const keys = wf.abilities.map(a => a.unique_name)
    if (keys.length === 0) return 'pending'
    const done = keys.filter(k => statuses[k]).length
    if (done === keys.length) return 'done'
    if (done > 0) return 'partial'
    return 'pending'
  }

  const DOT: Record<string, string> = {
    done:    'bg-ui-accent',
    partial: 'bg-yellow-500',
    pending: 'bg-ui-primary/15',
  }

  return (
    <div className="w-52 border-r border-ui-primary/10 flex flex-col shrink-0 overflow-hidden">
      <div className="p-3 border-b border-ui-primary/10 flex flex-col gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="w-full bg-ui-primary/5 border border-ui-primary/10 rounded px-2 py-1.5 text-xs text-ui-primary/70 outline-none focus:border-ui-primary/30 placeholder:text-ui-primary/20"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPrimes}
            onChange={e => setShowPrimes(e.target.checked)}
            className="accent-ui-accent"
          />
          <span className="text-[10px] text-ui-primary/40">Mostrar Primes</span>
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {visible.map(wf => (
          <button
            key={wf.unique_name}
            onClick={() => onSelect(wf.unique_name)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
              selected === wf.unique_name
                ? 'bg-ui-primary/10 text-ui-primary'
                : 'text-ui-primary/40 hover:text-ui-primary/70 hover:bg-ui-primary/5'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[getWfStatus(wf)]}`} />
            <span className="truncate">{wf.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AbilityStatsViewer() {
  const [warframes, setWarframes] = useState<WfEntry[]>([])
  const [tailIndex, setTailIndex] = useState<Map<string, AbilityStatsData>>(new Map())
  const [selected, setSelected]   = useState<string | null>(null)
  const [statuses, setStatuses]   = useState<Record<string, boolean>>(loadStatuses)

  useEffect(() => {
    Promise.all([
      fetch('/data/warframes.json').then(r => r.json()),
      fetch('/data/ability-stats.override.json').then(r => r.json()),
    ]).then(([wfs, override]: [WfEntry[], Record<string, unknown>]) => {
      setWarframes(wfs)
      setTailIndex(buildTailIndex(override))
      if (wfs.length > 0) setSelected(wfs[0].unique_name)
    })
  }, [])

  const toggleReviewed = (uniqueName: string) => {
    setStatuses(prev => {
      const next = { ...prev, [uniqueName]: !prev[uniqueName] }
      saveStatuses(next)
      return next
    })
  }

  const selectedWf = warframes.find(wf => wf.unique_name === selected)

  if (warframes.length === 0) {
    return <div className="p-8 text-ui-primary/30 text-sm">Cargando...</div>
  }

  return (
    <div className="flex h-[calc(100vh-48px)] text-ui-primary overflow-hidden">
      <Sidebar
        warframes={warframes}
        selected={selected}
        onSelect={setSelected}
        statuses={statuses}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedWf ? (
          <div className="text-ui-primary/25 text-sm">Selecciona un warframe</div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-lg font-bold text-ui-primary/90">{selectedWf.name}</h2>
              <span className="text-[10px] text-ui-primary/25 font-mono">
                {selectedWf.abilities.length} habilidades
              </span>
            </div>
            {selectedWf.abilities.map(ability => {
              const tail = ability.unique_name.split('/').pop()!
              const stats = tailIndex.get(tail)
              return (
                <AbilityCard
                  key={ability.unique_name}
                  ability={ability}
                  stats={stats}
                  reviewed={!!statuses[ability.unique_name]}
                  onToggleReviewed={() => toggleReviewed(ability.unique_name)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
