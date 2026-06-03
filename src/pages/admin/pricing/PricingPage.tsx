import { motion } from "framer-motion";
import { Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { Pagination } from "@/components/data-table/DataTable";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { cn } from "@/lib/utils";
import { staggerContainer } from "@/lib/animations";
import { useAdminPricingViewModel } from "@/hooks/admin/useAdminPricingViewModel";
import { PlanCard } from "@/components/features/admin/pricing/PlanCard";
import { PlansTable } from "@/components/features/admin/pricing/PlansTable";
import { PricingCard } from "@/components/features/admin/pricing/PricingCard";
import { PricingTable } from "@/components/features/admin/pricing/PricingTable";
import { PlanFormModal } from "@/components/features/admin/pricing/PlanFormModal";
import { PricingFormModal } from "@/components/features/admin/pricing/PricingFormModal";

export default function PricingPage() {
  const vm = useAdminPricingViewModel();

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Tarification
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            Plans d'abonnement et grille tarifaire
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 border-b border-[#E5E7EB]">
        {(
          [
            ["plans", "Plans"],
            ["pricing", "Grille tarifaire"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => vm.setActiveTab(id)}
            className={cn(
              "px-4 py-2.5 text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap mb-[-1px]",
              vm.activeTab === id
                ? "text-[#1B5E82] font-medium border-[#2E8FAD]"
                : "text-[#4A7A94] border-transparent hover:text-[#0D2137]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {vm.activeTab === "plans" && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] text-[#4A7A94]">
              {vm.plans.length} plan{vm.plans.length !== 1 ? "s" : ""} configuré
              {vm.plans.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <ViewToggle view={vm.plansView} onChange={vm.setPlansView} />
              <Can perform={ACTION.SUBSCRIPTIONPLAN_WRITE}>
                <Button variant="primary" onClick={vm.handleOpenCreatePlan}>
                  <Plus size={13} />
                  Nouveau plan
                </Button>
              </Can>
            </div>
          </div>
          {vm.isLoadingPlans ? (
            <PageLoader />
          ) : vm.plans.length === 0 ? (
            <EmptyState
              icon={<DollarSign size={32} />}
              title="Aucun plan"
              description="Créez vos premiers plans d'abonnement"
              action={
                <Can perform={ACTION.SUBSCRIPTIONPLAN_WRITE}>
                  <Button variant="primary" onClick={vm.handleOpenCreatePlan}>
                    <Plus size={13} />
                    Nouveau plan
                  </Button>
                </Can>
              }
            />
          ) : vm.plansView === "card" ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-3 gap-4"
            >
              {vm.plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  onEdit={() => vm.handleOpenEditPlan(p)}
                />
              ))}
            </motion.div>
          ) : (
            <PlansTable
              plans={vm.plans}
              isLoading={vm.isLoadingPlans}
              onEdit={vm.handleOpenEditPlan}
            />
          )}
        </>
      )}

      {vm.activeTab === "pricing" && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] text-[#4A7A94]">
              {vm.pricingTotal} tarif{vm.pricingTotal !== 1 ? "s" : ""} configuré
              {vm.pricingTotal !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <ViewToggle view={vm.pricingView} onChange={vm.setPricingView} />
              <Can perform={ACTION.PRICING_WRITE}>
                <Button variant="primary" onClick={vm.handleOpenCreatePricing}>
                  <Plus size={13} />
                  Nouveau tarif
                </Button>
              </Can>
            </div>
          </div>
          {vm.isLoadingPricing ? (
            <PageLoader />
          ) : vm.pricings.length === 0 ? (
            <EmptyState
              icon={<DollarSign size={32} />}
              title="Aucun tarif"
              description="Configurez votre grille tarifaire"
              action={
                <Can perform={ACTION.PRICING_WRITE}>
                  <Button
                    variant="primary"
                    onClick={vm.handleOpenCreatePricing}
                  >
                    <Plus size={13} />
                    Nouveau tarif
                  </Button>
                </Can>
              }
            />
          ) : vm.pricingView === "card" ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-3 mb-5"
            >
              {vm.pricings.map((p) => (
                <PricingCard
                  key={p.id}
                  pricing={p}
                  onEdit={() => vm.handleOpenEditPricing(p)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="mb-5">
              <PricingTable
                pricings={vm.pricings}
                isLoading={vm.isLoadingPricing}
                onEdit={vm.handleOpenEditPricing}
                onDelete={vm.handleDeletePricing}
              />
            </div>
          )}
          <Pagination
            total={vm.pricingTotal}
            pageSize={vm.pricingPageSize}
            page={vm.page}
            onChange={vm.setPage}
          />
        </>
      )}

      <PlanFormModal
        isOpen={vm.isPlanModalOpen}
        onClose={vm.handleClosePlanModal}
        editing={vm.editingPlan}
        onSubmit={vm.handleSubmitPlan}
        isPending={vm.isPlanActionPending}
      />

      <PricingFormModal
        isOpen={vm.isPricingModalOpen}
        onClose={vm.handleClosePricingModal}
        editing={vm.editingPricing}
        onSubmit={vm.handleSubmitPricing}
        isPending={vm.isPricingActionPending}
      />
    </div>
  );
}
