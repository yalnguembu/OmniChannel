import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import type { SearchIntegrationResponse } from "@/shared/api/generated/types.gen";

interface IntegrationsTableProps {
  integrations: SearchIntegrationResponse[];
  isLoading: boolean;
  onEdit?: (integration: SearchIntegrationResponse) => void;
  onConfigure?: (integration: SearchIntegrationResponse) => void;
  onDelete?: (integration: SearchIntegrationResponse) => void;
  pagination?: {
    total: number;
    pageSize: number;
    page: number;
    onPageChange: (page: number) => void;
  };
}

export function IntegrationsTable({
  integrations,
  isLoading,
  onEdit,
  onConfigure,
  onDelete,
  pagination,
}: IntegrationsTableProps) {
  const columns: Column<SearchIntegrationResponse>[] = [
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
    {
      key: "actions",
      label: "Actions",
      width: "200px",
      render: (i) => (
        <div className="flex gap-2 justify-end">
          {onConfigure && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onConfigure(i)}
              className="text-xs"
            >
              Configurer
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(i)}
              className="text-xs"
            >
              Éditer
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(i)}
              className="text-xs"
            >
              Supprimer
            </Button>
          )}
        </div>
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
      pagination={pagination}
    />
  );
}
