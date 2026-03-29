import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useMenu } from "@providers/Menu/menu-context";
import { Link, useLocation } from "react-router";
import { routes, type AppRoute } from "../../../App";

export default function DialogAppMenu() {
    const { isOpen, close } = useMenu();
    const { pathname } = useLocation();
    const [isDevOpen, setIsDevOpen] = useState(false);
    const previousPathRef = useRef(pathname);

    // Headless UI intercepta ESC con capture:true cuando este dialog esta abierto,
    // llamando onClose. El listener del MenuProvider solo corre cuando no hay
    // ningun dialog de Headless UI activo, por lo que open() se llama correctamente.

    const SHAPE = "polygon(0 5%, 100% 15%, 100% 75%, 0 99%)";
    const SHAPEGLOW = "polygon(0 4%, 100% 14%, 100% 76%, 0 100%)";

    const mainLinks = useMemo(
        () => [
            { to: "/arsenal", label: "Arsenal" },
            { to: "/equipment/warframes", label: "Equipment" },
            { to: "/profile", label: "Profile" },
            { to: "/options", label: "Options" },
        ],
        [],
    );

    const devLinks = useMemo(
        () =>
            routes
                .filter(
                    (r): r is AppRoute & { label: string } =>
                        Boolean(r.label) && r.path.startsWith("/dev/"),
                )
                .map((r) => ({ to: r.path, label: r.label })),
        [],
    );

    const isPathActive = (to: string) => {
        if (to === "/equipment/warframes") {
            return pathname.startsWith("/equipment");
        }
        return pathname === to || pathname.startsWith(`${to}/`);
    };

    useEffect(() => {
        const pathChanged = previousPathRef.current !== pathname;

        if (isOpen && pathChanged) {
            close();
        }

        previousPathRef.current = pathname;
    }, [pathname, isOpen, close]);

    function MenuLink({
        to,
        label,
    }: {
        to: string;
        label: string;
    }) {
        const active = isPathActive(to);

        return (
            <Link to={to} onClick={close} aria-current={active ? "page" : undefined}
                data-active={active ? true : false} className={`font-black italic tracking-tighter uppercase transition-all group ${active ? 'text-ui-accent text-4xl' : 'text-ui-secondary text-3xl hover:text-ui-primary'}`}>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-3">
                    {label}
                </span>
            </Link>)
    };

    return (
        <Dialog open={isOpen} onClose={close} className="relative z-50">
            {/* Fondo oscuro general */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md pointer-events-none" aria-hidden="true" />

            <div className="fixed inset-0 overflow-hidden">
                <DialogPanel className="relative h-full w-full">

                    {/* Capa de borde brillante (Glow) */}
                    <div
                        className="absolute inset-0 bg-black/20 blur-3xl"
                        style={{ clipPath: SHAPEGLOW }}
                    />

                    {/* Fondo Principal del Menú */}
                    <div
                        className="absolute inset-0 bg-black/40 blur-md"
                        style={{ clipPath: SHAPE }}
                    >
                    </div>

                    {/* Contenedor de items */}
                    <div className="relative h-full flex flex-col justify-center pl-16 md:pl-28">
                        <div className="flex flex-col space-y-4 items-start">
                            {mainLinks.slice(0, 3).map((item) => (
                                <div key={item.to}>
                                    <MenuLink to={item.to} label={item.label} />
                                </div>
                            ))}

                            <div>
                                <button
                                    type="button"
                                    onClick={() => setIsDevOpen((prev) => !prev)}
                                    className={`font-black italic tracking-tighter uppercase transition-all group ${isDevOpen || pathname.startsWith('/dev/') ? 'text-ui-accent text-4xl' : 'text-ui-secondary text-3xl hover:text-ui-primary'}`}
                                >
                                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-3">
                                        Dev
                                    </span>
                                </button>
                                {isDevOpen && (
                                    <div className="mt-2 ml-4 flex flex-col gap-1 border-l border-ui-primary/30 pl-3">
                                        {devLinks.map((item) => (
                                            <MenuLink key={item.to} to={item.to} label={item.label} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <MenuLink to={mainLinks[3].to} label={mainLinks[3].label} />
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
