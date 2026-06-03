import React from "react";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Eye, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { avatarColor, getInitials, statusLabel, cn } from "@/lib/utils";
import { formatRelative } from "@/lib/date";
import type { ClientModel } from "@/models/client.model";

interface ContactTableProps {
  contacts: ClientModel[];
  loading: boolean;
  onView: (contact: ClientModel) => void;
  onEdit: (contact: ClientModel) => void;
  onDelete: (id: string) => void;
  activeRowId?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

const statusVariant = (s: string): "success" | "neutral" | "error" =>
  s === "active" ? "success" : s === "inactive" ? "neutral" : "error";

export function ContactTable({
  contacts,
  loading,
  onView,
  onEdit,
  onDelete,
  activeRowId,
  pagination,
}: ContactTableProps) {
  const columns: Column<ClientModel>[] = [
    {
      key: "avatar",
      label: "",
      width: "44px",
      render: (c) => {
        const col = avatarColor(c.firstName || "U");
        return (
          <div
            className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10.5px] font-semibold shrink-0"
            style={{ background: `${col}22`, color: col }}
          >
            {getInitials(c.firstName, c.lastName)}
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Nom",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-medium text-[#0D2137] truncate">
            {c.firstName || "Sans"} {c.lastName || "Nom"}
          </div>
          <div className="text-[11.5px] text-[#8BAFC0] mt-px">
            Segment (mock)
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      width: "200px",
      render: (c) => (
        <span className="text-[#4A7A94] truncate">{c.email || "—"}</span>
      ),
    },
    {
      key: "phone",
      label: "Téléphone",
      width: "150px",
      render: (c) => (
        <span className="text-[#4A7A94] truncate font-mono">{c.phone || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (c) => (
        <Badge
          variant={statusVariant(c.status)}
          dot
          className="shadow-none scale-90 origin-left border-[0.5px] bg-opacity-100"
          // style={{
          //   borderColor: c.status === 'active' ? '#86EFAC' : c.status === 'inactive' ? '#E5E7EB' : '#FCA5A5',
          //   backgroundColor: c.status === 'active' ? '#DCFCE7' : c.status === 'inactive' ? '#F0F2F4' : '#FEE2E2',
          // }}
        >
          {statusLabel(c.status)}
        </Badge>
      ),
    },
    {
      key: "channels",
      label: "Canaux",
      width: "100px",
      render: (c) => (
        <div className="flex items-center gap-1">
          {/* Mock channels */}
          <div className="w-[7px] h-[7px] rounded-full bg-[#2E8FAD]" title="SMS"></div>
          <div className="w-[7px] h-[7px] rounded-full bg-[#1B5E82]" title="Email"></div>
          <div className="w-[7px] h-[7px] rounded-full bg-[#25D366]" title="WhatsApp"></div>
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Dernière act.",
      width: "110px",
      sortable: true,
      render: (c) => (
        <span className="text-[#8BAFC0] text-[12.5px] truncate">
          {formatRelative(c.updatedAt ?? c.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "100px",
      render: (c) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end pr-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(c);
            }}
            className="w-[26px] h-[26px] rounded-[6px] border border-transparent bg-transparent flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] hover:border-[#2E8FAD]/20 transition-all"
            title="Détails"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(c);
            }}
            className="w-[26px] h-[26px] rounded-[6px] border border-transparent bg-transparent flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] hover:border-[#2E8FAD]/20 transition-all"
            title="Modifier"
          >
            <Edit size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c.id);
            }}
            className="w-[26px] h-[26px] rounded-[6px] border border-transparent bg-transparent flex items-center justify-center text-[#8BAFC0] hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#FCA5A5] transition-all"
            title="Supprimer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="[&_tr]:group overflow-hidden shadow-none">
      <DataTable
        columns={columns}
        data={contacts}
        loading={loading}
        getRowId={(c) => c.id}
        activeRowId={activeRowId}
        onRowClick={onView}
        emptyTitle="Aucun contact"
        emptyDescription="Votre base de données clients est actuellement vide"
        pagination={pagination}
      />
    </div>
  );
}
