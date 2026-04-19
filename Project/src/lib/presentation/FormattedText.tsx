import React from "react";
import { IconDamageType } from "@lib/presentation/icons/IconDamageType";
import { resolveDamageTypeTag } from "@lib/types";

/**
 * FormattedText — parsea texto con tags DT_* y los reemplaza por IconDamageType.
 *
 * Cubre tres formatos que aparecen en los datos:
 *   - ability-stats.override.json: |DT_SLASH|, |DT_EXPLOSION| (sin sufijo)
 *   - mods levelStats: <DT_SLASH_COLOR>, <DT_RADIATION_COLOR> (sufijo _COLOR)
 *   - mods levelStats: <DT_SLASH_OUTLINE> (sufijo _OUTLINE → variant outline)
 *
 * Parte de la suite de presentación (src/lib/presentation/).
 */
interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className }) => {
  if (!text) return null;

  const regex = /([|<])(DT_[A-Z0-9_]+)([|>])/gi;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const rawTag = match[2].toUpperCase();
    const variant: "colored" | "outline" = rawTag.endsWith("_OUTLINE") ? "outline" : "colored";
    const iconKey = resolveDamageTypeTag(rawTag);

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
      parts.push(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
