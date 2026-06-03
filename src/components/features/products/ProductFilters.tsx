import React from "react";
import { cn, statusLabel } from "@/lib/utils";

type FilterType = "all" | "active" | "paused" | "draft";

interface ProductFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
  filteredCount: number;
}

export function ProductFilters({
  currentFilter,
  onFilterChange,
  counts,
  filteredCount,
}: ProductFiltersProps) {
  const filters: FilterType[] = ["all", "active", "paused", "draft"];

  return (
    <div className="flex items-center gap-1.5 mb-5 flex-wrap">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={cn(
            "text-[12.5px] px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap",
            currentFilter === f
              ? "bg-[#0D2137] text-white border-[#0D2137] font-medium"
              : "bg-white text-[#4A7A94] border-[#E5E7EB] hover:bg-[#F0F2F4]",
          )}
        >
          {f === "all" ? "Tous" : statusLabel(f)}{" "}
          <span className="opacity-55 text-[11px]">({counts[f]})</span>
        </button>
      ))}
      <span className="ml-auto text-[12px] text-[#8BAFC0]">
        {filteredCount} produit{filteredCount > 1 ? "s" : ""}
      </span>
    </div>
  );
}
