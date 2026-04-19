import CustomPopover from "@shared/components/CustomPopover";
import {
  getDamageTypeDefinition,
  getDamageTypeIconPath,
  type DamageIconVariant,
  type DamageType,
} from "@lib/types";
import {
  getDamageLabels,
  getStatusEffectLabels,
  getDamageDescriptions,
} from "@lib/i18n/damage-labels";

/**
 * IconDamageType — renderiza icono + label + popover de un tipo de daño.
 *
 * Migrado de src/assets/ a src/lib/presentation/icons/.
 * Tooltip migrado de group-hover manual a CustomPopover (OQ-6).
 *
 * Parte de la suite de presentación (src/lib/presentation/).
 * Nota: no soporta multi-locale — labels en inglés fijo.
 */
interface IconDamageTypeProps {
  value: string | DamageType;
  variant?: DamageIconVariant;
  className?: string;
  size?: number;
  showLabel?: boolean;
  showStatus?: boolean;
}

export const IconDamageType = ({
  value,
  variant = "colored",
  className = "",
  size = 16,
  showLabel = false,
  showStatus = false,
}: IconDamageTypeProps) => {
  const definition = getDamageTypeDefinition(value);

  if (!definition || definition.key === "none") return null;

  const damageKey = definition.key;
  const icon = getDamageTypeIconPath(damageKey, variant);
  const colorClass = `dt-${damageKey}`;
  const bgClass = `dt-bg-${damageKey}`;

  const labels = getDamageLabels();
  const statusLabels = getStatusEffectLabels();
  const descriptions = getDamageDescriptions();

  const label = labels[damageKey as keyof typeof labels] ?? String(value);
  const statusLabel = statusLabels[damageKey] ?? "";
  const description = descriptions[damageKey] ?? "";

  const trigger = (
    <span
      className={`inline-flex items-baseline gap-1 ${colorClass} ${className} cursor-help`}
    >
      {icon && (
        <img
          src={icon}
          alt={label}
          width={size}
          height={size}
          loading="lazy"
          className="shrink-0 drop-shadow-[0_0_3px_rgba(255,255,255,0.2)]"
          style={{ verticalAlign: "text-bottom" }}
        />
      )}
      {showLabel && (
        <span className="whitespace-nowrap font-medium leading-none pr-1">{label}</span>
      )}
      {showStatus && (
        <span className="text-[0.9em] opacity-60 italic whitespace-nowrap leading-none">
          ({statusLabel})
        </span>
      )}
    </span>
  );

  const popoverContent = (
    <div className={`px-4 py-3 border backdrop-blur-xl min-w-60 shadow-2xl ${bgClass}`}>
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
    </div>
  );

  return (
    <CustomPopover
      popover={popoverContent}
      placement="top"
      renderInJsx
    >
      {trigger}
    </CustomPopover>
  );
};
