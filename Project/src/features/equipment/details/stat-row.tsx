import React from "react";
import classNames from "classnames";

interface StatRowProps {
  label: string;
  value: string | number | undefined;
  isOdd?: boolean;
  striped?: boolean;
  valueTone?: "default" | "accent";
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
}

export const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  isOdd,
  striped = true,
  valueTone = "default",
  labelClassName,
  valueClassName,
  className,
}) => {
  const displayValue = value ?? "N/A";

  return (
    <div
      className={classNames(
        "flex justify-between items-center py-1.5 px-2 text-[11px]",
        striped && isOdd ? "bg-white/3" : "bg-transparent",
        className,
      )}
    >
      <span
        className={classNames(
          "text-white/40 uppercase tracking-wider",
          labelClassName,
        )}
      >
        {label}
      </span>
      <span
        className={classNames(
          "font-mono",
          valueTone === "accent" ? "text-ui-accent" : "text-ui-primary",
          valueClassName,
        )}
      >
        {displayValue}
      </span>
    </div>
  );
};
