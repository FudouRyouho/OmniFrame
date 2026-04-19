import { Outlet } from "react-router";
import { EquipmentProvider } from "./context/EquipmentContext";
import EquipmentToolbar from "@shared/components/filters/EquipmentToolbar";

const EquipmentLayout = () => {
  return (
    <EquipmentProvider>
      <div className="h-full flex flex-col overflow-hidden">
        <EquipmentToolbar />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </EquipmentProvider>
  );
};

export default EquipmentLayout;
