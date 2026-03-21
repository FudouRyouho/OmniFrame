import { Routes, Route } from "react-router";
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

// Project/src/config/routes.ts

export type AppRoute = {
  readonly path: string;
  readonly element: React.ReactNode;
  readonly label?: string;
};

export const routes: readonly AppRoute[] = [
  { path: "/", element: <ItemsView />, label: "OmniFrame" },
  {path: "/equipament/mods", element: <ModsView/>, label:"Mods"},
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
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      </Hud>
  );
}
