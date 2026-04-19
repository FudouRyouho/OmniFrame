import { Routes, Route, Navigate } from "react-router";

import DialogAppMenu from "./shared/components/navigation/DialogMenu";
import Hud from "src/domains/hud/Hud";
import EquipmentLayout from "src/domains/equipment/EquipmentLayout";
import WarframesView from "src/domains/equipment/view/WarframesView";
import WeaponsView from "src/domains/equipment/view/WeaponsView";
import CompanionsView from "src/domains/equipment/view/CompanionsView";
import ModsView from "src/domains/equipment/view/ModsView";
import ArcanesView from "src/domains/equipment/view/ArcanesView";
import VehiclesView from "src/domains/equipment/view/VehiclesView";
import ArchwingWeaponsView from "src/domains/equipment/view/ArchwingWeaponsView";
import OptionsView from "src/domains/options/OptionsView";
import ArsenalLayout from "src/domains/arsenal/ArsenalLayout";
import ArsenalView from "src/domains/arsenal/ArsenalView";
import ArsenalSwapView from "src/domains/arsenal/swap/ArsenalSwapView";
import ArchonShardSelectionView from "src/domains/arsenal/archon-shards/ArchonShardSelectionView";
import ProfileView from "src/domains/profile/ProfileView";
import WarframeDetailView from "@shared/components/items/specs/WarframeDetailView";
import WeaponDetailView from "@shared/components/items/specs/WeaponDetailView";
import CompanionDetailView from "@shared/components/items/specs/CompanionDetailView";
import ArchwingWeaponDetailView from "@shared/components/items/specs/ArchwingWeaponDetailView";
import ModDetailView from "@shared/components/items/specs/ModDetailView";
import ArcaneDetailView from "@shared/components/items/specs/ArcaneDetailView";
import VehicleDetailView from "@shared/components/items/specs/VehicleDetailView";

export type AppRoute = {
  readonly path: string;
  readonly element: React.ReactNode;
  readonly label?: string;
};

// Solo rutas top-level — las rutas hijas de equipment se definen como nested routes
// La ruta "/" redirige a equipment hasta que se cree una landing apropiada
// eslint-disable-next-line react-refresh/only-export-components
export const routes: readonly AppRoute[] = [] as const;

export default function App() {
  return (
    <Hud>
      <DialogAppMenu />
      <Routes>
        {/* Rutas top-level */}
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        <Route path="/arsenal" element={<ArsenalLayout />}>
          <Route index element={<ArsenalView />} />
          <Route path="swap/:category" element={<ArsenalSwapView />} />
          <Route path="archon-shards" element={<ArchonShardSelectionView />} />
        </Route>
        <Route path="/profile" element={<ProfileView />} />

        {/* Ruta raíz redirige a equipment hasta que exista una landing propia */}
        <Route
          path="/"
          element={<Navigate to="/equipment/warframes" replace />}
        />

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
          <Route
            path="warframes/:uniqueName"
            element={<WarframeDetailView />}
          />
          <Route path="weapons/:uniqueName" element={<WeaponDetailView />} />
          <Route
            path="companions/:uniqueName"
            element={<CompanionDetailView />}
          />
          <Route path="vehicles/:uniqueName" element={<VehicleDetailView />} />
          <Route
            path="archwing-weapons/:uniqueName"
            element={<ArchwingWeaponDetailView />}
          />
          <Route path="mods/:uniqueName" element={<ModDetailView />} />
          <Route path="arcanes/:uniqueName" element={<ArcaneDetailView />} />
        </Route>
      </Routes>
    </Hud>
  );
}
