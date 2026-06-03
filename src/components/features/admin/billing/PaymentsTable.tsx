import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import type { PaymentDto } from "@/shared/api/generated/types.gen";

interface PaymentsTableProps {
  payments: PaymentDto[];
  isLoading: boolean;
}

const statusV = (s?: string | null) =>
  s === "completed"
    ? "success"
    : s === "failed"
      ? "error"
      : s === "pending"
        ? "warning"
        : "neutral";
const statusL = (s?: string | null) =>
  s === "completed"
    ? "Complété"
    : s === "failed"
      ? "Échoué"
      : s === "pending"
        ? "En attente"
        : "Remboursé";

export function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
  const columns: Column<PaymentDto>[] = [
    {
      key: "id",
      label: "ID",
      width: "150px",
      render: (p) => (
        <span className="font-mono text-[11.5px] text-[#4A7A94]">
          {p.id?.slice(0, 14)}…
        </span>
      ),
    },
    {
      key: "companyId",
      label: "Company",
      width: "150px",
      render: (p) => (
        <span className="font-mono text-[12px] text-[#4A7A94]">
          {p.companyId?.slice(0, 12)}…
        </span>
      ),
    },
    {
      key: "method",
      label: "Méthode",
      width: "130px",
      render: (p) => (
        <span className="text-[12.5px] font-medium text-[#0D2137]">
          {p.method ?? "—"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Montant",
      width: "130px",
      render: (p) => (
        <span className="font-semibold text-[13px]">
          {formatCurrency(p.amount, p.currency)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "120px",
      render: (p) => (
        <Badge variant={statusV(p.status)} dot>
          {statusL(p.status)}
        </Badge>
      ),
    },
    {
      key: "processedAt",
      label: "Traité le",
      width: "130px",
      render: (p) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {p.processedAt ? formatDate(p.processedAt) : "—"}
        </span>
      ),
    },
    {
      key: "externalTransactionId",
      label: "Réf. externe",
      width: "160px",
      render: (p) =>
        p.externalTransactionId ? (
          <span className="font-mono text-[11px] text-[#2E8FAD]">
            {p.externalTransactionId.slice(0, 16)}
          </span>
        ) : (
          <span className="text-[#B8CDD8]">—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={payments}
      loading={isLoading}
      getRowId={(p) => p.id ?? ""}
      emptyTitle="Aucun paiement"
    />
  );
}
