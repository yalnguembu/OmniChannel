import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { InvoiceService, PaymentService } from "@/shared/api/services";
import { getApiPaymentMethodDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  DataTable,
  Pagination,
  type Column,
} from "@/components/data-table/DataTable";
import { formatDate, formatPeriod } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { InvoiceDto } from "@/shared/api/types";

const billingTabs = [
  { to: "/billing/wallet", label: "Wallet" },
  { to: "/billing/transactions", label: "Transactions" },
  { to: "/billing/invoices", label: "Factures" },
  { to: "/billing/subscription", label: "Abonnement" },
  { to: "/billing/payment-methods", label: "Méthodes de paiement" },
];

const statusV = (s: string): "success" | "warning" | "error" | "neutral" =>
  s === "paid"
    ? "success"
    : s === "pending"
      ? "warning"
      : s === "overdue"
        ? "error"
        : "neutral";

const statusLabels: Record<string, string> = {
  paid: "Payée",
  pending: "En attente",
  overdue: "En retard",
  cancelled: "Annulée",
};

export function BillingInvoicesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Invoice to pay (triggers pay modal)
  const [payTarget, setPayTarget] = useState<InvoiceDto | null>(null);
  const [payMethodId, setPayMethodId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", page],
    queryFn: () => InvoiceService.search({ pageNumber: page, pageSize }) as any,
  });

  // Payment methods dropdown
  const { data: methodsData } = useQuery({
    ...getApiPaymentMethodDropdownOptions(),
    select: (res: any) =>
      (res?.data ?? []) as { id: string; name: string; type?: string }[],
  });
  const paymentMethods = methodsData ?? [];

  const qc = useQueryClient();
  const invoices: InvoiceDto[] = data?.data?.items ?? [];
  const total: number = data?.data?.totalCount ?? 0;

  const payMutation = useMutation({
    mutationFn: () =>
      PaymentService.create({
        invoiceId: payTarget!.id,
        amount: payTarget!.total,
        currency: payTarget!.currency,
        paymentMethodId: payMethodId || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Paiement initié");
      setPayTarget(null);
      setPayMethodId("");
    },
    onError: () => toast.error("Erreur lors du paiement"),
  });

  const columns: Column<InvoiceDto>[] = [
    {
      key: "invoiceNumber",
      label: "Numéro",
      width: "140px",
      render: (inv) => (
        <span className="font-mono text-[12px] text-[#4A7A94]">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      key: "period",
      label: "Période",
      width: "180px",
      render: (inv) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {formatPeriod(inv.billingPeriodStart, inv.billingPeriodEnd)}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: () => (
        <span className="text-[12.5px]">
          Abonnement + consommation messages
        </span>
      ),
    },
    {
      key: "total",
      label: "Montant TTC",
      width: "130px",
      render: (inv) => (
        <span className="font-semibold text-[13px]">
          {formatCurrency(inv.total, inv.currency)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "120px",
      render: (inv) => (
        <Badge variant={statusV(inv.status)}>
          {statusLabels[inv.status] ?? inv.status}
        </Badge>
      ),
    },
    {
      key: "dueDate",
      label: "Échéance",
      width: "110px",
      render: (inv) => (
        <span
          className={cn(
            "text-[12px]",
            inv.status === "overdue" ? "text-[#DC2626]" : "text-[#8BAFC0]",
          )}
        >
          {inv.paidAt
            ? `Payée le ${formatDate(inv.paidAt)}`
            : inv.dueDate
              ? formatDate(inv.dueDate)
              : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "100px",
      render: (inv) => (
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              toast.info("Le téléchargement PDF n'est pas encore disponible.")
            }
          >
            <FileText size={11} />
            PDF
          </Button>
          {inv.status === "pending" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setPayTarget(inv);
                setPayMethodId(paymentMethods[0]?.id ?? "");
              }}
            >
              Payer
            </Button>
          )}
        </div>
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

      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        getRowId={(inv) => inv.id}
        emptyTitle="Aucune facture"
        emptyDescription="Les factures apparaissent ici après chaque période de facturation"
      />
      <Pagination
        total={total}
        pageSize={pageSize}
        page={page}
        onChange={setPage}
      />

      {/* Pay confirmation modal */}
      <Modal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        title="Confirmer le paiement"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              loading={payMutation.isPending}
              disabled={!payMethodId}
              onClick={() => payMutation.mutate()}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px] p-3.5">
            <div className="flex justify-between text-[12.5px] mb-1">
              <span className="text-[#8BAFC0]">Facture</span>
              <span className="font-mono text-[#4A7A94]">
                {payTarget?.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold">
              <span>Montant</span>
              <span>
                {payTarget
                  ? formatCurrency(payTarget.total, payTarget.currency)
                  : "—"}
              </span>
            </div>
          </div>

          {paymentMethods.length > 0 ? (
            <Select
              label="Méthode de paiement *"
              value={payMethodId}
              onChange={(e) => setPayMethodId(e.target.value)}
              options={[
                { value: "", label: "Sélectionner une méthode" },
                ...paymentMethods.map((m) => ({
                  value: m.id,
                  label: m.name ?? m.type ?? m.id,
                })),
              ]}
            />
          ) : (
            <div className="text-[12.5px] text-[#8BAFC0] bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px] p-3">
              Aucune méthode de paiement configurée.{" "}
              <a
                href="/billing/payment-methods"
                className="text-[#2E8FAD] underline"
              >
                Ajouter une méthode
              </a>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
