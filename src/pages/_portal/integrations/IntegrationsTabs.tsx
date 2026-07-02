import { Link } from "@tanstack/react-router";

/** Shared sub-navigation for the company Integrations section. */
const TABS = [
  { to: "/integrations", label: "Catalogue", exact: true },
  { to: "/integrations/connectors", label: "Connecteurs" },
  { to: "/integrations/webhooks", label: "Webhooks" },
  { to: "/integrations/api-keys", label: "API Keys" },
  { to: "/integrations/sync-logs", label: "Logs de sync" },
];

export function IntegrationsTabs() {
  return (
    <div className="flex border-b border-[#E5E7EB] mb-6">
      {TABS.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          activeOptions={t.exact ? { exact: true } : undefined}
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
