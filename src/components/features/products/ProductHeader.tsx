import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";

interface ProductHeaderProps {
  totalCount: number;
  activeCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export function ProductHeader({
  totalCount,
  activeCount,
  searchValue,
  onSearchChange,
  onAddClick,
}: ProductHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Mes produits
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          {totalCount} produit{totalCount > 1 ? "s" : ""} ·{" "}
          {activeCount} actif{activeCount > 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <SearchInput
          placeholder="Rechercher un produit…"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          containerClassName="w-56"
        />
        <Button variant="primary" onClick={onAddClick}>
          <Plus size={13} />
          Nouveau produit
        </Button>
      </div>
    </div>
  );
}
