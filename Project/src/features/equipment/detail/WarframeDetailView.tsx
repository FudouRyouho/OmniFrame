import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { fetchWarframe } from "@lib/warframeData";
import type { Warframe } from "@lib/types";

/**
 * Placeholder — vista de detalle de Warframe bajo /equipment/warframes/:uniqueName.
 * Reemplazará a pages/WarframeDetail.tsx cuando el builder esté integrado.
 */
const WarframeDetailView = () => {
    const { uniqueName } = useParams<{ uniqueName: string }>();
    const [item, setItem] = useState<Warframe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWarframe(decodeURIComponent(uniqueName ?? "")).then(w => {
            setItem(w ?? null);
            setLoading(false);
        });
    }, [uniqueName]);

    if (loading) return <p className="p-4">Loading...</p>;
    if (!item) return (
        <div className="p-4">
            <p>Not found: {uniqueName}</p>
            <Link to="/equipment/warframes">← Back</Link>
        </div>
    );

    return (
        <div className="p-4">
            <Link to="/equipment/warframes" className="text-sm opacity-40 hover:opacity-100 block mb-4">← Back</Link>
            <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
            <p className="text-sm opacity-60">{item.description}</p>
            {/* TODO: panel de detalle completo — placeholder hasta integración con builder */}
        </div>
    );
};

export default WarframeDetailView;
