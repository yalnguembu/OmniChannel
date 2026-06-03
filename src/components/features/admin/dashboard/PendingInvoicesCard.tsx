import { useNavigate } from "@tanstack/react-router";
import { DollarSign, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import type { InvoiceDto } from "@/shared/api/generated/types.gen";

interface PendingInvoicesCardProps {
  pendingInvoices: InvoiceDto[];
}

export function PendingInvoicesCard({
  pendingInvoices,
}: PendingInvoicesCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Factures en attente"
        action={
          <button
            onClick={() => navigate({ to: "/admin/billing/invoices" })}
            className="flex items-center gap-1 text-[12px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors cursor-pointer"
          >
            Tout voir <ArrowRight size={11} />
          </button>
        }
      />
      <CardBody className="p-0">
        {pendingInvoices.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-[13px] text-[#8BAFC0]">
            <DollarSign size={24} className="mr-3 opacity-30" />
            Aucune facture en attente
          </div>
        ) : (
          pendingInvoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F7F8F9] cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[13px] font-medium text-[#0D2137] font-mono">
                  {inv.invoiceNumber}
                </p>
                <p className="text-[11.5px] text-[#8BAFC0]">
                  Échéance: {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-semibold text-[#0D2137]">
                  {formatCurrency(inv.total, inv.currency)}
                </p>
                <Badge variant="warning" dot>
                  En attente
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
