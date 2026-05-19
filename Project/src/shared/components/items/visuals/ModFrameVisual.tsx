import type { ModRarity } from "@shared/types";

interface ModFrameVisualProps {
  rarity: ModRarity | string;
  imageUrl?: string;
  name?: string;
  description?: string;
  cost?: number;
  polarity?: string;
  className?: string;
}

export default function ModFrameVisual({
  rarity,
  imageUrl,
  name = "Unknown Mod",
  description = "No description available.",
  cost = 0,
  polarity,
  className = "",
}: ModFrameVisualProps) {
  const getRarityConfig = (r: string) => {
    const map: Record<string, { prefix: string; color: string }> = {
      common: { prefix: "Bronze", color: "#c79989" },
      uncommon: { prefix: "Silver", color: "#bec0c2" },
      rare: { prefix: "Gold", color: "#fbecc4" },
      legendary: { prefix: "Legendary", color: "#dfdfdf" },
    };
    return map[r.toLowerCase()] || map.common;
  };

  const { prefix, color } = getRarityConfig(rarity);

  return (
    <div className={`group flex items-center justify-center relative w-[184px] h-[90px] z-[1] hover:z-[9999] transition-all duration-75 ${className}`}>
      <div className="flex w-[184px] h-[90px] scale-100 transition-all duration-150 justify-center pointer-events-none select-none group-hover:h-[260px] group-hover:scale-110">
        
        {/* Frame Layers (Top/Bottom) */}
        <div className="absolute left-0 w-[184px] z-10 bg-no-repeat bg-[length:184px_auto] bg-top top-[-10px] h-[50px]" style={{ backgroundImage: `url(/mod-frames/${prefix}FrameTop.png)` }} />
        <div className="absolute left-0 w-[184px] z-10 bg-no-repeat bg-[length:184px_auto] bg-top bottom-0 h-[80px]" style={{ backgroundImage: `url(/mod-frames/${prefix}FrameBottom.png)` }} />

        {/* Side Lights */}
        <div 
          className="absolute top-[24px] left-[2px] w-[8px] h-[182px] bg-no-repeat bg-contain opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20" 
          style={{ backgroundImage: `url(/mod-frames/${prefix}SideLight.png)`, transform: 'scaleX(-1)' }} 
        />
        <div 
          className="absolute top-[24px] right-[2px] w-[8px] h-[182px] bg-no-repeat bg-contain opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20" 
          style={{ backgroundImage: `url(/mod-frames/${prefix}SideLight.png)` }} 
        />

        {/* Content Container */}
        <div 
          className="bg-center bg-no-repeat bg-cover flex items-center w-full flex-col relative h-[calc(100%-20px)] group-hover:h-[calc(100%-18px)]" 
          style={{ backgroundImage: `url(/mod-frames/${prefix}Background.png)`, color }}
        >
          
          {/* Drain Tag (Diagonal Cut) */}
          <div className="absolute right-[4px] top-[8px] z-[30] flex items-center font-bold text-[12px] pr-1" style={{ color }}>
             <div 
              className="absolute inset-0 bg-black/60 -z-10" 
              style={{ 
                clipPath: 'polygon(6px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 6px)',
                borderTop: `1px solid ${color}`,
                borderRight: `1px solid ${color}`
              }} 
             />
             <span className="pl-2">{cost}</span>
             {polarity && <i className={`wfic wfic-${polarity} ml-0.5 text-[10px]`}></i>}
          </div>

          {/* Image */}
          <figure className="flex justify-center overflow-hidden flex-auto w-[calc(100%-10px)] mx-[5px] top-[3px] relative min-h-[70px] z-0 items-start group-hover:min-h-[20px]">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={name}
                loading="lazy"
                className="w-full grayscale-[0.8] brightness-[0.4] transition-all duration-150 max-h-[174px] group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110"
              />
            )}
          </figure>

          {/* Description */}
          <div 
            className="flex-auto leading-[1.1] pt-[2px] pb-[33px] relative text-center w-[159px] break-words group-hover:mb-[10px] group-hover:grow flex flex-col justify-center" 
            style={{ textShadow: "#000 1px 1px 0" }}
          >
            <p className="flex justify-center items-center relative text-center w-full text-[13px] transition-all duration-150 mx-auto font-bold group-hover:text-[16px] group-hover:mb-2 text-white drop-shadow-sm h-full group-hover:h-auto">
              {name}
            </p>
            <p className="text-[11px] leading-tight px-2 text-white/90 group-hover:block hidden">
              {description}
            </p>
          </div>

          {/* Item Compatibility */}
          <div className="absolute bottom-[35px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 w-full flex justify-center uppercase font-bold text-[11px]">
             <div className="absolute inset-0 h-[20px] bg-no-repeat bg-center" style={{ backgroundImage: `url(/mod-frames/${prefix}LowerTab.png)`, backgroundSize: '154px 20px' }} />
             <p className="relative z-10 top-[2px]">Warframe</p>
          </div>

          {/* Fusion Stars */}
          <div className="absolute bottom-[2px] flex justify-center w-full z-20 gap-0.5 text-[8px]">
             {[...Array(10)].map((_, i) => (
               <i key={i} className={i < 10 ? "text-cyan-400" : "text-gray-600"}>★</i>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
