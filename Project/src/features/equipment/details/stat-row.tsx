import React from "react";
import classNames from "classnames";

interface StatRowProps {
  label: string;
  value: string | undefined;
  isOdd?: boolean;
  className?: string;
}

export const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  isOdd,
  className,
}) => {
  return (
    <div
      className={classNames(
        "flex justify-between items-center py-1.5 px-2 text-[11px]",
        isOdd ? "bg-white/3" : "bg-transparent",
        className,
      )}
    >
      <span className="text-white/40 uppercase tracking-wider">{label}</span>
      <span className="text-ui-primary font-mono">{value || "N/A"}</span>
    </div>
  );
};
