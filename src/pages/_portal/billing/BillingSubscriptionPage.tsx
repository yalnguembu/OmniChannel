import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  SubscriptionService,
  SubscriptionPlanService,
} from "@/shared/api/services";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { statusLabel, cn } from "@/lib/utils";
import type {
  SubscriptionDto,
  SubscriptionPlanDto,
} from "@/shared/api/types";

const billingTabs = [
  { to: "/billing/wallet", label: "Wallet" },
  { to: "/billing/transactions", label: "Transactions" },
  { to: "/billing/invoices", label: "Factures" },
  { to: "/billing/subscription", label: "Abonnement" },
  { to: "/billing/payment-methods", label: "Méthodes de paiement" },
];

export function BillingSubscriptionPage() {
  const { data: subData, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => SubscriptionService.search({ pageNumber: 1, pageSize: 1 }) as any,
  });

  const { data: plansData } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () =>
      SubscriptionPlanService.search({
        pageNumber: 1,
        pageSize: 10,
      }) as any,
  });

  const qc = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);

  const subscription: SubscriptionDto | undefined = subData?.data?.items?.[0];
  const plans: SubscriptionPlanDto[] = plansData?.data?.items ?? [];

  const updateMut = useMutation({
    mutationFn: (body: Partial<SubscriptionDto>) =>
      SubscriptionService.update(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      setCancelOpen(false);
      toast.success("Abonnement mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  if (isLoading) return <PageLoader />;

  const currentPlan = plans.find((p) => p.id === subscription?.planId);
  const usedPct = currentPlan?.monthlyQuota
    ? Math.round(
        ((subscription?.usedQuota ?? 0) / currentPlan.monthlyQuota) * 100,
      )
    : 0;

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

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Current plan card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg,#2E8FAD,#6AB8D4)" }}
          />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#8BAFC0] uppercase tracking-[0.08em] mb-1.5">
                Plan actuel
              </p>
              <p className="text-[22px] font-semibold text-[#0D2137] tracking-tight">
                {currentPlan?.name ?? "—"}
              </p>
            </div>
            {subscription && (
              <Badge
                variant={
                  subscription.status === "active" ? "success" : "warning"
                }
                dot
              >
                {statusLabel(subscription.status)}
              </Badge>
            )}
          </div>

          <div className="mb-1.5">
            <span className="text-[32px] font-semibold text-[#0D2137] tracking-tight">
              <sup className="text-[16px] font-normal align-top mt-2">XAF</sup>
              {currentPlan
                ? formatCurrency(
                    subscription?.billingCycle === "yearly"
                      ? (currentPlan.yearlyPrice ?? currentPlan.monthlyPrice)
                      : currentPlan.monthlyPrice,
                  ).split(" ")[0]
                : "—"}
            </span>
            <span className="text-[14px] text-[#8BAFC0]"> / mois</span>
          </div>
          <p className="text-[12px] text-[#8BAFC0] mb-5">
            {subscription?.billingCycle === "yearly"
              ? "Facturation annuelle"
              : "Facturation mensuelle"}{" "}
            · Renouvellement le{" "}
            {subscription?.currentPeriodEnd
              ? formatDate(subscription.currentPeriodEnd)
              : "—"}
          </p>

          {currentPlan?.monthlyQuota && (
            <div className="mb-5">
              <div className="flex justify-between text-[12px] text-[#8BAFC0] mb-1.5">
                <span>Quota messages utilisé</span>
                <span className="font-medium text-[#0D2137]">
                  {(subscription?.usedQuota ?? 0).toLocaleString("fr")} /{" "}
                  {currentPlan.monthlyQuota.toLocaleString("fr")}
                </span>
              </div>
              <div className="h-1.5 bg-[#F0F2F4] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, usedPct)}%`,
                    background: "linear-gradient(90deg,#2E8FAD,#6AB8D4)",
                  }}
                />
              </div>
              <p className="text-[11.5px] text-[#8BAFC0] mt-1">
                {usedPct}% utilisé
              </p>
            </div>
          )}

          {currentPlan?.features && (
            <div className="flex flex-col gap-2 mb-5">
              {currentPlan.features.map((f: string) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-[12.5px] text-[#4A7A94]"
                >
                  <Check size={13} className="text-[#16A34A] shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[12.5px] text-[#4A7A94]">
                Renouvellement auto
              </span>
              <Toggle
                checked={subscription?.autoRenew ?? true}
                onChange={(v) =>
                  subscription &&
                  updateMut.mutate({ ...subscription, autoRenew: v })
                }
              />
            </div>
            <Button
              variant="danger"
              size="sm"
              disabled={!subscription || subscription.status === "cancelled"}
              onClick={() => setCancelOpen(true)}
            >
              Résilier
            </Button>
          </div>
        </div>

        {/* Plan comparison */}
        <div>
          <p className="text-[13px] font-medium text-[#0D2137] mb-3">
            Changer de plan
          </p>
          <div className="grid grid-cols-1 gap-3">
            {plans.slice(0, 3).map((plan) => {
              const isCurrent = plan.id === subscription?.planId;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "border rounded-[14px] p-4 cursor-pointer transition-all",
                    isCurrent
                      ? "border-[#2E8FAD] bg-[#E8F4F8]"
                      : "border-[#E5E7EB] hover:border-[#6AB8D4] hover:shadow-[0_4px_16px_rgba(13,33,55,0.07)] hover:-translate-y-0.5",
                  )}
                >
                  {isCurrent && (
                    <p className="text-[10px] font-semibold text-[#1B5E82] uppercase tracking-[0.06em] mb-1">
                      Plan actuel
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-semibold text-[#0D2137]">
                      {plan.name}
                    </p>
                    <p className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
                      {formatCurrency(plan.monthlyPrice)}
                      <span className="text-[12px] font-normal text-[#8BAFC0]">
                        /mois
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      plan.maxProducts ? `${plan.maxProducts} produits` : null,
                      plan.monthlyQuota
                        ? `${(plan.monthlyQuota / 1000).toFixed(0)}k messages`
                        : null,
                      plan.maxUsers ? `${plan.maxUsers} users` : null,
                    ]
                      .filter(Boolean)
                      .map((f) => (
                        <div
                          key={f}
                          className="flex items-center gap-1 text-[11.5px] text-[#4A7A94]"
                        >
                          <Check
                            size={11}
                            className={
                              isCurrent ? "text-[#1B5E82]" : "text-[#8BAFC0]"
                            }
                          />
                          {f}
                        </div>
                      ))}
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                      loading={
                        updateMut.isPending &&
                        updateMut.variables?.planId === plan.id
                      }
                      onClick={() =>
                        subscription &&
                        updateMut.mutate({ ...subscription, planId: plan.id })
                      }
                    >
                      Changer →
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Résilier l'abonnement"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={updateMut.isPending}
              onClick={() =>
                subscription &&
                updateMut.mutate({
                  ...subscription,
                  status: "cancelled",
                  autoRenew: false,
                })
              }
            >
              Confirmer la résiliation
            </Button>
          </>
        }
      >
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[10px]">
          <p className="text-[13px] text-[#DC2626]">
            Votre abonnement restera actif jusqu'au{" "}
            <strong>
              {subscription?.currentPeriodEnd
                ? formatDate(subscription.currentPeriodEnd)
                : "terme de la période en cours"}
            </strong>
            , puis ne sera pas renouvelé.
          </p>
        </div>
      </Modal>
    </div>
  );
}
