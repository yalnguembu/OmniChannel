import { Link } from "@tanstack/react-router";

const adminBillingTabs = [
  { to: "/admin/billing/invoices", label: "Factures" },
  { to: "/admin/billing/payments", label: "Paiements" },
  { to: "/admin/billing/transactions", label: "Transactions wallet" },
];

export function AdminBillingTabs() {
  return (
    <div className="flex border-b border-[#E5E7EB] mb-6">
      {adminBillingTabs.map((t) => (
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
  );
}
