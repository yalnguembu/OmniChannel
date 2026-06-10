import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type {
  SearchWalletResponse,
  SearchWalletTransactionResponse,
} from "@/shared/api/generated/types.gen";

interface CompanyWalletTabProps {
  wallet: SearchWalletResponse | null;
  transactions: SearchWalletTransactionResponse[];
}

export function CompanyWalletTab({
  wallet,
  transactions,
}: CompanyWalletTabProps) {
  const txColumns: Column<SearchWalletTransactionResponse>[] = [
    {
      key: "createdAt",
      label: "Date",
      width: "150px",
      render: (t) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {formatDateTime(t.createdAt)}
        </span>
      ),
    },
    {
      key: "reason",
      label: "Description",
      render: (t) => (
        <span className="text-[12.5px]">
          {t.reason ?? t.referenceType ?? "—"}
        </span>
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
      width: "120px",
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
      key: "balanceAfter",
      label: "Solde après",
      width: "120px",
      render: (t) => (
        <span className="font-mono text-[12px] text-[#0D2137]">
          {formatCurrency(t.balanceAfter)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {wallet && (
        <div className="bg-gradient-to-br from-[#0D2137] to-[#1B3A60] rounded-[20px] p-6 text-white relative overflow-hidden">
          <div className="absolute right-[-40px] top-[-40px] w-[200px] h-[200px] rounded-full border border-white/5" />
          <p className="text-[11px] text-white/50 uppercase tracking-[0.1em] mb-2">
            Solde disponible
          </p>
          <p className="text-[36px] font-semibold tracking-tight">
            {formatCurrency(wallet.balance, wallet.currency)}
          </p>
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-[11px] text-white/40 mb-0.5">Seuil min.</p>
              <p className="text-[14px] font-medium">
                {wallet.minimumBalance != null
                  ? formatCurrency(wallet.minimumBalance, wallet.currency)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/40 mb-0.5">Seuil alerte</p>
              <p className="text-[14px] font-medium">
                {wallet.lowBalanceThreshold != null
                  ? formatCurrency(wallet.lowBalanceThreshold, wallet.currency)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/40 mb-0.5">Bloqué</p>
              <p
                className={cn(
                  "text-[14px] font-medium",
                  wallet.isBlocked ? "text-[#FCA5A5]" : "text-[#86EFAC]",
                )}
              >
                {wallet.isBlocked ? "Oui" : "Non"}
              </p>
            </div>
          </div>
        </div>
      )}
      <Card>
        <CardHeader title="Dernières transactions" />
        <CardBody className="p-0">
          <DataTable
            columns={txColumns}
            data={transactions}
            getRowId={(t) => t.id ?? ""}
            emptyTitle="Aucune transaction"
          />
        </CardBody>
      </Card>
    </div>
  );
}
