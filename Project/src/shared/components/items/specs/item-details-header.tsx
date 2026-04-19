import classNames from "classnames";
import React from "react";
import { IconTag } from "@lib/presentation/icons/IconTag";

interface ItemDetailsHeaderProps {
  name: string;
  selectedIndex?: number;
  totalAttacks?: number;
}

export const ItemDetailsHeader: React.FC<ItemDetailsHeaderProps> = ({
  name,
  selectedIndex = 0,
  totalAttacks = 0,
}) => {
  const showPagination = totalAttacks > 1;

  return (
    <div className="flex items-center justify-between text-ui-accent text-[11px] font-bold bg-black/90 w-full p-2.5 border-b border-ui-primary/20">
      <div className="truncate pr-4 tracking-widest">{name.toUpperCase()}</div>

      {showPagination && (
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex gap-1.5">
            {Array.from({ length: totalAttacks }).map((_, i) => (
              <div
                key={i}
                className={classNames(
                  "w-1.5 h-1.5 rotate-45 border border-ui-accent/50 transition-all duration-300",
                  i === selectedIndex
                    ? "bg-ui-accent shadow-[0_0_8px_var(--ui-accent)]"
                    : "bg-transparent opacity-30",
                )}
              />
            ))}
          </div>
          <div className="border border-ui-accent/30 px-1.5 py-0.5 rounded-[1px] text-[8px] leading-none opacity-60 font-mono bg-ui-accent/5">
            TAB
          </div>
        </div>
      )}
    </div>
  );
};

interface ItemDetailsFooterProps {
  tags?: string[];
}

export const ItemDetailsFooter: React.FC<ItemDetailsFooterProps> = ({
  tags = [],
}) => {
  if (tags.length === 0) return null;
  return (
    <div className="bg-black/90 w-full p-2 border-t border-white/5">
      <div className="flex flex-wrap gap-3">
        {tags.map((tag: string) => (
          <IconTag
            key={tag}
            value={tag}
            className="inline-flex items-center gap-1.5"
            labelClassName="-1 text-ui-secondary text-[9px]"
          />
        ))}
      </div>
    </div>
  );
};
