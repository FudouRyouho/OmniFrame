import { STATUS_CONFIG, STATUS_OPTIONS, type EditorStatus } from "./editor-types";

interface StatusSelectorProps {
  value: EditorStatus;
  onChange: (status: EditorStatus) => void;
}

/**
 * StatusSelector — selector de estado compartido entre editores de dev.
 * Muestra un dot de color + dropdown con los estados disponibles.
 */
export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
      <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[value].color}`} />
      <select
        className="bg-transparent text-sm font-medium outline-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value as EditorStatus)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s} className="bg-gray-900">
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
