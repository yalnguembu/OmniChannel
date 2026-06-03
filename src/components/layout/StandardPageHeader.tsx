import React, { ReactNode } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

interface StandardPageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Flat 2.0 Header for Portal Pages
 * Minimalist, no icons, small typography, borderline-over-shadow.
 */
export function StandardPageHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  actions,
  className,
}: StandardPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-[19px] font-medium text-[#0D2137] tracking-[-0.015em] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-[#4A7A94] mt-[3px]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          containerClassName="w-full md:w-[220px]"
        />
        {actions}
      </div>
    </div>
  );
}
