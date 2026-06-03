import React from "react";
import { cn } from "@/lib/utils";

interface FilterOption<T> {
  value: T;
  label: string;
  count?: number;
}

interface SortOption {
  value: string;
  label: string;
}

interface StandardPageFiltersProps<T extends string> {
  options: FilterOption<T>[];
  currentFilter: T;
  onFilterChange: (value: T) => void;
  className?: string;
  totalFilteredCount?: number;
  resultsLabel?: string;
  /** Optional sort dropdown */
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange?: (value: string) => void;
}

/**
 * Flat 2.0 Pill Filters for Portal Pages
 * Minimalist, border-over-shadow, sentence-case with counts.
 * Optionally includes a sort dropdown with a visual separator.
 */
export function StandardPageFilters<T extends string>({
  options,
  currentFilter,
  onFilterChange,
  className,
  totalFilteredCount,
  resultsLabel = "résultats",
  sortOptions,
  currentSort,
  onSortChange,
}: StandardPageFiltersProps<T>) {
  return (
    <div className={cn("flex items-center gap-2 mb-5 flex-wrap", className)}>
      {/* Filter pills */}
      <div className="flex items-center gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={cn(
              "text-[12px] px-3.5 py-1.5 rounded-full border-[0.5px] transition-all whitespace-nowrap cursor-pointer",
              currentFilter === opt.value
                ? "bg-[#0D2137] text-white border-[#0D2137] font-medium"
                : "bg-white text-[#4A7A94] border-[#E5E7EB] hover:bg-[#F0F2F4]",
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "ml-1 font-normal",
                  currentFilter === opt.value ? "opacity-60" : "opacity-60 text-[#8BAFC0]",
                )}
              >
                ({opt.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Separator + sort (optional) */}
      {sortOptions && sortOptions.length > 0 && (
        <>
          <div className="w-px h-5 bg-[#E5E7EB] mx-1 shrink-0" />
          <select
            value={currentSort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="text-[12px] px-3 py-1.5 rounded-full border-[0.5px] border-[#E5E7EB] bg-white text-[#4A7A94] cursor-pointer outline-none font-[inherit] appearance-none hover:bg-[#F0F2F4] transition-colors"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Count label at the right */}
      {totalFilteredCount !== undefined && (
        <span className="ml-auto text-[12px] text-[#8BAFC0]">
          {totalFilteredCount} {resultsLabel}
        </span>
      )}
    </div>
  );
}
