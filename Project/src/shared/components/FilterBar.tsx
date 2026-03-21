import { Field, Radio, RadioGroup } from "@headlessui/react";
import { useDataState } from "@providers/DataState/data-state-context";
import { getCategoryIcon, type ItemCategory } from "@lib/i18n/category-icons";

interface FilterBarProps {
  /** Categorías a mostrar, en orden. Incluir 'all' para el tab "todos". */
  categories: (ItemCategory | 'all')[];
  value: ItemCategory | 'all';
  onChange: (value: ItemCategory | 'all') => void;
}

const ALL_OPTION = { icon: '/assets/ui/Infinite.png', label: 'All' };

function FilterOption({
  category,
  active,
}: {
  category: ItemCategory | 'all';
  active: boolean;
}) {
  const ref = useDataState({ active });
  const { icon, label } =
    category === 'all' ? ALL_OPTION : getCategoryIcon(category as ItemCategory);

  return (
    <Field>
      <Radio className="group relative outline-none" value={category}>
        <div
          ref={ref}
          className="button-bordeless"
          aria-label={label}
          title={label}
        >
          {icon ? (
            <img
              src={icon}
              alt={label}
              className="w-5 h-5 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {label.slice(0, 3)}
            </span>
          )}
        </div>
      </Radio>
    </Field>
  );
}

/**
 * FilterBar — barra de filtrado por categoría compartida entre vistas.
 *
 * El view padre decide qué categorías mostrar y maneja el estado via hook.
 * Este componente solo renderiza — no sabe de datos.
 *
 * @example
 * <FilterBar
 *   categories={['all', 'warframe', 'primary', 'secondary', 'melee']}
 *   value={category}
 *   onChange={setCategory}
 * />
 */
export const FilterBar = ({ categories, value, onChange }: FilterBarProps) => (
  <RadioGroup
    className="flex items-center gap-2"
    value={value}
    onChange={onChange}
  >
    {categories.map((cat) => (
      <FilterOption key={cat} category={cat} active={value === cat} />
    ))}
  </RadioGroup>
);
