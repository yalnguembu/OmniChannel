import { useState } from "react";
import type { DateRange } from "@/components/ui/DateRangePicker";

/**
 * Shared list-filter state for the product sub-list pages (templates, campaigns,
 * channels, connectors). Holds search + date range + status + an "advanced"
 * record (entity-specific fields incl. sortBy/sortDirection/pageSize/ids) and
 * resets pagination whenever a filter changes. Each ViewModel maps this state
 * onto its own Search*Request body.
 */
export function useListFilters(advancedDefaults: Record<string, string>) {
  const [search, setSearchRaw] = useState("");
  const [dateRange, setDateRangeRaw] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [status, setStatusRaw] = useState("all");
  const [page, setPage] = useState(1);
  const [advanced, setAdvanced] = useState<Record<string, string>>(
    advancedDefaults,
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const setSearch = (v: string) => {
    setSearchRaw(v);
    setPage(1);
  };
  const setDateRange = (r: DateRange) => {
    setDateRangeRaw(r);
    setPage(1);
  };
  const setStatus = (v: string) => {
    setStatusRaw(v);
    setPage(1);
  };
  const applyAdvanced = (a: Record<string, string>) => {
    setAdvanced(a);
    setPage(1);
  };

  /** Common Search*Request fields derived from the current filter state. */
  const commonBody = () => {
    const pageSize = parseInt(advanced.pageSize ?? "15", 10) || 15;
    return {
      pageNumber: page,
      pageSize,
      searchTerm: search.trim() || undefined,
      createdFrom: dateRange.start ? dateRange.start.toISOString() : undefined,
      createdTo: dateRange.end ? dateRange.end.toISOString() : undefined,
      status: status !== "all" ? status : undefined,
      sortBy: advanced.sortBy || undefined,
      sortDirection: advanced.sortDirection || undefined,
      ids: advanced.ids?.trim()
        ? advanced.ids.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    };
  };

  return {
    search,
    setSearch,
    dateRange,
    setDateRange,
    status,
    setStatus,
    page,
    setPage,
    pageSize: parseInt(advanced.pageSize ?? "15", 10) || 15,
    advanced,
    advancedDefaults,
    applyAdvanced,
    isFilterModalOpen,
    setIsFilterModalOpen,
    commonBody,
  };
}
