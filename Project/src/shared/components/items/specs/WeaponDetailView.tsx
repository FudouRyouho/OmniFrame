import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { fetchWeapon } from "@lib/weapon-data";
import type { Weapon } from "@shared/types";

const StatBadge = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex flex-col items-center gap-0.5 px-3 py-2 bg-white/5 rounded">
    <span className="text-xs opacity-40 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

const WeaponDetailView = () => {
  const { uniqueName } = useParams<{ uniqueName: string }>();
  const location = useLocation();
  const [item, setItem] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const routeState = location.state as { uniqueName?: string } | null;

  useEffect(() => {
    const identifier =
      routeState?.uniqueName ?? decodeURIComponent(uniqueName ?? "");
    fetchWeapon(identifier).then((w) => {
      setItem(w ?? null);
      setLoading(false);
    });
  }, [routeState?.uniqueName, uniqueName]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!item)
    return (
      <div className="p-4">
        <p>Not found: {uniqueName}</p>
        <Link to="/equipment/weapons">← Back</Link>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        to="/equipment/weapons"
        className="text-sm opacity-40 hover:opacity-100 block mb-6"
      >
        ← Back
      </Link>

      <div className="flex gap-6 mb-6">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-32 h-32 object-contain shrink-0"
          />
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="text-sm opacity-40">
            {item.category} · MR{item.mastery_req}
          </p>
          <p className="text-sm opacity-60">{item.description}</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <StatBadge label="Damage" value={item.stats.total_damage} />
        <StatBadge
          label="Crit Chance"
          value={`${((item.stats.crit_chance || 0) * 100).toFixed(0)}%`}
        />
        <StatBadge
          label="Crit Mult"
          value={`${(item.stats.crit_mult || 0).toFixed(1)}x`}
        />
        <StatBadge
          label="Status"
          value={`${((item.stats.status_chance || 0) * 100).toFixed(0)}%`}
        />
        {item.stats.fire_rate !== undefined && (
          <StatBadge label="Fire Rate" value={item.stats.fire_rate.toFixed(2)} />
        )}
        {item.stats.magazine_size !== undefined && (
          <StatBadge label="Magazine" value={item.stats.magazine_size} />
        )}
      </div>

    </div>
  );
};

export default WeaponDetailView;
