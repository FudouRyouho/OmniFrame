import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { fetchWarframe } from "@lib/warframe-data";
import type { Warframe, Ability } from "@shared/types";
import { resolveLocalImageUrl } from "@lib/image-url";
import { FormattedText } from "@lib/presentation/FormattedText";
import { StatRow } from "./stat-row";

const AbilityCard = ({ ability }: { ability: Ability }) => (
  <div className="flex flex-col gap-2 p-3 bg-white/5 rounded">
    {resolveLocalImageUrl(ability.image_name) ? (
      <img
        src={resolveLocalImageUrl(ability.image_name)}
        alt={ability.name}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
        className="w-12 h-12 object-contain"
      />
    ) : (
      <div
        className="w-12 h-12 rounded bg-white/5 border border-white/10"
        aria-label="No image"
      />
    )}
    <p className="text-sm font-semibold">{ability.name}</p>
    <FormattedText text={ability.description} className="text-xs opacity-60" />
  </div>
);

const WarframeDetailView = () => {
  const { uniqueName } = useParams<{ uniqueName: string }>();
  const location = useLocation();
  const [item, setItem] = useState<Warframe | null>(null);
  const [loading, setLoading] = useState(true);
  const routeState = location.state as { uniqueName?: string } | null;

  useEffect(() => {
    const identifier =
      routeState?.uniqueName ?? decodeURIComponent(uniqueName ?? "");
    fetchWarframe(identifier).then((w) => {
      setItem(w ?? null);
      setLoading(false);
    });
  }, [routeState?.uniqueName, uniqueName]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!item)
    return (
      <div className="p-4">
        <p>Not found: {uniqueName}</p>
        <Link to="/equipment/warframes">← Back</Link>
      </div>
    );

  const basicStats = [
    { label: "Health", value: item.stats.health },
    { label: "Shield", value: item.stats.shield },
    { label: "Armor", value: item.stats.armor },
    { label: "Energy", value: item.stats.energy },
    { label: "Sprint", value: item.stats.sprint_speed },
  ];

  const numberFormatter = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="h-full overflow-hidden p-6 overflow-y-auto">
      <div className="flex gap-6 mb-6">
        {resolveLocalImageUrl(item.image_name) && (
          <img
            src={resolveLocalImageUrl(item.image_name)}
            alt={item.name}
            className="w-32 h-32 object-contain shrink-0"
          />
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="text-sm opacity-60">{item.description}</p>
        </div>
      </div>

      <div className="bg-black/35 border border-white/10 rounded-sm overflow-hidden mb-6">
        {basicStats.map((stat, index) => (
          <StatRow
            key={stat.label}
            label={stat.label}
            value={numberFormatter.format(stat.value ?? 0)}
            isOdd={index % 2 === 1}
            valueTone="accent"

          />
        ))}
      </div>

      {item.abilities.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3">Abilities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {item.abilities.map((ability) => (
              <AbilityCard key={ability.unique_name} ability={ability} />
            ))}
          </div>
        </>
      )}

      <Link
        to="/equipment/warframes"
        className="text-sm opacity-40 hover:opacity-100 inline-block mt-8"
      >
        ← Back
      </Link>
    </div>
  );
};

export default WarframeDetailView;
