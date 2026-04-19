import { useDataState } from "@providers/DataState/data-state-context";
import type { FilterCategory } from "src/domains/equipment/hooks/use-view-filter";

interface FilterIconProps {
  cat: FilterCategory;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

const FilterIcon = ({
  cat,
  active,
  onClick,
  onHover,
  onLeave,
}: FilterIconProps) => {
  const ref = useDataState({ active });
  return (
    <span
      ref={ref}
      className="button-bordeless"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      title={cat.label}
    >
      <img src={cat.icon} alt={cat.label} className="w-4 h-4" />
    </span>
  );
};

export default FilterIcon;
