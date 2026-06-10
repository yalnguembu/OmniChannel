import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatCurrency } from "@/lib/currency";
import type { SearchSubscriptionPlanResponse } from "@/shared/api/generated/types.gen";

interface PlansTableProps {
  plans: SearchSubscriptionPlanResponse[];
  isLoading: boolean;
  onEdit: (plan: SearchSubscriptionPlanResponse) => void;
}

export function PlansTable({ plans, isLoading, onEdit }: PlansTableProps) {
  const columns: Column<SearchSubscriptionPlanResponse>[] = [
    {
      key: "name",
      label: "Plan",
      render: (p) => <p className="font-medium text-[13px]">{p.name}</p>,
    },
    {
      key: "monthlyPrice",
      label: "Prix/mois",
      width: "120px",
      render: (p) => (
        <span className="font-semibold text-[13px]">
          {formatCurrency(p.monthlyPrice)}
        </span>
      ),
    },
    {
      key: "yearlyPrice",
      label: "Prix/an",
      width: "120px",
      render: (p) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {p.yearlyPrice ? formatCurrency(p.yearlyPrice) : "—"}
        </span>
      ),
    },
    {
      key: "monthlyQuota",
      label: "Quota",
      width: "100px",
      render: (p) => (
        <span className="text-[12.5px]">
          {p.monthlyQuota ? `${(p.monthlyQuota / 1000).toFixed(0)}k` : "—"}
        </span>
      ),
    },
    {
      key: "maxUsers",
      label: "Users max",
      width: "90px",
      render: (p) => <span className="text-[12.5px]">{p.maxUsers ?? "—"}</span>,
    },
    {
      key: "isActive",
      label: "Statut",
      width: "90px",
      render: (p) => (
        <Badge variant={p.isActive ? "success" : "neutral"} dot>
          {p.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "80px",
      render: (p) => (
        <Can perform={ACTION.SUBSCRIPTIONPLAN_EDIT}>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(p);
            }}
          >
            <Edit size={12} />
            Modifier
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={plans}
      loading={isLoading}
      getRowId={(p) => p.id ?? ""}
      emptyTitle="Aucun plan"
    />
  );
}
