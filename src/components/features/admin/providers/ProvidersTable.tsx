import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import type { SearchProviderResponse } from "@/shared/api/generated/types.gen";
import { getProviderTheme } from "./providerTheme";

interface ProvidersTableProps {
  providers: SearchProviderResponse[];
  isLoading: boolean;
  onEdit: (provider: SearchProviderResponse) => void;
}

export function ProvidersTable({
  providers,
  isLoading,
  onEdit,
}: ProvidersTableProps) {
  const columns: Column<SearchProviderResponse>[] = [
    {
      key: "name",
      label: "Provider",
      render: (p) => {
        const theme = getProviderTheme(p.code);
        return (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center font-bold text-[11px] border border-black/5 shrink-0"
              style={{ background: theme.bg, color: theme.color }}
            >
              {p.code?.slice(0, 2)}
            </div>
            <div>
              <p className="text-[13px] font-medium">{p.name}</p>
              <p className="font-mono text-[11px] text-[#8BAFC0]">{p.code}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "baseUrl",
      label: "URL",
      render: (p) =>
        p.baseUrl ? (
          <a
            href={p.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] text-[#2E8FAD] hover:underline truncate block max-w-[220px]"
          >
            {p.baseUrl.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-[#8BAFC0]">—</span>
        ),
    },
    {
      key: "isGlobal",
      label: "Global",
      width: "80px",
      render: (p) => (
        <Badge variant={p.isGlobal ? "info" : "neutral"}>
          {p.isGlobal ? "Oui" : "Non"}
        </Badge>
      ),
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
      key: "createdAt",
      label: "Créé",
      width: "110px",
      render: (p) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {formatRelative(p.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "80px",
      render: (p) => (
        <Can perform={ACTION.PROVIDER_EDIT}>
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
      data={providers}
      loading={isLoading}
      getRowId={(p) => p.id ?? ""}
      emptyTitle="Aucun provider"
    />
  );
}
