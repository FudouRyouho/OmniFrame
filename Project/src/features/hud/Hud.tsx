import type { ReactNode } from "react"
import HudHeader from "./HudHeader"

const Hud = ({ children }: { children: ReactNode }) => {
    return (
        <div className="h-screen text-ui-secondary flex flex-col">
            <HudHeader/>
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    )
}

export default Hud