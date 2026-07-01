import { levelColor, cn } from "@/lib/utils";

interface CircularGaugeProps {
  /** 0-100 */
  value: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularGauge({
  value,
  label,
  size = 64,
  strokeWidth = 6,
  className,
}: CircularGaugeProps) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  const color = levelColor(pct);

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[13px] font-semibold tabular-nums"
            style={{ color }}
          >
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[11px] text-[#8BAFC0] text-center max-w-[90px] leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}
