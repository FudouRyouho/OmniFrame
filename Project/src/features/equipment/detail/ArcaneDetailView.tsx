import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { fetchArcane } from "@lib/arcaneData";
import type { Arcane } from "@lib/types";

const ArcaneDetailView = () => {
    const { uniqueName } = useParams<{ uniqueName: string }>();
    const location = useLocation();
    const [item, setItem] = useState<Arcane | null>(null);
    const [loading, setLoading] = useState(true);
    const routeState = location.state as { uniqueName?: string } | null;

    useEffect(() => {
        const identifier = routeState?.uniqueName ?? decodeURIComponent(uniqueName ?? "");
        fetchArcane(identifier).then(a => {
            setItem(a ?? null);
            setLoading(false);
        });
    }, [routeState?.uniqueName, uniqueName]);

    if (loading) return <p className="p-4">Loading...</p>;
    if (!item) return (
        <div className="p-4">
            <p>Not found: {uniqueName}</p>
            <Link to="/equipment/arcanes">← Back</Link>
        </div>
    );

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <Link to="/equipment/arcanes" className="text-sm opacity-40 hover:opacity-100 block mb-6">← Back</Link>
            <div className="flex gap-6 mb-6">
                {item.image && (
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-contain shrink-0" />
                )}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">{item.name}</h1>
                    {item.levelStats.length > 0 && (
                        <p className="text-sm opacity-60">{item.levelStats[item.levelStats.length - 1].stats.join(" / ")}</p>
                    )}
                </div>
            </div>
            {/* TODO: stats de arcane, niveles */}
        </div>
    );
};

export default ArcaneDetailView;
