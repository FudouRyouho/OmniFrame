import React from "react";
import type { Weapon, WeaponAttack } from "@shared/types";
import { getAttackStats } from "@lib/item-details";
import { StatPanel } from "./StatPanel";

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
    <StatPanel 
      stats={stats as any} 
      title={showTitle ? attack.name.toUpperCase() : undefined} 
    />
  );
};
