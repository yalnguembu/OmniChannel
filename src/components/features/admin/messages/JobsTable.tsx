import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import { statusLabel } from "@/lib/utils";

interface JobsTableProps {
  jobs: any[];
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
  const columns: Column<any>[] = [
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
          {j.type ?? j.jobType ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (j) => (
        <Badge variant={jobStatusColor(j.status)} dot>
          {statusLabel(j.status)}
        </Badge>
      ),
    },
    {
      key: "progress",
      label: "Progression",
      width: "160px",
      render: (j) => {
        const pct = j.progress ?? 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#F0F2F4] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2E8FAD]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11.5px] text-[#4A7A94] w-8 text-right">
              {pct}%
            </span>
          </div>
        );
      },
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
      getRowId={(j) => j.id}
      emptyTitle="Aucun job en cours"
    />
  );
}
