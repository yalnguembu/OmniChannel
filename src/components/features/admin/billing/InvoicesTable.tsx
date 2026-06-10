import { Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import type { SearchInvoiceResponse } from "@/shared/api/generated/types.gen";

interface InvoicesTableProps {
  invoices: SearchInvoiceResponse[];
  isLoading: boolean;
}

const statusV = (s?: string | null) =>
  s === "paid"
    ? "success"
    : s === "overdue"
      ? "error"
      : s === "pending"
        ? "warning"
        : "neutral";
const statusL = (s?: string | null) =>
  s === "paid"
    ? "Payée"
    : s === "overdue"
      ? "En retard"
      : s === "pending"
        ? "En attente"
        : "Annulée";

export function InvoicesTable({ invoices, isLoading }: InvoicesTableProps) {
  const columns: Column<SearchInvoiceResponse>[] = [
    {
      key: "invoiceNumber",
      label: "Numéro",
      width: "150px",
      render: (i) => (
        <span className="font-mono text-[12px] text-[#2E8FAD] font-medium">
          {i.invoiceNumber}
        </span>
      ),
    },
    {
      key: "companyId",
      label: "Company",
      width: "160px",
      render: (i) => (
        <span className="text-[12px] text-[#4A7A94] font-mono">
          {i.companyId?.slice(0, 12)}…
        </span>
      ),
    },
    {
      key: "period",
      label: "Période",
      render: (i) => (
        <span className="text-[12.5px]">
          {formatDate(i.billingPeriodStart)} – {formatDate(i.billingPeriodEnd)}
        </span>
      ),
    },
    {
      key: "total",
      label: "Montant",
      width: "130px",
      render: (i) => (
        <span className="font-semibold text-[13px]">
          {formatCurrency(i.total, i.currency)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "120px",
      render: (i) => (
        <Badge variant={statusV(i.status)} dot>
          {statusL(i.status)}
        </Badge>
      ),
    },
    {
      key: "dueDate",
      label: "Échéance",
      width: "115px",
      render: (i) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {i.dueDate ? formatDate(i.dueDate) : "—"}
        </span>
      ),
    },
    {
      key: "paidAt",
      label: "Payée le",
      width: "115px",
      render: (i) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {i.paidAt ? formatDate(i.paidAt) : "—"}
        </span>
      ),
    },
    {
      key: "dl",
      label: "",
      width: "44px",
      render: () => (
        <button
          onClick={() =>
            toast.info("Le téléchargement PDF n'est pas encore disponible.")
          }
          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all cursor-pointer"
        >
          <Download size={13} />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      loading={isLoading}
      getRowId={(i) => i.id ?? ""}
      emptyTitle="Aucune facture"
    />
  );
}
