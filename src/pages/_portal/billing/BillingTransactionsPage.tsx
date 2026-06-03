import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WalletService, WalletTransactionService } from "@/shared/api/services";
import { Badge } from "@/components/ui/Badge";
import {
  DataTable,
  Pagination,
  type Column,
} from "@/components/data-table/DataTable";
import { formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { WalletTransactionDto } from "@/api/generated/types";

const billingTabs = [
  { to: "/billing/wallet", label: "Wallet" },
  { to: "/billing/transactions", label: "Transactions" },
  { to: "/billing/invoices", label: "Factures" },
  { to: "/billing/subscription", label: "Abonnement" },
  { to: "/billing/payment-methods", label: "Méthodes de paiement" },
];

export function BillingTransactionsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => WalletService.search({ pageNumber: 1, pageSize: 1 }) as any,
  });

  const wallet = walletData?.data?.items?.[0];

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page],
    queryFn: () =>
      WalletTransactionService.search({ pageNumber: page, pageSize }) as any,
  });

  const transactions: WalletTransactionDto[] = data?.data?.items ?? [];
  const total: number = data?.data?.totalCount ?? 0;

  const exportCsv = () => {
    if (transactions.length === 0) return;
    const headers = [
      "Date",
      "Description",
      "Référence",
      "Type",
      "Avant",
      "Après",
      "Montant",
    ];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = transactions.map((t) =>
      [
        t.createdAt ?? "",
        t.reason ?? t.referenceType ?? "",
        t.referenceId ?? "",
        t.type ?? "",
        t.balanceBefore ?? "",
        t.balanceAfter ?? "",
        t.amount ?? "",
      ]
        .map(escape)
        .join(","),
    );
    const csv = [headers.map(escape).join(","), ...rows].join("\r\n");
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<WalletTransactionDto>[] = [
    {
      key: "createdAt",
      label: "Date",
      width: "160px",
      sortable: true,
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
        <span className="font-medium text-[#0D2137]">
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
      key: "balanceBefore",
      label: "Avant",
      width: "130px",
      render: (t) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {formatCurrency(t.balanceBefore, wallet?.currency)}
        </span>
      ),
    },
    {
      key: "balanceAfter",
      label: "Après",
      width: "130px",
      render: (t) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {formatCurrency(t.balanceAfter, wallet?.currency)}
        </span>
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
          {formatCurrency(t.amount, wallet?.currency)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-7">
      <div className="mb-2">
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Facturation
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">Acme Corp</p>
      </div>

      <div className="flex border-b border-[#E5E7EB] mb-6">
        {billingTabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="px-4 py-2.5 text-[13px] border-b-2 border-transparent text-[#4A7A94] hover:text-[#0D2137] transition-all whitespace-nowrap"
            activeProps={{
              className: "text-[#1B5E82] font-medium !border-[#2E8FAD]",
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#4A7A94]">
          {total.toLocaleString("fr")} transactions
        </p>
        <button
          onClick={exportCsv}
          disabled={transactions.length === 0}
          className="text-[13px] px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-full hover:bg-[#F0F2F4] transition-all flex items-center gap-1.5 text-[#4A7A94] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Exporter CSV
        </button>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        loading={isLoading}
        getRowId={(t) => t.id}
        emptyTitle="Aucune transaction"
      />
      <Pagination
        total={total}
        pageSize={pageSize}
        page={page}
        onChange={setPage}
      />
    </div>
  );
}
