import React from "react";
import type { Weapon, WeaponAttack } from "@shared/types";
import { getAttackStats } from "@lib/item-details";
import { StatRow } from "./stat-row";

interface AttackProfilePanelProps {
  weapon: Weapon;
  attack: WeaponAttack;
  showTitle?: boolean;
}

export const AttackProfilePanel: React.FC<AttackProfilePanelProps> = ({
  weapon,
  attack,
  showTitle = true,
}) => {
  const stats = getAttackStats(weapon, attack);

  return (
    <div className="space-y-1">
      {showTitle && (
        <div className="text-ui-accent text-[11px] font-bold px-3 py-2 bg-white/5 tracking-widest uppercase">
          {attack.name.toUpperCase()}
        </div>
      )}

      {stats.map((entry, index) => {
        if (entry.isSectionHeader) {
          return (
            <div
              key={entry.key}
              className="text-ui-accent text-[9px] font-bold px-3 py-2 opacity-60 tracking-[0.2em] pt-4"
            >
              {entry.label}
            </div>
          );
        }

        // Efectos de mods — solo label, sin value (texto libre)
        if (entry.value === "") {
          return (
            <div
              key={entry.key}
              className={`px-3 py-1.5 text-[11px] text-ui-primary ${index % 2 !== 0 ? "bg-white/3" : ""}`}
            >
              {entry.label}
            </div>
          );
        }

        return (
          <StatRow
            key={entry.key}
            label={entry.label}
            value={entry.value}
            isOdd={index % 2 !== 0}
          />
        );
      })}
    </div>
  );
};
