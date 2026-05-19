import React from "react";
import type { Mod } from "@shared/types";
import { getModStats } from "@lib/item-details";
import { StatRow } from "./stat-row";

interface ModDetailsViewProps {
  item: Mod;
}

export const ModDetailsView: React.FC<ModDetailsViewProps> = ({ item }) => {
  const stats = getModStats(item);

  return (
    <div className="space-y-1">
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

        // Efectos de mods — texto libre, sin value
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
