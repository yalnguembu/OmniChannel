import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { InvoiceDto } from "@/shared/api/generated/types.gen";

interface PendingInvoicesAlertProps {
  pendingInvoices: InvoiceDto[];
  pendingInvoiceAmount: number;
}

export function PendingInvoicesAlert({
  pendingInvoices,
  pendingInvoiceAmount,
}: PendingInvoicesAlertProps) {
  const navigate = useNavigate();

  if (pendingInvoices.length === 0) return null;

  return (
    <div className="flex items-center gap-3 p-4 mb-5 bg-[#FEF3C7] border border-[#FCD34D] rounded-[12px]">
      <AlertCircle size={15} className="text-[#D97706] shrink-0" />
      <p className="text-[13px] text-[#D97706] flex-1">
        <strong>
          {pendingInvoices.length} facture
          {pendingInvoices.length > 1 ? "s" : ""} en attente
        </strong>{" "}
        — {formatCurrency(pendingInvoiceAmount)} à encaisser
      </p>
      <button
        onClick={() => navigate({ to: "/admin/billing/invoices" })}
        className="text-[12.5px] font-medium text-[#D97706] underline decoration-dotted cursor-pointer hover:no-underline"
      >
        Voir les factures →
      </button>
    </div>
  );
}
