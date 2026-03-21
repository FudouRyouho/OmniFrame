import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { fetchWeapon } from '../lib/weaponData'
import type { Weapon, DamageMap } from '../lib/types'

/**
 * @deprecated Prototype/reference page — predates items-view.tsx unified view.
 * Kept for compatibility. Do not extend. Fix only if broken.
 */

// ── helpers ───────────────────────────────────────────────────────────────────

const pct = (v: number) => `${(v * 100).toFixed(1)}%`
const num = (v: number | null | undefined, decimals = 1) =>
  v != null ? v.toFixed(decimals) : '—'

const DAMAGE_COLORS: Record<string, string> = {
  impact:      'text-gray-300',
  puncture:    'text-yellow-600',
  slash:       'text-red-400',
  heat:        'text-orange-400',
  cold:        'text-blue-400',
  electricity: 'text-yellow-300',
  toxin:       'text-green-400',
  blast:       'text-orange-300',
  radiation:   'text-yellow-500',
  gas:         'text-lime-400',
  magnetic:    'text-purple-400',
  viral:       'text-pink-400',
  corrosive:   'text-green-600',
  void:        'text-white',
  true:        'text-white/60',
}

function DamageTable({ damage, totalDamage }: { damage: DamageMap; totalDamage?: number }) {
  const entries = Object.entries(damage)
    .filter(([, v]) => v && v > 0) as [string, number][]
  if (!entries.length) return null
  return (
    <div className="space-y-0.5">
      {entries.map(([type, val]) => (
        <div key={type} className="flex justify-between text-xs">
          <span className={`capitalize ${DAMAGE_COLORS[type] ?? 'text-white/50'}`}>{type}</span>
          <span className="font-mono text-white/70">{val.toFixed(1)}</span>
        </div>
      ))}
      {totalDamage != null && (
        <div className="flex justify-between text-xs border-t border-white/10 pt-1 mt-1">
          <span className="text-white/40">Total</span>
          <span className="font-mono font-semibold">{totalDamage.toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0 group">
      <span className="typography-1 text-ui-secondary group-hover:text-ui-primary transition-colors">{label}</span>
      <span className="typography-2 text-white font-mono">{value}</span>
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function WeaponDetail() {
  const { name } = useParams<{ name: string }>()
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeapon(decodeURIComponent(name ?? '')).then(w => {
      setWeapon(w ?? null)
      setLoading(false)
    })
  }, [name])

  if (loading) return <p className="p-4">Cargando...</p>
  if (!weapon) return (
    <div className="p-4">
      <p>Arma no encontrada.</p>
      <Link to="/weapons" className="underline">Volver</Link>
    </div>
  )

  const isMelee = weapon.category === 'Melee'

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Link to="/weapons" className="text-sm text-white/40 hover:text-white mb-4 block">← Volver</Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {weapon.wikiaThumbnail && (
          <img src={weapon.wikiaThumbnail} alt={weapon.name} className="w-20 h-20 object-contain rounded" />
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {weapon.name} {weapon.isPrime && <span className="text-yellow-400 text-lg">Prime</span>}
          </h1>
          <p className="text-sm text-white/50 mt-1">{weapon.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{weapon.category}</span>
            {weapon.type && <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{weapon.type}</span>}
            {weapon.masteryReq > 0 && (
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded">MR {weapon.masteryReq}</span>
            )}
            {weapon.disposition != null && (
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded" title="Riven disposition">
                {'◆'.repeat(weapon.disposition)}{'◇'.repeat(5 - weapon.disposition)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Combat stats */}
        <section className="bg-white/5 rounded p-3">l
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Stats</h2>
          <StatRow label="Crit Chance"    value={pct(weapon.criticalChance)} />
          <StatRow label="Crit Mult"      value={`${weapon.criticalMultiplier.toFixed(1)}x`} />
          <StatRow label="Status Chance"  value={pct(weapon.procChance)} />
          {!isMelee && <>
            <StatRow label="Fire Rate"    value={num(weapon.fireRate)} />
            <StatRow label="Magazine"     value={weapon.magazineSize} />
            <StatRow label="Reload"       value={weapon.reloadTime != null ? `${weapon.reloadTime}s` : null} />
            <StatRow label="Multishot"    value={weapon.multishot} />
            <StatRow label="Accuracy"     value={num(weapon.accuracy)} />
            <StatRow label="Trigger"      value={weapon.trigger} />
            <StatRow label="Noise"        value={weapon.noise} />
          </>}
          {isMelee && <>
            <StatRow label="Attack Speed" value={num(weapon.attackSpeed)} />
            <StatRow label="Range"        value={weapon.range != null ? `${weapon.range}m` : null} />
            <StatRow label="Combo Dur."   value={weapon.comboDuration != null ? `${weapon.comboDuration}s` : null} />
            <StatRow label="Follow-thru"  value={num(weapon.followThrough)} />
            <StatRow label="Block Angle"  value={weapon.blockingAngle != null ? `${weapon.blockingAngle}°` : null} />
            <StatRow label="Wind-up"      value={num(weapon.windUp)} />
            <StatRow label="Stance Pol."  value={weapon.stancePolarity} />
          </>}
          <StatRow label="Polarities" value={weapon.polarities?.join(', ') || '—'} />
        </section>

        {/* Damage */}
        <section className="bg-white/5 rounded p-3">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Daño base</h2>
          <DamageTable damage={weapon.damage} totalDamage={weapon.totalDamage} />
        </section>
      </div>

      {/* Melee special attacks */}
      {isMelee && (weapon.slamAttack || weapon.heavyAttackDamage) && (
        <section className="bg-white/5 rounded p-3">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Ataques especiales</h2>
          <StatRow label="Slam"              value={num(weapon.slamAttack, 0)} />
          <StatRow label="Slam Radial"       value={num(weapon.slamRadialDamage, 0)} />
          <StatRow label="Slam Radius"       value={weapon.slamRadius != null ? `${weapon.slamRadius}m` : null} />
          <StatRow label="Heavy Attack"      value={num(weapon.heavyAttackDamage, 0)} />
          <StatRow label="Heavy Slam"        value={num(weapon.heavySlamAttack, 0)} />
          <StatRow label="Heavy Slam Radial" value={num(weapon.heavySlamRadialDamage, 0)} />
          <StatRow label="Heavy Slam Radius" value={weapon.heavySlamRadius != null ? `${weapon.heavySlamRadius}m` : null} />
          <StatRow label="Slide Attack"      value={num(weapon.slideAttack, 0)} />
        </section>
      )}

      {/* Multi-attack weapons */}
      {weapon.attacks && weapon.attacks.length > 1 && (
        <section className="mt-4">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Modos de ataque</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weapon.attacks.map((atk, i) => (
              <div key={i} className="bg-white/5 rounded p-3">
                <p className="text-sm font-medium mb-2">{atk.name}</p>
                {atk.damage && <DamageTable damage={atk.damage} totalDamage={atk.totalDamage} />}
                {atk.crit_chance != null && (
                  <div className="mt-2 text-xs text-white/40 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Crit</span><span className="font-mono">{pct(atk.crit_chance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span><span className="font-mono">{pct(atk.status_chance ?? 0)}</span>
                    </div>
                    {atk.shot_type && <div className="flex justify-between">
                      <span>Type</span><span className="font-mono">{atk.shot_type}</span>
                    </div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
