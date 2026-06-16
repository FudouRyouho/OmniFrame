/**
 * @domain Engine / Shell
 * @SSoT docs/domains/ui-ux/shell-principles.md
 */
import { Routes, Route, Navigate } from "react-router";

import DialogAppMenu from "./shared/components/navigation/DialogMenu";
import Hud from "@domains/hud/Hud";
import EquipmentLayout from "@domains/equipment/EquipmentLayout";
import OptionsView from "@domains/options/OptionsView";
import ArsenalLayout from "@domains/arsenal/ArsenalLayout";
import ArsenalView from "@domains/arsenal/ArsenalView";
import ArsenalSwapView from "@domains/arsenal/swap/ArsenalSwapView";
import ArchonShardSelectionView from "@domains/arsenal/archon-shards/ArchonShardSelectionView";
import IncarnorEvolutionSelector from "@domains/arsenal/incarnon/IncarnorEvolutionSelector";
import UpgradeView from "@domains/arsenal/view/UpgradeView";
import ProfileView from "@domains/profile/ProfileView";
import WarframeDetailView from "@shared/components/items/specs/WarframeDetailView";
import WeaponDetailView from "@shared/components/items/specs/WeaponDetailView";
import CompanionDetailView from "@shared/components/items/specs/CompanionDetailView";
import ArchwingWeaponDetailView from "@shared/components/items/specs/ArchwingWeaponDetailView";
import ModDetailView from "@shared/components/items/specs/ModDetailView";
import ArcaneDetailView from "@shared/components/items/specs/ArcaneDetailView";
import VehicleDetailView from "@shared/components/items/specs/VehicleDetailView";
import OmniView from "@shared/components/items/views/OmniView";
import { toRouteSlug } from "@lib/route-id";
import ModTestPage from "./dev/ModTestPage";

import { useNavigate, useParams } from "react-router";

const EquipmentBrowser = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  return (
    <OmniView
      basePath="/equipment"
      onClick={(item: any) => {
        navigate(`/equipment/${category}/${toRouteSlug(item.name)}`, {
          state: { uniqueName: item.unique_name },
        });
      }}
    />
  );
};

export default function App() {
  return (
    <Hud>
      <DialogAppMenu />
      <Routes>
        <Route path="/dev/mod-test" element={<ModTestPage />} />

        <Route path="/arsenal" element={<ArsenalLayout />}>
          <Route index element={<ArsenalView />} />
          <Route path="swap/:category" element={<ArsenalSwapView />} />
          <Route path="upgrade/:category" element={<UpgradeView />} />
          <Route path="archon-shards" element={<ArchonShardSelectionView />} />
          <Route path="incarnon/:category" element={<IncarnorEvolutionSelector />} />
        </Route>
        <Route path="/profile" element={<ProfileView />} />

        {/* Ruta raíz redirige a equipment hasta que exista una landing propia */}
        <Route
          path="/"
          element={<Navigate to="/equipment/warframes" replace />}
        />

        {/* Options */}
        <Route path="/options" element={<OptionsView />} />
        {/* Equipment */}
        <Route path="/equipment" element={<EquipmentLayout />}>
          <Route index element={<Navigate to="warframes" replace />} />
          <Route path=":category" element={<EquipmentBrowser />} />
          {/* Rutas de detalle... */}
          {/* Rutas de detalle */}
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
