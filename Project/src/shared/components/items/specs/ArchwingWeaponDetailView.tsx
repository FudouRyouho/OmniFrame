import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { Registry } from "@shared/data/DataRegistry";
import type { ArchwingWeapon } from "@shared/types";

/**
 * Placeholder — vista de detalle de ArchwingWeapon bajo /equipment/archwing-weapons/:uniqueName.
 */
const ArchwingWeaponDetailView = () => {
  const { uniqueName } = useParams<{ uniqueName: string }>();
  const location = useLocation();
  const [item, setItem] = useState<ArchwingWeapon | null>(null);
  const [loading, setLoading] = useState(true);
  const routeState = location.state as { uniqueName?: string } | null;

  useEffect(() => {
    const identifier =
      routeState?.uniqueName ?? decodeURIComponent(uniqueName ?? "");
    Registry.getItemById<ArchwingWeapon>("archwing-weapon", identifier).then((w) => {
      setItem(w ?? null);
      setLoading(false);
    });
  }, [routeState?.uniqueName, uniqueName]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!item)
    return (
      <div className="p-4">
        <p>Not found: {uniqueName}</p>
        <Link to="/equipment/archwing-weapons">← Back</Link>
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
      <p className="text-sm opacity-60">{item.description}</p>
      {/* Panel de detalle completo — Pendiente de integración con [R-02] */}
    </div>
  );
};

export default ArchwingWeaponDetailView;
