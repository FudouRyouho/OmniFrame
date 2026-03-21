import { NavLink } from "react-router";
import { useTheme } from "../../providers/Theme/theme-context";

function Nav() {
  const { themeColor, changeThemeColor } = useTheme();

  const base =
    "px-4 py-2 typography-1 transition-all duration-300 relative group";
  const active = "text-ui-accent border-b-2 border-ui-accent bg-ui-accent/5";
  const inactive =
    "text-white/40 hover:text-ui-primary border-b-2 border-transparent hover:bg-white/[0.02]";

  const themes = ["orokin", "corpus", "grineer", "infested", "narmer"] as const;

  return (
    <nav className="flex items-center justify-between px-8 border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-50 h-14">
      <div className="flex items-center gap-2">
        <div className="dot-rotated !w-2 !h-2 border-ui-accent bg-ui-accent shadow-[0_0_8px_var(--ui-accent)]" />
        <span className="typography-3 text-white font-bold tracking-[0.2em] mr-8">
          OMNIFRAME
        </span>

        <div className="flex items-center gap-1 h-full">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            TENNO_ARCHIVE
          </NavLink>
          <NavLink
            to="/weapons"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            CODEN_WEAPONS
          </NavLink>
          <NavLink
            to="/dev/ui-showcase"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            UI_DEBUG
          </NavLink>
          <NavLink
            to="/dev/ability-stats"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            DATA_EDITOR
          </NavLink>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Selector (Quick) */}
        <div className="flex gap-1.5 p-1.5 bg-black/40 rounded border border-white/5">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => changeThemeColor(t)}
              className={`w-4 h-4 rounded-full border transition-all ${themeColor === t ? "border-white scale-110 shadow-[0_0_5px_white]" : "border-white/10 opacity-30 hover:opacity-100 hover:scale-110"}`}
              style={{
                backgroundColor:
                  t === "orokin"
                    ? "#ffd10b"
                    : t === "grineer"
                      ? "#c2410c"
                      : t === "corpus"
                        ? "#3b82f6"
                        : t === "infested"
                          ? "#22c55e"
                          : "#ef4444",
              }}
              title={t.toUpperCase()}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
