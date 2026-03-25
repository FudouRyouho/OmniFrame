import { Routes, Route, Navigate } from "react-router";
import WarframeDetail from "./pages/WarframeDetail";
import WeaponDetail from "./pages/WeaponDetail";
import AbilityStatsEditor from "./features/dev/ability-stats/AbilityStatsEditor";
import ModStatsEditor from "./features/dev/mod-stats/ModStatsEditor";
import TextFormatView from "./features/dev/text-format/TextFormatView";
import UIShowcase from "./features/dev/ui-showcase/UIShowcase";
import AbilitySchemaView from "./features/dev/ability-schema/AbilitySchemaView";
import DialogAppMenu from "./shared/components/navigation/DialogMenu";
// EquipmentView.tsx existe en disco pero no se importa aquí — se mantiene para extracción manual de código útil (@deprecated)
import Hud from "@features/hud/Hud";
import EquipmentLayout from "@features/equipment/EquipmentLayout";
import WarframesView from "@features/equipment/view/WarframesView";
import WeaponsView from "@features/equipment/view/WeaponsView";
import CompanionsView from "@features/equipment/view/CompanionsView";
import ModsView from "@features/equipment/view/ModsView";
import ArcanesView from "@features/equipment/view/ArcanesView";
import VehiclesView from "@features/equipment/view/VehiclesView";
import ArchwingWeaponsView from "@features/equipment/view/ArchwingWeaponsView";
import WarframeDetailView from "@features/equipment/detail/WarframeDetailView";
import WeaponDetailView from "@features/equipment/detail/WeaponDetailView";
import CompanionDetailView from "@features/equipment/detail/CompanionDetailView";
import VehicleDetailView from "@features/equipment/detail/VehicleDetailView";
import ArchwingWeaponDetailView from "@features/equipment/detail/ArchwingWeaponDetailView";
import OptionsView from "@features/options/OptionsView";

export type AppRoute = {
  readonly path: string;
  readonly element: React.ReactNode;
  readonly label?: string;
};

// Solo rutas top-level — las rutas hijas de equipment se definen como nested routes
// La ruta "/" redirige a equipment hasta que se cree una landing apropiada
export const routes: readonly AppRoute[] = [
  { path: "/warframes/:name", element: <WarframeDetail /> },
  { path: "/weapons/:name", element: <WeaponDetail /> },
  { path: "/dev/ui-showcase", element: <UIShowcase />, label: "UI Showcase" },
  { path: "/dev/ability-stats", element: <AbilityStatsEditor />, label: "Editor" },
  { path: "/dev/mod-stats", element: <ModStatsEditor />, label: "Mod Editor" },
  { path: "/dev/text-format", element: <TextFormatView />, label: "Text Format" },
  { path: "/dev/ability-schema", element: <AbilitySchemaView />, label: "Ability Schema" },
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

        {/* Ruta raíz redirige a equipment hasta que exista una landing propia */}
        <Route path="/" element={<Navigate to="/equipment/warframes" replace />} />

        {/* Options — configuración de la aplicación */}
        <Route path="/options" element={<OptionsView />} />

        {/* Equipment — layout route con rutas hijas */}
        <Route path="/equipment" element={<EquipmentLayout />}>
          <Route index element={<Navigate to="warframes" replace />} />
          <Route path="warframes" element={<WarframesView />} />
          <Route path="weapons" element={<WeaponsView />} />
          <Route path="companions" element={<CompanionsView />} />
          <Route path="mods" element={<ModsView />} />
          <Route path="arcanes" element={<ArcanesView />} />
          <Route path="vehicles" element={<VehiclesView />} />
          <Route path="archwing-weapons" element={<ArchwingWeaponsView />} />
          {/* Rutas de detalle — placeholder hasta integración con builder */}
          <Route path="warframes/:uniqueName" element={<WarframeDetailView />} />
          <Route path="weapons/:uniqueName" element={<WeaponDetailView />} />
          <Route path="companions/:uniqueName" element={<CompanionDetailView />} />
          <Route path="vehicles/:uniqueName" element={<VehicleDetailView />} />
          <Route path="archwing-weapons/:uniqueName" element={<ArchwingWeaponDetailView />} />
        </Route>
      </Routes>
    </Hud>
  );
}
