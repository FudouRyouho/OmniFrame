import { IconDamageType } from "@assets/IconDamageType";

const DT_KEYS = [
  "impact", "puncture", "slash",
  "heat", "cold", "electricity", "toxin",
  "blast", "corrosive", "gas", "magnetic", "radiation", "viral",
  "void", "tau", "true",
] as const;

const SIZES = [12, 16, 20, 24, 32];

export default function TextFormatView() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-8 flex flex-col gap-10">

      {/* Grid de iconos por tipo */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Damage Type Icons — colored / outline</h2>
        <div className="grid grid-cols-2 gap-2">
          {DT_KEYS.map((dt) => (
            <div key={dt} className="flex items-center gap-4 bg-white/3 border border-white/5 rounded-lg px-4 py-3">
              {/* colored */}
              <div className="flex items-center gap-2 w-40">
                <IconDamageType value={dt} variant="colored" size={20} showLabel />
              </div>
              {/* outline */}
              <div className="flex items-center gap-2 w-40">
                <IconDamageType value={dt} variant="outline" size={20} showLabel />
              </div>
              {/* key */}
              <span className="text-[10px] font-mono text-white/20 ml-auto">{dt}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Escala de tamaños */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Size scale</h2>
        <div className="flex flex-wrap items-end gap-6">
          {SIZES.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <IconDamageType value="radiation" variant="colored" size={s} showLabel />
              <span className="text-[9px] font-mono text-white/20">{s}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Inline con texto — baseline test */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Inline baseline test</h2>
        <div className="flex flex-col gap-3">
          {(["text-xs", "text-sm", "text-base", "text-lg", "text-xl"] as const).map((size) => (
            <p key={size} className={`${size} text-white/60`}>
              Deals <IconDamageType value="viral" size={14} showLabel /> and{" "}
              <IconDamageType value="radiation" size={14} showLabel /> damage on hit.
              <span className="ml-3 text-[9px] font-mono text-white/20">[{size}]</span>
            </p>
          ))}
        </div>
      </section>

      {/* FormattedText tags — todos los formatos soportados */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Tag formats (raw strings)</h2>
        <div className="flex flex-col gap-2 font-mono text-xs text-white/40">
          {[
            "+165% <DT_SLASH_COLOR>Slash Damage",
            "+80% <DT_RADIATION_COLOR> and <DT_MAGNETIC_COLOR> Damage",
            "+30% chance to apply <DT_SLASH_COLOR> on Critical",
            "On Kill:\\n+40% <DT_VIRAL_COLOR> Status Chance for 20s",
            "|DT_ELECTRICITY| Damage on Status",
            "<DT_TOXIN_OUTLINE> Outline variant",
          ].map((raw, i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded px-3 py-2">
              <span className="text-white/20 block mb-1">{raw}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
