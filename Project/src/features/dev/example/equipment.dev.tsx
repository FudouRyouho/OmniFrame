import { Outlet } from "react-router";
import EquipmentToolbar from "./component/Equipment.toolbar";
import { EquipmentProvider } from "./context/EquipmentContext";

const EquipmentDev = () => {
    return (
        <EquipmentProvider>
            <div>
                <EquipmentToolbar />
                <main>
                    <Outlet />
                </main>
            </div>
        </EquipmentProvider>
    );
};

export default EquipmentDev;
