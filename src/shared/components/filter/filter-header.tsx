import React, { useState } from "react"
import { Badge, Download, Filter as FilterIcon, Grid3X3, List, MoreVertical, SearchIcon, Search, Upload, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Input } from "../ui/input"
import { useTranslation } from "react-i18next"

interface FilterHeaderProps {
  hasValues: boolean
  onReset: () => void
  onClear: () => void
  isLoading?: boolean
  showClearButton?: boolean
  title?: string
  viewMode: "list" | "grid"
  setViewMode: (mode: "list" | "grid") => void
  refreshData: () => void
  hasSelection: boolean
  selectedRows: any[]
  selectionCount: number
  onImport?: () => void
  onExport?: () => void
  enableSearch?: boolean
  onSearchChange?: (value: string) => void
  searchValue?: string
  searchPlaceholder?: string
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({
  hasValues,
  isLoading = false,
  showClearButton = true,
  title = "Filters",
  viewMode,
  setViewMode,
  refreshData,
  hasSelection,
  selectionCount,
  onImport,
  onExport,
  onClear,
  enableSearch = true,
  onSearchChange,
  searchValue = "",
}) => {
  const { t } = useTranslation()
  const handleRefresh = () => {
    refreshData()
  }

  const [searchText, setSearchText] = useState(searchValue)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    onSearchChange?.(event.target.value)
  }

  const handleClear = () => {
    setSearchText("")
    onClear()
  }

  return (
    <div className="flex items-center justify-between px-2 py-3 w-full gap-x-2">
      <div className="flex items-center gap-x-2 pl-2 md:pl-4">
        <div className="size-5">
          <FilterIcon className="size-5 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground hidden md:inline">{title}</h3>
        {hasValues && <div className="h-2 w-2 bg-primary rounded-full" title="Active filters" />}
        {enableSearch && (
          <div className="relative">
            <Search className="absolute z-50 left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input prefix="" type="text" value={searchText} placeholder="Search..." disabled={isLoading} onChange={handleSearchChange} className="pl-10" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-x-2">
        {hasSelection && <Badge className="text-sm">{t("common.filter.selection.count", { count: selectionCount })}</Badge>}

        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-r-none border-r"
            title={t("common.filter.view.list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="rounded-l-none" title={t("common.filter.view.grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
        {!!(onExport || onImport) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" title={t("common.filter.actions.more")}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("common.filter.actions.export")}
                </DropdownMenuItem>
              )}
              {onImport && (
                <DropdownMenuItem onClick={onImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("common.filter.actions.import")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {hasValues && showClearButton && (
          <Button type="reset" variant="outline" onClick={handleClear} size="sm" className="ml-4" disabled={isLoading}>
            <X className="h-4 w-4 mr-1" />
            {t("common.filter.actions.clear")}
          </Button>
        )}
        <Button size="sm" type="submit" disabled={isLoading} className="flex items-center gap-x-1" title={t("common.filter.actions.refresh")}>
          <SearchIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden lg:inline">{t("common.filter.actions.filter")}</span>
        </Button>
      </div>
    </div>
  )
}
