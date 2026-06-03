import React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const billingTabs = [
  { to: "/billing/wallet", label: "Wallet" },
  { to: "/billing/transactions", label: "Transactions" },
  { to: "/billing/invoices", label: "Factures" },
  { to: "/billing/subscription", label: "Abonnement" },
  { to: "/billing/payment-methods", label: "Méthodes de paiement" },
];

export function BillingTabs() {
  return (
    <div className="flex border-b border-[#E5E7EB] mb-6">
      {billingTabs.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          className={cn(
            "px-4 py-2.5 text-[13px] border-b-2 transition-all whitespace-nowrap",
            "[&.active]:text-[#1B5E82] [&.active]:font-medium [&.active]:border-[#2E8FAD]",
            "text-[#4A7A94] border-transparent hover:text-[#0D2137]",
          )}
          activeProps={{
            className:
              "text-[#1B5E82] font-medium border-b-2 border-[#2E8FAD]",
          }}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
