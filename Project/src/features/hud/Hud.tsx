import type { ReactNode } from "react"
import HudHeader from "./HudHeader"
import HubFooter from "./footer/HubFooter"

const Hud = ({ children }: { children: ReactNode }) => {
    return (
        <div className="h-screen overflow-hidden text-ui-secondary flex flex-col">
            <HudHeader/>
            <main className="flex-1 overflow-hidden">{children}</main>
            <HubFooter />
        </div>
    )
}

export default Hud