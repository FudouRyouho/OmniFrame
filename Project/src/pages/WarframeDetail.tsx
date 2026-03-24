import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { fetchWarframe } from "../lib/warframeData";
import { useTheme } from "../providers/Theme/theme-context";
import type { Warframe, AbilityStatEntry, AbilityStatValue, AbilityUpgradeBy } from "../lib/types";
import { FormattedText } from "../lib/FormattedText";

// ── helpers ──────────────────────────────────────────────────────────────────

const MODIFIER_LABEL: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH: "STR",
  AVATAR_ABILITY_RANGE: "RNG",
  AVATAR_ABILITY_DURATION: "DUR",
  AVATAR_ABILITY_EFFICIENCY: "EFF",
  ENERGY_COST: "COST",
  ENERGY_DRAIN: "DRAIN",
  NONE: "—",
};

function interpolate(
  text: string,
  baseValue?: number,
  modifier?: string,
  stats?: { value: number }[],
): string {
  if (stats && stats.length > 0) {
    return text.replace(/\|val(\d+)\|/g, (_, index) => {
      const valIdx = parseInt(index) - 1;
      return (stats[valIdx]?.value ?? 0).toString();
    });
  }
  const values = baseValue !== undefined ? [{ value: baseValue }] : [];
  if (modifier && modifier.includes(",")) {
    const extra = modifier.split(",").map((v) => ({ value: parseFloat(v.trim()) || 0 }));
    values.push(...extra);
  }
  return text.replace(/\|val(\d+)\|/g, (_, index) => {
    const valIdx = parseInt(index) - 1;
    return (values[valIdx]?.value ?? 0).toString();
  });
}

// ── sub-components ────────────────────────────────────────────────────────────

function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-warframe angular-cut p-4 relative overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3 border-b border-ui-accent/20 pb-1">
          <h3 className="typography-3 text-ui-accent">{title}</h3>
          <div className="dot-rotated w-1! h-1! bg-ui-accent/40" />
        </div>
      )}
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0 group">
      <span className="typography-1 text-ui-secondary group-hover:text-ui-primary transition-colors">{label}</span>
      <span className="typography-2 text-white font-mono">{value}</span>
    </div>
  );
}

function getDisplayValue(value: AbilityStatValue): number {
  return value.helminthBase ?? value.baseValue;
}

function getVisibleAbilityStats(warframe: Warframe) {
  return warframe.abilities.map((ability) => ({
    ability,
    stats: (ability.stats?.groups ?? [])
      .flatMap((group) => group.stats)
      .slice(0, 6),
  }));
}

