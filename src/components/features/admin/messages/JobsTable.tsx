import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import { statusLabel } from "@/lib/utils";
import type { SearchJobResponse } from "@/shared/api/generated/types.gen";

interface JobsTableProps {
  jobs: SearchJobResponse[];
  isLoading: boolean;
}

const jobStatusColor = (s: string) =>
  s === "completed"
    ? "success"
    : s === "failed"
      ? "error"
      : s === "running"
        ? "info"
        : "warning";

export function JobsTable({ jobs, isLoading }: JobsTableProps) {
  const columns: Column<SearchJobResponse>[] = [
    {
      key: "id",
      label: "Job ID",
      width: "160px",
      render: (j) => (
        <span className="font-mono text-[11.5px] text-[#4A7A94]">
          {j.id?.slice(0, 16)}…
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (j) => (
        <span className="font-medium text-[13px] text-[#0D2137]">
          {j.jobType ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (j) => (
        <Badge variant={jobStatusColor(j.status ?? "")} dot>
          {statusLabel(j.status ?? "")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Créé",
      width: "120px",
      render: (j) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {j.createdAt ? formatRelative(j.createdAt) : "—"}
        </span>
      ),
    },
    {
      key: "completedAt",
      label: "Terminé",
      width: "120px",
      render: (j) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {j.completedAt ? formatRelative(j.completedAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={jobs}
      loading={isLoading}
      getRowId={(j) => j.id ?? ""}
      emptyTitle="Aucun job en cours"
    />
  );
}
