import { getFactionIcon } from "@lib/i18n/faction-icons";

/**
 * IconTag — renderiza icono + label de una facción.
 *
 * Consume faction-icons.ts como fuente canónica de lookup.
 * Parte de la suite de presentación (src/lib/presentation/).
 *
 * Nota: no soporta multi-locale — labels en inglés fijo.
 */
interface IconTagProps {
  value: string;
  showLabel?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}

export const IconTag = ({
  value,
  showLabel = true,
  className = "inline-flex items-center gap-1.5",
  iconClassName = "w-4 h-4 object-contain",
  labelClassName = "text-xs leading-relaxed tracking-wide font-normal text-ui-secondary",
}: IconTagProps) => {
  const entry = getFactionIcon(value);

  return (
    <div className={className}>
      {entry?.icon && (
        <img
          src={entry.icon}
          alt={value}
          className={iconClassName}
          loading="lazy"
        />
      )}
      {showLabel && <span className={labelClassName}>{entry?.label ?? value}</span>}
    </div>
  );
};
