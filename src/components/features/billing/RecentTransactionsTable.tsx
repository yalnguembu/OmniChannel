import React from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { WalletTransactionDto } from "@/api/generated/types";

export function RecentTransactionsTable({ transactions, currency }: { transactions: WalletTransactionDto[], currency?: string }) {
  const txColumns: Column<WalletTransactionDto>[] = [
    {
      key: "createdAt",
      label: "Date",
      width: "160px",
      render: (t) => (
        <span className="text-[12.5px] text-[#8BAFC0]">
          {formatDateTime(t.createdAt)}
        </span>
      ),
    },
    {
      key: "reason",
      label: "Description",
      render: (t) => (
        <span className="font-medium">
          {t.reason ?? t.referenceType ?? "—"}
        </span>
      ),
    },
    {
      key: "referenceId",
      label: "Référence",
      width: "150px",
      render: (t) => (
        <span className="font-mono text-[11px] text-[#4A7A94]">
          {t.referenceId ?? "—"}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: "100px",
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
            "font-mono text-[12px] font-semibold",
            t.type === "credit" ? "text-[#16A34A]" : "text-[#DC2626]",
          )}
        >
          {t.type === "credit" ? "+" : ""}
          {formatCurrency(t.amount, currency)}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9] flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#0D2137]">
          Dernières transactions
        </p>
        <Link
          to="/billing/transactions"
          className="text-[12px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors"
        >
          Tout voir →
        </Link>
      </div>
      <DataTable
        columns={txColumns}
        data={transactions}
        getRowId={(t) => t.id}
        emptyTitle="Aucune transaction"
      />
    </div>
  );
}
