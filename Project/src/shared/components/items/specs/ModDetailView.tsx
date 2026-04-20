import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { fetchMod } from "@lib/mod-data";
import type { Mod } from "@shared/types";

const ModDetailView = () => {
  const { uniqueName } = useParams<{ uniqueName: string }>();
  const location = useLocation();
  const [item, setItem] = useState<Mod | null>(null);
  const [loading, setLoading] = useState(true);
  const routeState = location.state as { uniqueName?: string } | null;

  useEffect(() => {
    const identifier =
      routeState?.uniqueName ?? decodeURIComponent(uniqueName ?? "");
    fetchMod(identifier).then((m) => {
      setItem(m ?? null);
      setLoading(false);
    });
  }, [routeState?.uniqueName, uniqueName]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!item)
    return (
      <div className="p-4">
        <p>Not found: {uniqueName}</p>
        <Link to="/equipment/mods">← Back</Link>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        to="/equipment/mods"
        className="text-sm opacity-40 hover:opacity-100 block mb-6"
      >
        ← Back
      </Link>
      <div className="flex gap-6 mb-6">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-24 h-24 object-contain shrink-0"
          />
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="text-sm opacity-60">{item.description}</p>
        </div>
      </div>
      {/* TODO: stats de mod, niveles, compatibilidad */}
    </div>
  );
};

export default ModDetailView;
