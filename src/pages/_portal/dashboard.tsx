import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageLoader } from "@/components/feedback/PageLoader";
import { useDashboardViewModel } from "@/hooks/useDashboardViewModel";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { DashboardAlerts } from "@/components/features/dashboard/DashboardAlerts";
import { DashboardKPIs } from "@/components/features/dashboard/DashboardKPIs";
import { RecentCampaignsCard } from "@/components/features/dashboard/RecentCampaignsCard";
import { MyProductsCard } from "@/components/features/dashboard/MyProductsCard";
import { GlobalActivityLog } from "@/components/features/dashboard/GlobalActivityLog";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";

export const Route = createFileRoute("/_portal/dashboard")({
  component: DashboardPage,
  beforeLoad: ({ context }) => {
    requirePermission(
      context.user, context.strategy, {
        action: ACTION.DASHBOARD_READ,
        redirectTo: "/forbidden"
      }
    )
  }
});

function DashboardPage() {
  const navigate = useNavigate();
  const vm = useDashboardViewModel();

  if (vm.isLoading)
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );

  return (
    <div className="p-7 max-w-[1600px] mx-auto">
      {/* Header section */}
      <DashboardHeader
        notificationsCount={vm.notifications.length}
        onNewCampaign={() => navigate({ to: "/campaigns" })}
      />

      {/* Critical Alerts Area */}
      <DashboardAlerts
        isWalletLow={vm.isWalletLow}
        balance={vm.wallet?.balance || 0}
        currency={vm.wallet?.currency || "XAF"}
        onRecharge={() => navigate({ to: "/billing/wallet" })}
      />

      {/* KPIs Grid */}
      <DashboardKPIs
        totalMessages={vm.totalMessages}
        totalContacts={vm.totalContacts}
        activeCampaignsCount={vm.activeCampaignsCount}
        totalCampaigns={vm.totalCampaigns}
        walletBalance={vm.wallet?.balance}
        walletCurrency={vm.wallet?.currency}
        isWalletLow={vm.isWalletLow}
      />

      {/* Primary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Recents Campaigns */}
        <RecentCampaignsCard
          campaigns={vm.campaigns}
          onNavigateAll={() => navigate({ to: "/campaigns" })}
          onNavigateDetail={(id) => navigate({ to: "/campaigns/$campaignId", params: { campaignId: id } })}
        />

        {/* Mes Produits */}
        <MyProductsCard
          products={vm.products}
          onNavigateAll={() => navigate({ to: "/products" })}
          onNavigateDetail={(id) => navigate({ to: "/products/$productId", params: { productId: id } })}
        />
      </div>

      {/* Global Activity Log */}
      <GlobalActivityLog
        messages={vm.recentMessages}
        onNavigateAll={() => navigate({ to: "/messages" })}
      />
    </div>
  );
}
