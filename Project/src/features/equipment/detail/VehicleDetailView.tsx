import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { fetchVehicle } from "@lib/vehicleData";
import type { Vehicle } from "@lib/types";

/**
 * Placeholder — vista de detalle de Vehicle (Necramech / Archwing) bajo /equipment/vehicles/:uniqueName.
 */
const VehicleDetailView = () => {
    const { uniqueName } = useParams<{ uniqueName: string }>();
    const location = useLocation();
    const [item, setItem] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const routeState = location.state as { uniqueName?: string } | null;

    useEffect(() => {
        const identifier = routeState?.uniqueName ?? decodeURIComponent(uniqueName ?? "");
        fetchVehicle(identifier).then(v => {
            setItem(v ?? null);
            setLoading(false);
        });
    }, [routeState?.uniqueName, uniqueName]);

    if (loading) return <p className="p-4">Loading...</p>;
    if (!item) return (
        <div className="p-4">
            <p>Not found: {uniqueName}</p>
            <Link to="/equipment/vehicles">← Back</Link>
        </div>
    );

    return (
        <div className="p-4">
            <Link to="/equipment/vehicles" className="text-sm opacity-40 hover:opacity-100 block mb-4">← Back</Link>
            <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
            <p className="text-sm opacity-60">{item.description}</p>
            {/* TODO: panel de detalle completo — placeholder hasta integración con builder */}
        </div>
    );
};

export default VehicleDetailView;
