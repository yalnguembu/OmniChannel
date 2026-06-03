import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import type { IntegrationDto } from "@/shared/api/generated/types.gen";

interface IntegrationsTableProps {
  integrations: IntegrationDto[];
  isLoading: boolean;
}

export function IntegrationsTable({
  integrations,
  isLoading,
}: IntegrationsTableProps) {
  const columns: Column<IntegrationDto>[] = [
    {
      key: "name",
      label: "Nom",
      render: (i) => (
        <span className="font-medium text-[#0D2137]">{i.name}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: "120px",
      render: (i) => <span className="text-[#4A7A94]">{i.type}</span>,
    },
    {
      key: "syncDirection",
      label: "Direction",
      width: "110px",
      render: (i) => (
        <span className="text-[#8BAFC0]">{i.syncDirection ?? "—"}</span>
      ),
    },
    {
      key: "isActive",
      label: "Statut",
      width: "100px",
      render: (i) => (
        <Badge variant={i.isActive ? "success" : "neutral"} dot>
          {i.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "lastSyncAt",
      label: "Dernière sync",
      width: "130px",
      render: (i) => (
        <span className="text-[#8BAFC0] text-[12px]">
          {i.lastSyncAt ? formatRelative(i.lastSyncAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={integrations}
      loading={isLoading}
      getRowId={(i) => i.id ?? ""}
      emptyTitle="Aucune intégration"
    />
  );
}
