import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethodService } from "@/shared/api/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/feedback/PageLoader";
import { cn } from "@/lib/utils";
import type { PaymentMethodDto } from "@/api/generated/types";

const billingTabs = [
  { to: "/billing/wallet", label: "Wallet" },
  { to: "/billing/transactions", label: "Transactions" },
  { to: "/billing/invoices", label: "Factures" },
  { to: "/billing/subscription", label: "Abonnement" },
  { to: "/billing/payment-methods", label: "Méthodes de paiement" },
];

export function BillingPaymentMethodsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => PaymentMethodService.search({ pageNumber: 1, pageSize: 20 }) as any,
  });

  const methods: PaymentMethodDto[] = data?.data?.items ?? [];

  if (isLoading) return <PageLoader />;

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

      <div className="max-w-[620px]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-[#0D2137]">
            Méthodes disponibles
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              toast.info(
                "Les méthodes de paiement disponibles sont gérées par la plateforme.",
              )
            }
          >
            <Plus size={13} />
            Ajouter
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {methods.map((m, i) => (
            <div
              key={m.id}
              className={cn(
                "flex items-center gap-3.5 p-4 border rounded-[10px] cursor-pointer hover:shadow-[0_3px_12px_rgba(13,33,55,0.06)] transition-all",
                i === 0
                  ? "border-[#2E8FAD]/35 bg-[#E8F4F8]"
                  : "border-[#E5E7EB] bg-white hover:border-[#6AB8D4]",
              )}
            >
              <div
                className="w-[42px] h-[28px] rounded-[6px] flex items-center justify-center text-[10px] font-bold border border-black/10 shrink-0"
                style={{ background: "#F0F2F4" }}
              >
                {m.code.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0D2137]">
                  {m.name}
                </p>
                <p className="text-[11.5px] text-[#8BAFC0] mt-0.5">
                  {m.description ??
                    `Min: ${m.minimumAmount?.toLocaleString("fr") ?? "—"} XAF`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {i === 0 && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#E8F4F8] text-[#1B5E82] border border-[#6AB8D4]/30">
                    Par défaut
                  </span>
                )}
                <Badge variant={m.isActive ? "success" : "neutral"}>
                  {m.isActive ? "Actif" : "Inactif"}
                </Badge>
                {i !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toast.info(
                        "La méthode de paiement par défaut est définie lors du rechargement.",
                      )
                    }
                  >
                    Définir par défaut
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Add new dashed */}
          <div
            onClick={() =>
              toast.info(
                "Les méthodes de paiement disponibles sont gérées par la plateforme.",
              )
            }
            className="flex items-center gap-3 p-4 border border-dashed border-[#E5E7EB] rounded-[10px] cursor-pointer hover:bg-white hover:border-[#2E8FAD]/40 hover:border-solid transition-all"
          >
            <div className="w-[42px] h-[28px] rounded-[6px] bg-[#F0F2F4] border border-[#E5E7EB] flex items-center justify-center">
              <Plus size={14} className="text-[#8BAFC0]" />
            </div>
            <span className="text-[13px] text-[#4A7A94]">
              Ajouter une méthode de paiement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
