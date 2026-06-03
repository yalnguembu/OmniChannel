import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import { statusLabel } from "@/lib/utils";
import type { CompanyDto } from "@/shared/api/generated/types.gen";
import { STATUS_V } from "./companyStatus";

interface CompaniesTableProps {
  companies: CompanyDto[];
  isLoading: boolean;
  onRowClick: (company: CompanyDto) => void;
}

export function CompaniesTable({
  companies,
  isLoading,
  onRowClick,
}: CompaniesTableProps) {
  const columns: Column<CompanyDto>[] = [
    {
      key: "name",
      label: "Company",
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-[#E8F4F8] flex items-center justify-center shrink-0">
            <Building2 size={13} className="text-[#2E8FAD]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">{c.name}</p>
            <p className="text-[11px] text-[#8BAFC0]">{c.email ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (c) => (
        <Badge variant={STATUS_V[c.status ?? ""] ?? "neutral"} dot>
          {statusLabel(c.status ?? "")}
        </Badge>
      ),
    },
    {
      key: "country",
      label: "Pays",
      width: "90px",
      render: (c) => (
        <span className="text-[12.5px] text-[#4A7A94]">{c.country ?? "—"}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (c) => (
        <span className="text-[12.5px] text-[#4A7A94]">{c.email ?? "—"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Créé",
      width: "110px",
      render: (c) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {formatRelative(c.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={companies}
      loading={isLoading}
      getRowId={(c) => c.id ?? ""}
      onRowClick={onRowClick}
      emptyTitle="Aucune company"
    />
  );
}
