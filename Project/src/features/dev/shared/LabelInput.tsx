import { useRef } from "react";
import { Eye } from "lucide-react";
import { FormattedText } from "@lib/FormattedText";

const VAL_TOKENS = ["|val1|", "|val2|", "|val3|"];

interface LabelInputProps {
  value: string;
  modified?: boolean;
  /** Un entry por |valN|. Puede ser un número fijo (misc) o un array de rangos (rawStat). */
  previewValues?: (number | number[] | null)[];
  onChange: (value: string) => void;
}

/**
 * LabelInput — input de label con botones de inserción de |valN| y preview formateada.
 * El click en un token reemplaza la selección activa (o inserta en el cursor).
 */
export function LabelInput({ value, modified, previewValues = [], onChange }: LabelInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertToken = (token: string) => {
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart ?? value.length;
    const end   = el.selectionEnd   ?? value.length;
    const next  = value.slice(0, start) + token + value.slice(end);
    onChange(next);

    // Restore cursor after the inserted token
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  // Build preview text: replace |valN| with the corresponding value (last rank = max)
  const previewText = value
    .replace(/\\n/g, "\n")
    .replace(/\|val(\d+)\|/g, (_, n) => {
      const idx = parseInt(n) - 1;
      const vals = previewValues[idx];
      // If previewValues[idx] is an array of ranks, take the last; otherwise use directly
      if (Array.isArray(vals)) return String(vals[vals.length - 1] ?? 0);
      return String(vals ?? 0);
    });

  return (
    <div className="flex flex-col gap-1">
      {/* Header row: label + token buttons */}
      <div className="flex flex-row items-center justify-normal gap-12">
        <span className="text-[10px] uppercase text-white/30">Label</span>
        <div className="flex gap-1">
          {VAL_TOKENS.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => insertToken(token)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors"
              title={`Insertar ${token} en la posición del cursor`}
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        className={`w-full bg-gray-800 border rounded px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-500 transition-colors
          ${modified ? "border-blue-500/60 text-blue-300" : "border-white/10 text-white/50"}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Preview */}
      <div className="flex items-start gap-2 bg-blue-500/5 px-3 py-1.5 rounded border border-blue-500/10">
        <Eye size={10} className="text-blue-400 shrink-0 mt-0.5" />
        <span className="text-[11px] text-white/40 leading-relaxed">
          {previewText.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              <FormattedText text={line} />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
