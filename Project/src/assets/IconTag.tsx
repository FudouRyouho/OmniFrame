const FACTIONS_BASE = "/assets/factions";

const iconKey: Record<string, string> = {
  Anarchs:  `${FACTIONS_BASE}/Anarchs.png`,
  Corpus:   `${FACTIONS_BASE}/Corpus.png`,
  Grineer:  `${FACTIONS_BASE}/Grineer.png`,
  Murmur:   `${FACTIONS_BASE}/Murmur.png`,
  Narmer:   `${FACTIONS_BASE}/Narmer.png`,
  Orokin:   `${FACTIONS_BASE}/Orokin.png`,
  Scaldra:  `${FACTIONS_BASE}/Scaldra.png`,
  Sentient: `${FACTIONS_BASE}/Sentient.png`,
  Techrot:  `${FACTIONS_BASE}/Techrot.png`,
  Tenno:    `${FACTIONS_BASE}/Tenno.png`,
};

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
  labelClassName = "typography-1 text-ui-secondary",
}: IconTagProps) => {
  const icon = iconKey[value];

  return (
    <div className={className}>
      {icon && (
        <img
          src={icon}
          alt={value}
          className={iconClassName}
          loading="lazy"
        />
      )}
      {showLabel && <span className={labelClassName}>{value}</span>}
    </div>
  );
};
