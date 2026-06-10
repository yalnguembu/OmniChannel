import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Building,
  Users,
  Radio,
  Ban,
  Tag,
  Bell,
  AlertTriangle,
  ShieldCheck,
  Send,
} from "lucide-react";

interface SettingsGroup {
  title: string;
  items: Array<{
    to: string;
    label: string;
    icon: React.ReactNode;
  }>;
  variant?: "default" | "danger";
}

const settingsGroups: SettingsGroup[] = [
  {
    title: "COMPTE",
    items: [
      { to: "/settings/company", label: "Profil company", icon: <Building size={16} /> },
      { to: "/settings/users", label: "Utilisateurs", icon: <Users size={16} /> },
      { to: "/settings/security", label: "Sessions & appareils", icon: <ShieldCheck size={16} /> },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { to: "/settings/channels", label: "Canaux actifs", icon: <Radio size={16} /> },
      { to: "/settings/senders", label: "Expéditeurs", icon: <Send size={16} /> },
      { to: "/settings/blocklist", label: "Blocklist", icon: <Ban size={16} /> },
      { to: "/settings/tags", label: "Tags", icon: <Tag size={16} /> },
    ],
  },
  {
    title: "PRÉFÉRENCES",
    items: [
      { to: "/settings/notifications", label: "Notifications", icon: <Bell size={16} /> },
    ],
  },
  {
    title: "DANGER",
    variant: "danger",
    items: [
      { to: "/settings/roles", label: "Zone de danger", icon: <AlertTriangle size={16} /> },
    ],
  },
];

export function SettingsSidebar() {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-[#E5E7EB] bg-[#F9FAFB]">
      <nav className="space-y-6 p-4">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2.5">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-md transition-all whitespace-nowrap ${
                    group.variant === "danger"
                      ? "text-[#DC2626] hover:bg-red-50"
                      : "text-[#4A7A94] hover:bg-[#E5EFF4] hover:text-[#0D2137]"
                  }`}
                  activeProps={{
                    className: `${
                      group.variant === "danger"
                        ? "!bg-red-100 !text-[#DC2626] font-medium"
                        : "!bg-[#D8ECF5] !text-[#1B5E82] font-medium"
                    }`,
                  }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
