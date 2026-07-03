import React, { useMemo } from "react";
import ModCard from "@shared/components/items/cards/ModCard";
import { useItems } from "@shared/hooks/data/use-items";
import type { Mod } from "@shared/types";

const ModTestPage: React.FC = () => {
  const { data, isLoading } = useItems("mod");

  // Filtramos el dataset para obtener un representante de cada rareza y clase especial
  const displayMods = useMemo(() => {
    if (isLoading || !data.length) return [];

    const mods = data as Mod[];
    const common = mods.find((m) => m.rarity?.toLowerCase() === "common" && !m.mod_class);
    const uncommon = mods.find((m) => m.rarity?.toLowerCase() === "uncommon" && !m.mod_class);
    const rare = mods.find((m) => m.rarity?.toLowerCase() === "rare" && !m.mod_class);
    const legendary = mods.find(
      (m) =>
        m.rarity?.toLowerCase() === "legendary" &&
        !m.mod_class &&
        !m.name?.startsWith("Primed"),
    );

    // Primed (legendary, sin clase especial → usa frame Legendary)
    const primed = mods.find(
      (m) => m.name?.startsWith("Primed") && !m.mod_class,
    );

    // Buscamos mods de clases especiales
    const amalgam = mods.find((m) => m.mod_class === "Amalgam");
    const galvanized = mods.find((m) => m.mod_class === "Galvanized");
    const archon = mods.find((m) => m.mod_class === "Archon");

    // Tektolyst Artifacts (Focus Schools)
    const focusSchools = ["Madurai", "Zenurik", "Vazarin", "Naramon", "Unairu"];
    const focusMods = mods.filter((m) => focusSchools.includes(m.mod_class || ""));
    const focusCommon = focusMods.find((m) => m.rarity === "Common");
    const focusUncommon = focusMods.find((m) => m.rarity === "Uncommon");
    const focusRare = focusMods.find((m) => m.rarity === "Rare");

    // Inyectamos un Mock Riven para pruebas de CSS
    const rivenMock: Mod = {
      id: "mock-riven-soma",
      unique_name: "MockRivenSoma",
      name: "Soma Crita-cronican",
      domain: "mod",
      kind: "mod",
      rarity: "Riven",
      image:
        "https://n9e5v4d8.ssl.hwcdn.net/uploads/e4505315f3e9e36886e08283a0a382c7.png", // Icono genérico de Riven
      image_name: "mock-riven-soma",
      category: "Mods",
      category_raw: "Mods",
      type: "Rifle Mod",
      mastery_req: 16,
      polarities: ["madurai"],
      tags: ["riven"],
      description: "",
      stats: {
        base_drain: 10,
        rank: 8,
        upgrade_types: [
          "WEAPON_CRIT_CHANCE",
          "WEAPON_FIRE_RATE",
          "WEAPON_MULTISHOT",
        ],
        level_stats: [
          {
            stats: [
              "+150.5% Critical Chance",
              "+90.2% Fire Rate (x2 for Bows)",
              "+120.4% Multishot",
              "-45.1% Puncture Damage",
            ],
          },
        ],
      },
      mod_class: "Riven",
      incompatible: [],
      incompatibility_tags: [],
    };

    // Devolvemos la colección completa para testeo visual
    return [
      common,
      uncommon,
      rare,
      legendary,
      primed,
      amalgam,
      galvanized,
      archon,
      focusCommon,
      focusUncommon,
      focusRare,
      rivenMock,
    ].filter(Boolean) as Mod[];
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ui-accent animate-pulse uppercase tracking-[0.2em] font-bold">
          Cargando Dataset de Mods...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll p-20 flex flex-col gap-12 items-center">
      <div className="text-center space-y-2">
        <h1 className="text-white text-2xl font-bold uppercase tracking-tighter">
          Mod Gallery (Real Data)
        </h1>
        <p className="text-ui-primary/60 text-sm">
          Visualización basada en el dataset oficial del proyecto
        </p>
      </div>

      <div className="flex flex-wrap gap-14 justify-center items-start">
        {displayMods.map((mod) => (
          <div
            key={mod.unique_name}
            className="flex flex-col items-center gap-6"
          >
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded flex flex-col items-center">
              <span className="text-[10px] uppercase font-black text-ui-primary tracking-[0.15em]">
                {mod.rarity}
              </span>
              <span className="text-[9px] text-white/20 font-mono">
                {mod.unique_name.split("/").pop()}
              </span>
            </div>
            <ModCard item={mod} />
            <ModCard item={mod} isExtended={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModTestPage;
