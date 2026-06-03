import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailCardProps {
  title: string;
  /** Optional element rendered on the right of the header (e.g. a "Configurer →" link). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Shared card chrome used across the product detail tabs
 * (overview / stats / settings). Keeps the white rounded panel
 * + bordered header consistent in one place.
 */
export function DetailCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: DetailCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E5E7EB] rounded-[14px]",
        className,
      )}
    >
      <div className="px-4.5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#0D2137]">{title}</span>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
