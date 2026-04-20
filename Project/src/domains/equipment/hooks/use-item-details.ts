/**
 * @domain Features / Equipment / Hooks
 * @SSoT docs/domains/ui-ux/shell-principles.md
 * @status activo
 */
import { useState, useMemo, useCallback } from "react";
import type { BaseItem, WeaponAttack } from "@shared/types";
import { isWeapon } from "@shared/types";

interface UseItemDetailsProps {
  item: BaseItem;
}

export const useItemDetails = ({ item }: UseItemDetailsProps) => {
  const attacks: WeaponAttack[] = useMemo(
    () => (isWeapon(item) ? item.attacks ?? [] : []),
    [item]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedAttack = useMemo(() => {
    if (attacks.length === 0) return null;
    const safeIndex = Math.min(Math.max(0, selectedIndex), attacks.length - 1);
    return attacks[safeIndex];
  }, [attacks, selectedIndex]);

  const hasMultipleAttacks = attacks.length > 1;

  const cycleAttack = useCallback(() => {
    if (attacks.length <= 1) return;
    setSelectedIndex((prevIndex) => (prevIndex + 1) % attacks.length);
  }, [attacks.length]);

  return {
    selectedAttack,
    selectedIndex,
    setSelectedIndex,
    hasMultipleAttacks,
    attacks,
    totalAttacks: attacks.length,
    cycleAttack,
  };
};