function AbilityStatLine({ stat }: { stat: AbilityStatEntry }) {
  const activeModifiers = Array.from(
    new Set((stat.values || []).map((value) => value.upgradeBy)),
  ).filter((m) => m !== "NONE");

  return (
    <div className="py-1">
      {(stat.label || activeModifiers.length > 0) && (
        <div className="flex items-baseline justify-between">
          {stat.label && (
            <FormattedText
              className="typography-2 text-ui-primary/80"
              text={interpolate(
                stat.label,
                undefined,
                undefined,
                stat.values.map((value) => ({ value: getDisplayValue(value) })),
              )}
            />
          )}
          <div className="flex gap-1 ml-4 shrink-0">
            {activeModifiers.map((mod) => (
              <span key={mod} className="typography-1 text-ui-accent opacity-60">
                {MODIFIER_LABEL[mod as AbilityUpgradeBy] ?? mod}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WarframeDetail() {
  const { name } = useParams<{ name: string }>();
  const [warframe, setWarframe] = useState<Warframe | null>(null);
  const [loading, setLoading] = useState(true);
  const { themeColor } = useTheme();

  useEffect(() => {
    fetchWarframe(decodeURIComponent(name ?? "")).then((w) => {
      setWarframe(w ?? null);
      setLoading(false);
    });
  }, [name]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
       <div className="dot-rotated w-8! h-8! animate-spin border-ui-accent" />
    </div>
  );

  if (!warframe) return (
    <div className="p-8 text-center space-y-4">
      <p className="typography-10 opacity-20 italic">ENTRY_NOT_FOUND</p>
      <Link to="/" className="typography-3 text-ui-accent hover:underline">← DATABASE_ROOT</Link>
    </div>
  );

  // Force Orokin theme for Primes, otherwise use global
  const activeTheme = warframe.isPrime ? "theme-orokin" : `theme-${themeColor}`;
  const abilityStats = getVisibleAbilityStats(warframe);

  return (
    <div className={`${activeTheme} min-h-screen bg-ui-bg/20 text-white p-8`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumbs */}
        <Link to="/" className="typography-1 text-ui-accent opacity-40 hover:opacity-100 flex items-center gap-2">
           <div className="dot-rotated w-1! h-1! border-ui-accent" />
           BACK_TO_ARSENAL
        </Link>

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-64 aspect-square glass-warframe angular-cut p-4 relative group">
            {warframe.image ? (
              <img src={warframe.image} alt={warframe.name} className="w-full h-full object-contain drop-shadow-2xl transition-transform group-hover:scale-110 duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center typography-10 opacity-10">NO_SIG</div>
            )}
            <div className="absolute top-2 right-2 dot-rotated w-2! h-2! bg-ui-accent/20" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <h1 className="typography-10 italic">
                {warframe.name.toUpperCase()}
                {warframe.isPrime && <span className="text-ui-accent NOT-italic ml-2">PRIME</span>}
              </h1>
              <div className="flex flex-wrap gap-3">
                 {warframe.playstyle?.map(p => (
                   <span key={p} className="typography-1 text-ui-accent border border-ui-accent/30 px-2 py-0.5 rounded-[2px] bg-ui-accent/5">
                     {p}
                   </span>
                 ))}
              </div>
            </div>
            <p className="typography-4 text-ui-secondary leading-relaxed max-w-3xl border-l-2 border-ui-accent/20 pl-4 py-1 italic">
              {warframe.description}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
               <div className="p-2 border border-white/5 rounded">
                  <span className="typography-1 block opacity-30-label">Armor</span>
                  <span className="typography-4 text-ui-accent font-bold-value">{warframe.armor}</span>
               </div>
               <div className="p-2 border border-white/5 rounded">
                  <span className="typography-1 block opacity-30-label">Health</span>
                  <span className="typography-4 text-ui-accent font-bold-value">{warframe.healthRank30 || warframe.health}</span>
               </div>
               <div className="p-2 border border-white/5 rounded">
                  <span className="typography-1 block opacity-30-label">Shield</span>
                  <span className="typography-4 text-ui-accent font-bold-value">{warframe.shieldRank30 || warframe.shield}</span>
               </div>
               <div className="p-2 border border-white/5 rounded">
                  <span className="typography-1 block opacity-30-label">Energy</span>
                  <span className="typography-4 text-ui-accent font-bold-value">{warframe.energyRank30 || warframe.energy || warframe.power}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Content Tabs / Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
               <h2 className="typography-3 text-ui-accent flex items-center gap-2">
                  ABILITIES_OVERVIEW
               </h2>
               <div className="grid gap-4">
                  {abilityStats.map(({ ability: a, stats }, idx) => (
                    <Panel key={a.uniqueName} className="group hover:bg-white/2 transition-colors">
                       <div className="flex gap-4">
                          <div className="w-12 h-12 shrink-0 bg-black/40 angular-cut p-2 border border-ui-accent/20 group-hover:border-ui-accent/50 transition-colors flex items-center justify-center">
                             {a.icon ? (
                               <img 
                                src={a.icon.startsWith('/') ? `https://content.warframe.com/MobileExport${a.icon}` : `https://wiki.warframe.com/images/${a.icon}`} 
                                alt={a.name} 
                                className="w-full h-full object-contain filter brightness-125"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://wiki.warframe.com/images/AbilityPlaceholder.png' }}
                               />
                             ) : <div className="dot-rotated w-2! h-2! border-ui-accent" />}
                          </div>
                          <div className="flex-1 space-y-1">
                             <div className="flex justify-between items-center">
                               <h4 className="typography-3 text-ui-primary">{a.name.toUpperCase()}</h4>
                               <span className="typography-1 opacity-40">0{idx + 1}</span>
                             </div>
                             <p className="typography-2 text-ui-secondary italic mb-2 line-clamp-2">{a.description}</p>
                             
                             {stats.length > 0 && (
                               <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 border-t border-white/5 pt-2">
                                  {stats.map((s, i) => (
                                    <AbilityStatLine key={i} stat={s} />
                                  ))}
                               </div>
                             )}
                          </div>
                       </div>
                    </Panel>
                  ))}
               </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
             <Panel title="BASE_SPECIFICATIONS">
                <StatRow label="Sprint Speed" value={warframe.sprintSpeed} />
                <StatRow label="Initial Energy" value={warframe.initialEnergy} />
                <StatRow label="Mastery Requirement" value={warframe.masteryReq} />
                <StatRow label="Polarities" value={warframe.polarities?.join(", ") || "None"} />
                <StatRow label="Aura Polarity" value={warframe.aura || "None"} />
             </Panel>

             {warframe.passiveDescription && (
               <Panel title="PASSIVE_SYSTEM">
                  <FormattedText 
                    className="typography-2 text-ui-secondary italic leading-relaxed" 
                    text={warframe.passiveDescription} 
                  />
               </Panel>
             )}

             {warframe.subsumed && (
               <Panel title="HELMINTH_EXTRACT">
                  <div className="flex items-center gap-3">
                     <div className="dot-rotated w-1! h-1! bg-green-500" />
                     <span className="typography-3 text-green-400">{warframe.subsumed}</span>
                  </div>
               </Panel>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
