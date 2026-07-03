import { useNavigate } from "@tanstack/react-router";
import { PageLoader } from "@/components/feedback/PageLoader";

import { useProductDetailViewModel } from "@/hooks/useProductDetailViewModel";
import { useProductChannels } from "@/hooks/useProductChannels";
import { useProductConnectors } from "@/hooks/useProductConnectors";
import { useProductStats } from "@/hooks/useProductStats";

import { ProductNotFound } from "@/components/features/products/detail/ProductNotFound";
import { ProductDetailHero } from "@/components/features/products/detail/ProductDetailHero";
import { ProductKpiBar } from "@/components/features/products/detail/ProductKpiBar";
import { ProductStatsSection } from "@/components/features/products/detail/ProductStatsSection";
import { OverviewTab } from "@/components/features/products/detail/OverviewTab";
import { ProductEditModal } from "@/components/features/products/detail/ProductEditModal";
import type { ProductTabId } from "@/components/features/products/detail/ProductDetailTabs";

/**
 * Product overview — landing page of a product. Hosts the hero, KPI bar and the
 * merged overview/settings content. Other product sections are now standalone
 * routes (/$productId/<section>) reachable from the sidebar.
 */
export default function ProductOverviewPage({
  productId,
}: {
  productId: string;
}) {
  const navigate = useNavigate();

  const vm = useProductDetailViewModel(productId);
  const channelsVm = useProductChannels(productId);
  const connectorsVm = useProductConnectors(productId);
  const statsVm = useProductStats(productId);

  if (vm.isLoading)
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );

  if (!vm.product)
    return <ProductNotFound onBack={() => navigate({ to: "/products" })} />;

  const product = vm.product;

  const goToSection = (id: ProductTabId) =>
    navigate({ to: `/${productId}/${id}` } as never);

  return (
    <div className="flex flex-col">
      {/* HERO + KPIs */}
      <div className="bg-white border-b border-[#E5E7EB] px-7">
        <ProductDetailHero
          product={product}
          onBack={() => navigate({ to: "/products" })}
          onEdit={vm.openEdit}
          onChangeStatus={vm.handleChangeStatus}
          isUpdatePending={vm.isUpdatePending}
          onNewCampaign={() =>
            navigate({
              to: "/$productId/campaigns",
              params: { productId },
              search: { create: true },
            })
          }
        />
        <ProductKpiBar
          activeChannelsCount={channelsVm.activeChannelsCount}
          connectorsCount={connectorsVm.count}
          deliveryRate={statsVm.deliveryRate}
          totalDelivered={statsVm.totalDelivered}
        />
      </div>

      {/* STATISTICS */}
      <div className="p-7 pb-0">
        <ProductStatsSection stats={statsVm} />
      </div>

      {/* OVERVIEW + SETTINGS */}
      <div className="p-7">
        <OverviewTab
          product={product}
          channels={channelsVm.channels}
          onNavigateTab={goToSection}
        />
      </div>

      <ProductEditModal
        open={vm.isEditOpen}
        onClose={vm.closeEdit}
        product={product}
        onSubmit={vm.handleUpdate}
        isPending={vm.isUpdatePending}
      />
    </div>
  );
}
