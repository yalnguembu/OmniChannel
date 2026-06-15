import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import { statusLabel, statusBadgeClass } from "@/lib/utils";
import type { SearchMessageResponse } from "@/shared/api/generated/types.gen";

interface MessagesTableProps {
  messages: SearchMessageResponse[];
  isLoading: boolean;
}

export function MessagesTable({ messages, isLoading }: MessagesTableProps) {
  const columns: Column<SearchMessageResponse>[] = [
    {
      key: "id",
      label: "ID",
      width: "140px",
      render: (m) => (
        <span className="font-mono text-[11.5px] text-[#4A7A94]">
          {m.id?.slice(0, 14)}…
        </span>
      ),
    },
    {
      key: "recipientAddress",
      label: "Destinataire",
      width: "180px",
      render: (m) => (
        <span className="font-medium text-[12.5px]">
          {m.recipientAddress ?? "—"}
        </span>
      ),
    },
    {
      key: "content",
      label: "Contenu",
      render: (m) => (
        <span className="text-[12.5px] text-[#4A7A94] truncate max-w-[280px] block">
          {m.content
            ? m.content?.slice(0, 60) + (m.content.length > 60 ? "…" : "")
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (m) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusBadgeClass(m.status ?? "")}`}
        >
          {statusLabel(m.status ?? "")}
        </span>
      ),
    },
    {
      key: "sentAt",
      label: "Envoyé",
      width: "120px",
      render: (m) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {m.sentAt ? formatRelative(m.sentAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={messages}
      loading={isLoading}
      getRowId={(m) => m.id ?? ""}
      emptyTitle="Aucun message"
    />
  );
}
