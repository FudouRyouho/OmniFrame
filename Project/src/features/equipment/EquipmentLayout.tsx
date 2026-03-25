import { Outlet } from "react-router";
import EquipmentToolbar from "./toolbar/EquipmentToolbar";
import { EquipmentProvider } from "./context/EquipmentContext";

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
