import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  trendLabel,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E5E7EB] rounded-md p-4",
        className,
      )}
    >
      <p className="text-[11px] font-medium text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
        {label}
      </p>
      <p className="text-[22px] font-semibold text-[#0D2137] leading-none tracking-tight">
        {value}
      </p>
      {trendLabel && (
        <div
          className={cn("flex items-center gap-1 text-[11px] mt-1", {
            "text-[#16A34A]": trend === "up",
            "text-[#DC2626]": trend === "down",
            "text-[#8BAFC0]": trend === "neutral" || !trend,
          })}
        >
          {trend === "up" && <TrendingUp size={10} />}
          {trend === "down" && <TrendingDown size={10} />}
          {trend === "neutral" && <Minus size={10} />}
          {trendLabel}
        </div>
      )}
    </div>
  );
}
