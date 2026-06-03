import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PageLoader } from "@/components/feedback/PageLoader";

// ViewModels
import { useProductDetailViewModel } from "@/hooks/useProductDetailViewModel";
import { useProductChannels } from "@/hooks/useProductChannels";
import { useProductConnectors } from "@/hooks/useProductConnectors";
import { useProductStats } from "@/hooks/useProductStats";

// Tab Components
import { ContactsTab } from "@/components/features/products/ContactsTab";
import { CampaignsTab } from "@/components/features/products/CampaignsTab";
import { TemplatesTab } from "@/components/features/products/TemplatesTab";
import { ChannelsTab } from "@/components/features/products/ChannelsTab";
import { ConnectorsTab } from "@/components/features/products/ConnectorsTab";

// Detail subcomponents
import { ProductNotFound } from "@/components/features/products/detail/ProductNotFound";
import { ProductDetailHero } from "@/components/features/products/detail/ProductDetailHero";
import { ProductKpiBar } from "@/components/features/products/detail/ProductKpiBar";
import {
  ProductDetailTabs,
  type ProductTabId,
} from "@/components/features/products/detail/ProductDetailTabs";
import { OverviewTab } from "@/components/features/products/detail/OverviewTab";
import { StatsTab } from "@/components/features/products/detail/StatsTab";
import { SettingsTab } from "@/components/features/products/detail/SettingsTab";

export default function ProductDetailPage({
  productId,
}: {
  productId: string;
}) {
  const navigate = useNavigate();

  // ViewModels
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F4F5F6]">
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {/* HERO + KPIs */}
        <div className="bg-white border-b border-[#E5E7EB] px-7">
          <ProductDetailHero
            product={product}
            onBack={() => navigate({ to: "/products" })}
            onEdit={() => {}}
            onNewCampaign={() =>
              navigate({ to: "/campaigns/new", search: { productId } })
            }
          />
          <ProductKpiBar
            activeChannelsCount={channelsVm.activeChannelsCount}
            connectorsCount={connectorsVm.count}
            deliveryRate={statsVm.deliveryRate}
            totalDelivered={statsVm.totalDelivered}
          />
        </div>

        {/* TABS */}
        <ProductDetailTabs
          activeTab={vm.activeTab}
          onTabChange={(id: ProductTabId) => vm.setActiveTab(id)}
          channelsCount={channelsVm.channels.length}
          connectorsCount={connectorsVm.count}
        />

        {/* TAB BODIES */}
        <div className="p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={vm.activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {vm.activeTab === "overview" && (
                <OverviewTab
                  product={product}
                  channels={channelsVm.channels}
                  onNavigateTab={(id) => vm.setActiveTab(id)}
                />
              )}
              {vm.activeTab === "contacts" && <ContactsTab productId={productId} />}
              {vm.activeTab === "templates" && <TemplatesTab productId={productId} />}
              {vm.activeTab === "campaigns" && <CampaignsTab productId={productId} />}
              {vm.activeTab === "channels" && <ChannelsTab productId={productId} />}
              {vm.activeTab === "connectors" && (
                <ConnectorsTab productId={productId} />
              )}
              {vm.activeTab === "stats" && <StatsTab />}
              {vm.activeTab === "settings" && <SettingsTab product={product} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
