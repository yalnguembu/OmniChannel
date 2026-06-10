import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatDate } from "@/lib/date";
import { statusLabel } from "@/lib/utils";
import type { SearchSubscriptionResponse } from "@/shared/api/generated/types.gen";

interface CompanySubscriptionTabProps {
  subscription: SearchSubscriptionResponse | null;
}

export function CompanySubscriptionTab({
  subscription,
}: CompanySubscriptionTabProps) {
  if (!subscription) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-10 text-[13px] text-[#8BAFC0]">
            <Shield size={24} className="mr-3 opacity-30" />
            Aucun abonnement actif pour cette company
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader
          title="Abonnement actif"
          action={
            <Badge
              variant={subscription.status === "active" ? "success" : "warning"}
              dot
            >
              {statusLabel(subscription.status ?? "")}
            </Badge>
          }
        />
        <CardBody className="p-0">
          {[
            { k: "Plan", v: subscription.planId },
            {
              k: "Cycle",
              v:
                subscription.billingCycle === "monthly" ? "Mensuel" : "Annuel",
            },
            {
              k: "Début période",
              v: subscription.currentPeriodStart
                ? formatDate(subscription.currentPeriodStart)
                : "—",
            },
            {
              k: "Fin période",
              v: subscription.currentPeriodEnd
                ? formatDate(subscription.currentPeriodEnd)
                : "—",
            },
            {
              k: "Quota utilisé",
              v:
                subscription.usedQuota != null
                  ? subscription.usedQuota.toLocaleString("fr") + " messages"
                  : "—",
            },
            {
              k: "Renouvellement auto",
              v: subscription.autoRenew ? "Oui" : "Non",
            },
            {
              k: "Annulé le",
              v: subscription.cancelledAt
                ? formatDate(subscription.cancelledAt)
                : "—",
            },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-start justify-between px-5 py-2.5 border-b border-[#E5E7EB] last:border-b-0"
            >
              <span className="text-[12px] text-[#8BAFC0] shrink-0">
                {row.k}
              </span>
              <span className="text-[13px] text-[#0D2137] text-right ml-4">
                {row.v}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>
      {subscription.usedQuota != null && (
        <Card>
          <CardHeader title="Utilisation quota" />
          <CardBody>
            <p className="text-[32px] font-semibold text-[#0D2137] tracking-tight mb-1">
              {subscription.usedQuota.toLocaleString("fr")}
            </p>
            <p className="text-[12.5px] text-[#8BAFC0] mb-4">
              messages envoyés cette période
            </p>
            <div className="h-2 bg-[#F0F2F4] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2E8FAD]"
                style={{ width: "35%" }}
              />
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
