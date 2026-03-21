import React from "react";
import { IconDamageType } from "@assets/IconDamageType";

/**
 * Mapa de normalización: tag interno del juego → key canónica de IconDamageType.
 *
 * Cubre tres formatos que aparecen en los datos:
 *   - ability-stats.json:  |DT_SLASH|, |DT_EXPLOSION|  (sin sufijo)
 *   - mods levelStats:     <DT_SLASH_COLOR>, <DT_RADIATION_COLOR>  (sufijo _COLOR)
 *   - mods levelStats:     <DT_SLASH_OUTLINE>  (sufijo _OUTLINE → variant outline)
 *
 * El sufijo _COLOR / _OUTLINE se extrae en el parser — aquí solo mapeamos
 * el nombre base al key canónico de IconDamageType.
 */
const DT_KEY_MAP: Record<string, string> = {
  DT_IMPACT:      "impact",
  DT_PUNCTURE:    "puncture",
  DT_SLASH:       "slash",
  DT_HEAT:        "heat",
  DT_FIRE:        "heat",
  DT_COLD:        "cold",
  DT_FREEZE:      "cold",
  DT_ELECTRICITY: "electricity",
  DT_ELECTRIC:    "electricity",
  DT_TOXIN:       "toxin",
  DT_POISON:      "toxin",
  DT_BLAST:       "blast",
  DT_EXPLOSION:   "blast",
  DT_RADIATION:   "radiation",
  DT_RADIANT:     "radiation",
  DT_GAS:         "gas",
  DT_MAGNETIC:    "magnetic",
  DT_VIRAL:       "viral",
  DT_CORROSIVE:   "corrosive",
  DT_VOID:        "void",
  DT_SENTIENT:    "sentient",
  DT_TAU:         "tau",
  DT_TRUE:        "true",
  DT_FINISHER:    "true",
};

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className }) => {
  if (!text) return null;

  // Matches: |DT_FOO|, |DT_FOO_COLOR|, |DT_FOO_OUTLINE|
  //          <DT_FOO>, <DT_FOO_COLOR>, <DT_FOO_OUTLINE>
  const regex = /([|<])(DT_[A-Z0-9_]+)([|>])/gi;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const rawTag = match[2].toUpperCase(); // e.g. DT_SLASH_COLOR

    // Strip _COLOR / _OUTLINE suffix to get the base key
    const variant: "colored" | "outline" = rawTag.endsWith("_OUTLINE") ? "outline" : "colored";
    const baseTag = rawTag.replace(/_COLOR$|_OUTLINE$/, ""); // DT_SLASH

    const iconKey = DT_KEY_MAP[baseTag];

    if (iconKey) {
      parts.push(
        <IconDamageType
          key={match.index}
          value={iconKey}
          variant={variant}
          showLabel={true}
        />
      );
    } else {
      // Unknown tag — render as-is so nothing is silently swallowed
      parts.push(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
