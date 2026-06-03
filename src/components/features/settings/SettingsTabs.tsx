import React from "react";
import { Link } from "@tanstack/react-router";

const settingsTabs = [
  { to: "/settings/company", label: "Profil company" },
  { to: "/settings/users", label: "Utilisateurs" },
  { to: "/settings/roles", label: "Rôles" },
  { to: "/settings/channels", label: "Canaux" },
  { to: "/settings/blocklist", label: "Blocklist" },
  { to: "/settings/tags", label: "Tags" },
  { to: "/settings/notifications", label: "Notifications" },
];

export function SettingsTabs() {
  return (
    <div className="flex border-b border-[#E5E7EB] mb-6 overflow-x-auto">
      {settingsTabs.map((t) => (
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
