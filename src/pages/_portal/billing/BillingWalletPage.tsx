import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WalletService, WalletTransactionService } from "@/shared/api/services";
import { PageLoader } from "@/components/feedback/PageLoader";
import type { WalletDto, WalletTransactionDto } from "@/shared/api/types";

import { BillingTabs } from "@/components/features/billing/BillingTabs";
import { LowBalanceAlert } from "@/components/features/billing/LowBalanceAlert";
import { WalletHeroCard } from "@/components/features/billing/WalletHeroCard";
import { WalletKPIs } from "@/components/features/billing/WalletKPIs";
import { RecentTransactionsTable } from "@/components/features/billing/RecentTransactionsTable";
import { RechargeWalletModal } from "@/components/features/billing/RechargeWalletModal";
import { WalletSettingsModal } from "@/components/features/billing/WalletSettingsModal";

export function BillingWalletPage() {
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => WalletService.search({ pageNumber: 1, pageSize: 1 }) as any,
  });

  const { data: txData } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () =>
      WalletTransactionService.search({ pageNumber: 1, pageSize: 5 }) as any,
  });

  const wallet: WalletDto | undefined = walletData?.data?.items?.[0];
  const recentTx: WalletTransactionDto[] = txData?.data?.items ?? [];
  const isLowBalance =
    wallet && (wallet.balance ?? 0) < (wallet.lowBalanceThreshold ?? 150000);

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Facturation
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            Acme Corp · Période en cours :{" "}
            {new Date().toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <BillingTabs />

      <LowBalanceAlert
        isLowBalance={!!isLowBalance}
        onRechargeClick={() => setRechargeOpen(true)}
      />

      <WalletHeroCard
        wallet={wallet}
        onSettingsClick={() => setSettingsOpen(true)}
        onRechargeClick={() => setRechargeOpen(true)}
      />

      <WalletKPIs wallet={wallet} />

      <RecentTransactionsTable
        transactions={recentTx}
        currency={wallet?.currency}
      />

      <RechargeWalletModal
        isOpen={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        balance={wallet?.balance || 0}
        currency={wallet?.currency || "XAF"}
      />

      <WalletSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        wallet={wallet}
      />
    </div>
  );
}
