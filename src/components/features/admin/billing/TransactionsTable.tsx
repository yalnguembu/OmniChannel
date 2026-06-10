import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { SearchWalletTransactionResponse } from "@/shared/api/generated/types.gen";

interface TransactionsTableProps {
  transactions: SearchWalletTransactionResponse[];
  isLoading: boolean;
}

export function TransactionsTable({
  transactions,
  isLoading,
}: TransactionsTableProps) {
  const columns: Column<SearchWalletTransactionResponse>[] = [
    {
      key: "createdAt",
      label: "Date",
      width: "160px",
      render: (t) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {formatDateTime(t.createdAt)}
        </span>
      ),
    },
    {
      key: "walletId",
      label: "Wallet",
      width: "150px",
      render: (t) => (
        <span className="font-mono text-[11.5px] text-[#4A7A94]">
          {t.walletId?.slice(0, 14)}…
        </span>
      ),
    },
    {
      key: "reason",
      label: "Description",
      render: (t) => (
        <span className="text-[12.5px] text-[#0D2137]">
          {t.reason ?? t.referenceType ?? "—"}
        </span>
      ),
    },
    {
      key: "referenceId",
      label: "Référence",
      width: "150px",
      render: (t) =>
        t.referenceId ? (
          <span className="font-mono text-[11.5px] text-[#4A7A94]">
            {t.referenceId.slice(0, 14)}…
          </span>
        ) : (
          <span className="text-[#B8CDD8]">—</span>
        ),
    },
    {
      key: "type",
      label: "Type",
      width: "90px",
      render: (t) => (
        <Badge variant={t.type === "credit" ? "success" : "neutral"}>
          {t.type === "credit" ? "Crédit" : "Débit"}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Montant",
      width: "130px",
      render: (t) => (
        <span
          className={cn(
            "font-mono font-semibold text-[12.5px]",
            t.type === "credit" ? "text-[#16A34A]" : "text-[#DC2626]",
          )}
        >
          {t.type === "credit" ? "+" : "-"}
          {formatCurrency(Math.abs(t.amount ?? 0))}
        </span>
      ),
    },
    {
      key: "balanceBefore",
      label: "Avant",
      width: "120px",
      render: (t) => (
        <span className="font-mono text-[12px] text-[#4A7A94]">
          {formatCurrency(t.balanceBefore)}
        </span>
      ),
    },
    {
      key: "balanceAfter",
      label: "Après",
      width: "120px",
      render: (t) => (
        <span className="font-mono text-[12px] text-[#0D2137] font-medium">
          {formatCurrency(t.balanceAfter)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      loading={isLoading}
      getRowId={(t) => t.id ?? ""}
      emptyTitle="Aucune transaction"
    />
  );
}
