import type { DamageType } from '@lib/types'
import {
  getDamageLabels,
  getStatusEffectLabels,
  getDamageDescriptions,
} from '@lib/i18n/damage-labels'

interface IconDamageTypeProps {
  value: string | DamageType;
  variant?: 'colored' | 'outline';
  className?: string;
  size?: number;
  showLabel?: boolean;
  showStatus?: boolean;
}

const iconMap: Record<'colored' | 'outline', Record<string, string>> = {
  colored: {
    blast:       '/assets/damage-type/blast-colored.png',
    cold:        '/assets/damage-type/cold-colored.png',
    corrosive:   '/assets/damage-type/corrosive-colored.png',
    electricity: '/assets/damage-type/electric-colored.png',
    gas:         '/assets/damage-type/gas-colored.png',
    heat:        '/assets/damage-type/heat-colored.png',
    impact:      '/assets/damage-type/impact-colored.png',
    magnetic:    '/assets/damage-type/magnetic-colored.png',
    puncture:    '/assets/damage-type/puncture-colored.png',
    radiation:   '/assets/damage-type/radiation-colored.png',
    sentient:    '/assets/damage-type/sentient-colored.png',
    tau:         '/assets/damage-type/sentient-colored.png',
    slash:       '/assets/damage-type/slash-colored.png',
    toxin:       '/assets/damage-type/toxic-colored.png',
    viral:       '/assets/damage-type/viral-colored.png',
    void:        '/assets/damage-type/void-colored.png',
    true:        '/assets/damage-type/true-colored.png',
  },
  outline: {
    blast:       '/assets/damage-type/blast-outline.png',
    cold:        '/assets/damage-type/cold-outline.png',
    corrosive:   '/assets/damage-type/corrosive-outline.png',
    electricity: '/assets/damage-type/electric-outline.png',
    gas:         '/assets/damage-type/gas-outline.png',
    heat:        '/assets/damage-type/heat-outline.png',
    impact:      '/assets/damage-type/impact-outline.png',
    magnetic:    '/assets/damage-type/magnetic-outline.png',
    puncture:    '/assets/damage-type/puncture-outline.png',
    radiation:   '/assets/damage-type/radiation-outline.png',
    sentient:    '/assets/damage-type/sentient-outline.png',
    tau:         '/assets/damage-type/sentient-outline.png',
    slash:       '/assets/damage-type/slash-outline.png',
    toxin:       '/assets/damage-type/toxic-outline.png',
    viral:       '/assets/damage-type/viral-outline.png',
    void:        '/assets/damage-type/void-outline.png',
    true:        '/assets/damage-type/true-outline.png',
  },
}

export const IconDamageType = ({
  value,
  variant = 'colored',
  className = '',
  size = 16,
  showLabel = false,
  showStatus = false,
}: IconDamageTypeProps) => {
  if (!value || value === 'none') return null

  const damageKey = value.toLowerCase() as DamageType
  const icon = iconMap[variant][damageKey]
  const colorClass = `dt-${damageKey}`
  const bgClass = `dt-bg-${damageKey}`

  // Labels resolved from i18n — locale switching ready
  const labels       = getDamageLabels()
  const statusLabels = getStatusEffectLabels()
  const descriptions = getDamageDescriptions()

  const label       = labels[damageKey as keyof typeof labels] ?? value
  const statusLabel = statusLabels[damageKey] ?? ''
  const description = descriptions[damageKey] ?? ''

  return (
    <div className="group relative inline-flex items-baseline cursor-help">
      <span
        className={`inline-flex items-baseline gap-1 ${colorClass} ${className} transition-opacity group-hover:opacity-80`}
      >
        {icon && (
          <img
            src={icon}
            alt={value}
            width={size}
            height={size}
            loading="lazy"
            className="shrink-0 drop-shadow-[0_0_3px_rgba(255,255,255,0.2)]"
            style={{ verticalAlign: "text-bottom" }}
          />
        )}
        {/*ToDo: Añadir dropshadow al texto*/}
        {showLabel && (
          <span className="whitespace-nowrap font-medium leading-none pr-1">{label}</span>
        )}
        {showStatus && (
          <span className="text-[0.9em] opacity-60 italic whitespace-nowrap leading-none">
            ({statusLabel})
          </span>
        )}
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-100">
        <div className={`px-4 py-3 rounded-xl border backdrop-blur-xl min-w-[240px] shadow-2xl ${bgClass}`}>
          <div className={`flex items-center gap-2 font-bold text-sm border-b border-white/10 pb-2 mb-2 ${colorClass}`}>
            {icon && <img src={icon} width={16} height={16} alt="" />}
            <span className="uppercase tracking-widest">{label}</span>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] leading-relaxed text-white/70">{description}</p>
            <div className="flex items-center justify-between pt-1 opacity-90 border-t border-white/5 mt-1">
              <span className="text-[9px] uppercase tracking-tighter text-white/40 font-bold">
                Status Effect
              </span>
              <span className={`text-[10px] font-bold ${colorClass}`}>{statusLabel}</span>
            </div>
          </div>
          <div className={`absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b backdrop-blur-xl -mt-1.5 ${bgClass}`} />
        </div>
      </div>
    </div>
  )
}
