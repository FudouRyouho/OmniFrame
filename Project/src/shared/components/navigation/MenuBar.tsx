import { Link, useLocation } from "react-router";
import { routes, type AppRoute } from "../../../App";

function NavItem({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon?: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <li>
      <Link
        to={to}
        aria-current={active ? "page" : undefined}
        data-active={active ? true : false}
        className="button-square"
      >
        <span>{label}</span>
      </Link>
    </li>
  );
}

export default function MenuBar({ position }: { position: "left" | "right" | "top" | "bottom" }) {
  const orientation = position === "top" || position === "bottom" ? "flex-row" : "flex-col";
  const divider = orientation === "flex-row" ? "w-px h-6 bg-white/30" : "h-px w-full bg-white/30";
  
const navItems = routes.filter((r): r is AppRoute & { label: string } => Boolean(r.label));

  return (
    <nav role="navigation" aria-label="Principal" className={`bg-upper border-base ${orientation} flex gap-2 p-2 rounded-lg`}>
      <ul className={`flex ${orientation} gap-2`}>
        {navItems.map((item, idx) => (
          <div key={item.path}>
            <NavItem to={item.path} label={item.label!} />
            {idx < navItems.length - 1 ? <div className={divider} /> : null}
          </div>
        ))}
      </ul>
    </nav>
  );
}
