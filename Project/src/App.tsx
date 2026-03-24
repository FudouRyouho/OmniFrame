import { Routes, Route, Navigate } from "react-router";
import WarframeDetail from "./pages/WarframeDetail";
import WeaponDetail from "./pages/WeaponDetail";
import AbilityStatsEditor from "./features/dev/ability-stats/AbilityStatsEditor";
import ModStatsEditor from "./features/dev/mod-stats/ModStatsEditor";
import TextFormatView from "./features/dev/text-format/TextFormatView";
import UIShowcase from "./features/dev/ui-showcase/UIShowcase";
import AbilitySchemaView from "./features/dev/ability-schema/AbilitySchemaView";
import DialogAppMenu from "./shared/components/navigation/DialogMenu";
import ItemsView from "./features/equipment/EquipmentView";
import Hud from "@features/hud/Hud";
import ModsView from "@features/mods/ModsView";
import EquipmentDev from "@features/dev/example/equipment.dev";
import WarframesViewDev from "@features/dev/example/view/WarframesView.dev";
import ModsViewDev from "@features/dev/example/view/ModsView.dev";
import ArcanesViewDev from "@features/dev/example/view/ArcanesView.dev";
import VehiclesViewDev from "@features/dev/example/view/VehiclesView.dev";
import CompanionsViewDev from "@features/dev/example/view/CompanionsView.dev";
import WeaponsViewDev from "@features/dev/example/view/WeaponsView.dev";
import ArchwingWeaponsViewDev from "@features/dev/example/view/ArchwingWeapons.dev";

export type AppRoute = {
  readonly path: string;
  readonly element: React.ReactNode;
  readonly label?: string;
};

// Solo rutas top-level — las rutas hijas de cada feature se definen en su propio layout
export const routes: readonly AppRoute[] = [
  { path: "/", element: <ItemsView />, label: "OmniFrame" },
  { path: "/equipament/mods", element: <ModsView />, label: "Mods" },
  { path: "/warframes/:name", element: <WarframeDetail /> },
  { path: "/weapons/:name", element: <WeaponDetail /> },
  { path: "/dev/ui-showcase", element: <UIShowcase />, label: "UI Showcase" },
  { path: "/dev/ability-stats", element: <AbilityStatsEditor />, label: "Editor" },
  { path: "/dev/mod-stats", element: <ModStatsEditor />, label: "Mod Editor" },
  { path: "/dev/text-format", element: <TextFormatView />, label: "Text Format" },
  { path: "/dev/ability-schema", element: <AbilitySchemaView />, label: "Ability Schema" },
  { path: "/dev/equipment-dev", element: <EquipmentDev />, label: "Equipment Dev" },
] as const;

export default function App() {
  return (
    <Hud>
      <DialogAppMenu />
      <Routes>
        {/* Rutas top-level */}
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Equipment Dev — layout route con rutas hijas */}
        <Route path="/dev/equipment-dev" element={<EquipmentDev />}>
          <Route index element={<Navigate to="warframes" replace />} />
          <Route path="warframes" element={<WarframesViewDev />} />
          <Route path="weapons" element={<WeaponsViewDev />} />
          <Route path="companions" element={<CompanionsViewDev />} />
          <Route path="mods" element={<ModsViewDev />} />
          <Route path="arcanes" element={<ArcanesViewDev />} />
          <Route path="vehicles" element={<VehiclesViewDev />} />
          <Route path="archwing-weapons" element={<ArchwingWeaponsViewDev />} />
        </Route>
      </Routes>
    </Hud>
  );
}
