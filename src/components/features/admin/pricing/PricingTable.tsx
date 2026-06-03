import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatCurrency } from "@/lib/currency";
import type { PricingDto } from "@/shared/api/generated/types.gen";

interface PricingTableProps {
  pricings: PricingDto[];
  isLoading: boolean;
  onEdit: (pricing: PricingDto) => void;
  onDelete: (id: string) => void;
}

export function PricingTable({
  pricings,
  isLoading,
  onEdit,
  onDelete,
}: PricingTableProps) {
  const columns: Column<PricingDto>[] = [
    {
      key: "channelCode",
      label: "Canal",
      render: (p) => (
        <span className="font-mono text-[12.5px] text-[#2E8FAD] font-semibold">
          {p.channelId ?? "—"}
        </span>
      ),
    },
    {
      key: "providerCode",
      label: "Provider",
      width: "130px",
      render: (p) => (
        <span className="font-mono text-[12.5px] text-[#4A7A94]">
          {p.providerId ?? "Tous"}
        </span>
      ),
    },
    {
      key: "companyId",
      label: "Company",
      width: "130px",
      render: (p) => (
        <span className="text-[12.5px]">
          {p.companyId ? "Spécifique" : "Toutes"}
        </span>
      ),
    },
    {
      key: "unitPrice",
      label: "Prix unitaire",
      width: "120px",
      render: (p) => (
        <span className="font-semibold text-[13px]">
          {p.unitPrice != null ? formatCurrency(p.unitPrice) : "—"}
        </span>
      ),
    },
    {
      key: "setupFee",
      label: "Frais setup",
      width: "110px",
      render: (p) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {p.platformFee ? formatCurrency(p.platformFee) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "100px",
      render: (p) => (
        <div className="flex gap-1">
          <Can perform={ACTION.PRICING_EDIT}>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(p);
              }}
            >
              <Edit size={12} />
            </Button>
          </Can>
          <Can perform={ACTION.PRICING_DELETE}>
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                if (p.id) onDelete(p.id);
              }}
            >
              <Trash2 size={12} />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={pricings}
      loading={isLoading}
      getRowId={(p) => p.id ?? ""}
      emptyTitle="Aucun tarif"
    />
  );
}
