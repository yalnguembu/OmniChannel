import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import type { ChannelDto } from "@/shared/api/generated/types.gen";
import { CH_META, CH_FB } from "./ChannelCard";

interface ChannelsTableProps {
  channels: ChannelDto[];
  isLoading: boolean;
  onEdit: (channel: ChannelDto) => void;
}

export function ChannelsTable({
  channels,
  isLoading,
  onEdit,
}: ChannelsTableProps) {
  const columns: Column<ChannelDto>[] = [
    {
      key: "name",
      label: "Canal",
      render: (ch) => {
        const meta = CH_META[ch.code?.toUpperCase() ?? ""] ?? CH_FB;
        return (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[8px] border border-black/5 flex items-center justify-center shrink-0"
              style={{ background: meta.bg }}
            >
              <meta.icon size={14} style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-[13px] font-medium">{ch.name}</p>
              <p className="font-mono text-[11px] text-[#8BAFC0]">{ch.code}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "maxLength",
      label: "Max chars",
      width: "100px",
      render: (ch) => (
        <span className="text-[12.5px]">
          {ch.maxContentLength?.toLocaleString("fr") ?? "—"}
        </span>
      ),
    },
    {
      key: "supportsRichContent",
      label: "Riche",
      width: "80px",
      render: (ch) => (
        <span
          className={
            ch.supportsRichContent
              ? "text-[#16A34A] font-semibold"
              : "text-[#B8CDD8]"
          }
        >
          {ch.supportsRichContent ? "✓" : "—"}
        </span>
      ),
    },
    {
      key: "supportsAttachments",
      label: "Fichiers",
      width: "80px",
      render: (ch) => (
        <span
          className={
            ch.supportsAttachments
              ? "text-[#16A34A] font-semibold"
              : "text-[#B8CDD8]"
          }
        >
          {ch.supportsAttachments ? "✓" : "—"}
        </span>
      ),
    },
    {
      key: "requiresOptIn",
      label: "Opt-in",
      width: "80px",
      render: (ch) => (
        <span
          className={
            ch.requiresOptIn ? "text-[#D97706] font-semibold" : "text-[#B8CDD8]"
          }
        >
          {ch.requiresOptIn ? "✓" : "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Statut",
      width: "90px",
      render: (ch) => (
        <Badge variant={ch.isActive ? "success" : "neutral"} dot>
          {ch.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "80px",
      render: (ch) => (
        <Can perform={ACTION.CHANNEL_EDIT}>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ch);
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
      data={channels}
      loading={isLoading}
      getRowId={(ch) => ch.id ?? ""}
      emptyTitle="Aucun canal"
    />
  );
}
