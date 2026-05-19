import React, { useEffect, useState } from "react";
import { useEnsemble } from "@providers/Ensemble/EnsembleProvider";
import type { EnsembleChannel } from "@providers/Ensemble/ensemble.types";
import { Registry } from "@shared/data/DataRegistry";
import BaseItemCard from "../items/cards/BaseItemCard";

interface ModSlotProps {
  channel: EnsembleChannel;
  index: number;
  className?: string;
  isAura?: boolean;
  isExilus?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * ModSlot — Representación visual de un slot de mod en el Arsenal.
 * Utiliza geometría SVG extraída del legado para mantener la fidelidad visual de Warframe.
 */
const ModSlot: React.FC<ModSlotProps> = ({
  channel,
  index,
  className,
  isAura,
  isExilus,
  isActive,
  onClick,
}) => {
  const intention = useEnsemble();
  const mod = intention.mods[channel]?.[index];

  const [hydratedMod, setHydratedMod] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    if (mod?.itemId) {
      const domain = index >= 200 ? "arcane" : "mod";
      Registry.getItemById(domain, mod.itemId).then((item) => {
        if (mounted && item) setHydratedMod(item);
      });
    } else {
      setHydratedMod(null);
    }
    return () => {
      mounted = false;
    };
  }, [mod?.itemId, index]);

  // Colores de borde basados en si tiene mod o no
  const strokeColor = isActive
    ? "var(--ui-accent)"
    : mod
      ? "rgba(var(--ui-accent-rgb), 0.8)"
      : "rgba(var(--ui-primary-rgb), 0.2)";

  const BORDER_PATH = `M 15 15 L 150 15 L 155 9 L 170 9 L 175 12 L 195 14 L 205 14 L 225 12 L 230 9 L 245 9 L 250 15 L 385 15 L 385 105 L 390 110 L 390 145 L 360 165 L 350 167 L 325 185 L 285 190 L 280 185 L 120 185 L 115 190 L 75 185 L 50 167 L 40 165 L 10 145 L 10 110 L 15 105 Z`;
  const POLARITY_PATH = `M 383 28 L 333 28 L 316 43 L 316 48 L 333 62 L 383 62 Z`;

  return (
    <div
      className={`relative group cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{ width: "140px", height: "180px" }}
      onClick={onClick}
    >
      {hydratedMod ? (
        /* --- RENDERIZADO POLIMORFICO (ESTUCHE LLENO) --- */
        <div className="w-full h-full absolute inset-0 z-10 pointer-events-auto">
          <BaseItemCard item={hydratedMod} onClick={onClick} />
        </div>
      ) : (
        /* --- RENDERIZADO SVG (ESTUCHE VACIO) --- */
        <>
          <svg
            viewBox="0 0 400 195"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full drop-shadow-md"
          >
            <defs>
              <linearGradient
                id={`grad-${channel}-${index}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.05} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0.15} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Fondo del Slot */}
            <path
              d={BORDER_PATH}
              fill={`url(#grad-${channel}-${index})`}
              className="text-ui-bg-elevated"
            />

            {/* Borde Principal */}
            <path
              d={BORDER_PATH}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              filter="none"
              className="transition-colors duration-300"
            />

            {/* Slot de Polaridad */}
            <path
              d={POLARITY_PATH}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeOpacity="0.4"
            />

            {/* Etiqueta de AURA si corresponde */}
            {isAura && (
              <text
                x="200"
                y="45"
                textAnchor="middle"
                className="fill-ui-accent text-[24px] font-bold uppercase tracking-widest opacity-60"
              >
                Aura
              </text>
            )}
            {isExilus && (
              <text
                x="200"
                y="45"
                textAnchor="middle"
                className="fill-ui-accent text-[24px] font-bold uppercase tracking-widest opacity-60"
              >
                Exilus
              </text>
            )}
          </svg>

          {/* Contenido Vacío (Overlay) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none">
            <div className="opacity-20 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-dashed border-ui-primary rounded-full mb-1" />
              <span className="text-[8px] uppercase tracking-widest">Empty</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModSlot;
