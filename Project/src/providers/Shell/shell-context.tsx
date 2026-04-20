/**
 * @domain Integration / Providers / Shell
 * @SSoT docs/domains/integration/runtime-composition.md
 * @status activo
 */
import { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShellZone =
  | "equipment"
  | "arsenal"
  | "profile"
  | "options"
  | "dev"
  | "home";

export type FooterKind = "none" | "item-details" | "arsenal";

export type ShellContextValue = {
  zone: ShellZone;
  /** Sub-vista dentro de la zona. Ej: "warframes", "primary". Null fuera de /equipment. */
  view: string | null;
  /** True cuando la ruta tiene 3 segmentos bajo /equipment/<view>/<entity>. */
  isDetail: boolean;
  /** Tercer segmento decodificado. Ej: "Boltor Prime". */
  entityId: string | null;
  footerKind: FooterKind;
  pageTitle: string;
};

// ---------------------------------------------------------------------------
// Pure resolver — sin hooks, testeable en aislamiento
// ---------------------------------------------------------------------------

function getPageTitle(
  zone: ShellZone,
  view: string | null,
  isDetail: boolean,
  entityId: string | null,
  rawPathname: string,
): string {
  switch (zone) {
    case "equipment":
      if (isDetail && entityId) return `ITEM DETAILS / ${entityId.toUpperCase()}`;
      if (view) return view.replace(/-/g, " ").toUpperCase();
      return "EQUIPMENT";
    case "arsenal":
      if (view === "archon-shards") return "ARCHON SHARDS";
      if (view === "swap" && entityId) return `SWAP / ${entityId.replace(/-/g, " ").toUpperCase()}`;
      if (view === "swap") return "SWAP";
      return "ARSENAL";
    case "profile":
      return "PROFILE";
    case "options":
      return "OPTIONS";
    case "dev": {
      const section = rawPathname.replace(/^\/dev\/?/, "").replace(/-/g, " ").trim();
      return section ? `DEV / ${section.toUpperCase()}` : "DEV";
    }
    default:
      return "OMNIFRAME";
  }
}

export function resolveShell(pathname: string): ShellContextValue {
  const segments = pathname.split("/").filter(Boolean);
  const [first, second, third] = segments;

  let zone: ShellZone = "home";
  let view: string | null = null;
  let isDetail = false;
  let entityId: string | null = null;
  let footerKind: FooterKind = "none";

  if (first === "equipment") {
    zone = "equipment";
    view = second ?? null;
    isDetail = segments.length === 3;
    entityId = isDetail && third ? decodeURIComponent(third) : null;
    footerKind = isDetail ? "item-details" : "none";
  } else if (first === "arsenal") {
    zone = "arsenal";
    view = second ?? null;
    entityId = third ? decodeURIComponent(third) : null;
    footerKind = "arsenal";
  } else if (first === "profile") {
    zone = "profile";
  } else if (first === "options") {
    zone = "options";
  } else if (first === "dev") {
    zone = "dev";
  }

  const pageTitle = getPageTitle(zone, view, isDetail, entityId, pathname);

  return { zone, view, isDetail, entityId, footerKind, pageTitle };
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const ShellContext = createContext<ShellContextValue | null>(null);

export const ShellProvider = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();

  const value = useMemo(() => resolveShell(pathname), [pathname]);

  return (
    <ShellContext.Provider value={value}>
      {children}
    </ShellContext.Provider>
  );
};

export const useShell = (): ShellContextValue => {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return ctx;
};
