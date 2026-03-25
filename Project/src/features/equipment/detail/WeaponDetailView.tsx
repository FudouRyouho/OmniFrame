import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { fetchWeapon } from "@lib/weaponData";
import type { Weapon } from "@lib/types";

/**
 * Placeholder — vista de detalle de Weapon bajo /equipment/weapons/:uniqueName.
 * Reemplazará a pages/WeaponDetail.tsx cuando el builder esté integrado.
 */
const WeaponDetailView = () => {
    const { uniqueName } = useParams<{ uniqueName: string }>();
    const [item, setItem] = useState<Weapon | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeapon(decodeURIComponent(uniqueName ?? "")).then(w => {
            setItem(w ?? null);
            setLoading(false);
        });
    }, [uniqueName]);

    if (loading) return <p className="p-4">Loading...</p>;
    if (!item) return (
        <div className="p-4">
            <p>Not found: {uniqueName}</p>
            <Link to="/equipment/weapons">← Back</Link>
        </div>
    );

    return (
        <div className="p-4">
            <Link to="/equipment/weapons" className="text-sm opacity-40 hover:opacity-100 block mb-4">← Back</Link>
            <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
            <p className="text-sm opacity-60">{item.description}</p>
            {/* TODO: panel de detalle completo — placeholder hasta integración con builder */}
        </div>
    );
};

export default WeaponDetailView;
