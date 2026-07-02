import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Plug,
  DollarSign,
  FileText,
  MessageSquare,
  Radio,
  ScrollText,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { getInitials, avatarColor } from "@/lib/utils";
import { MyProfileModal } from "@/components/features/users/MyProfileModal";

const nav = [
  {
    section: "Plateforme",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/companies", label: "Companies", icon: Building2 },
      { to: "/admin/providers", label: "Providers", icon: Plug },
      { to: "/admin/pricing", label: "Tarification", icon: DollarSign },
    ],
  },
  {
    section: "Facturation",
    items: [
      { to: "/admin/billing/invoices", label: "Factures", icon: FileText },
      { to: "/admin/billing/payments", label: "Paiements", icon: DollarSign },
      {
        to: "/admin/billing/transactions",
        label: "Transactions",
        icon: MessageSquare,
      },
    ],
  },
  {
    section: "Messagerie",
    items: [
      { to: "/admin/messages", label: "Messages", icon: MessageSquare },
      { to: "/admin/channels", label: "Canaux", icon: Radio },
    ],
  },
  {
    section: "Monitoring",
    items: [
      { to: "/admin/logs/audit", label: "Audit log", icon: ScrollText },
      { to: "/admin/logs/system", label: "Logs système", icon: ScrollText },
      { to: "/admin/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const user = useAuthStore((s) => s.user);
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? currentPath === to : currentPath.startsWith(to);

  return (
    <aside className="bg-[#0D2137] flex flex-col h-screen overflow-hidden w-64 shrink-0">
      <Link
        to="/"
        className="flex  gap-2.5 px-4 py-[18px] border-b border-white/10 shrink-0"
      >
        <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="3.2" stroke="#6AB8D4" strokeWidth="1.3" />
            <path
              d="M9 2v2M9 14v2M2 9h2M14 9h2M3.93 3.93l1.41 1.41M12.66 12.66l1.41 1.41M3.93 14.07l1.41-1.41M12.66 5.34l1.41-1.41"
              stroke="#E8541A"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <span className="text-[13px] font-semibold text-white tracking-tight block pt-1">
            OmniChannel
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-[0.08em]">
            Backoffice
          </span>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-0">
        {nav.map(({ section, items }) => (
          <div key={section}>
            <p className="px-4 pt-5 pb-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              {section}
            </p>
            {items.map(({ to, label, icon: Icon, exact }) => {
              const active = isActive(to, exact);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-sm cursor-pointer transition-all duration-150 relative",
                    active ? "bg-white/10" : "hover:bg-white/5",
                  )}
                >
                  {active && (
                    <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0.75 h-4 bg-[#2E8FAD] rounded-r-[2px]" />
                  )}
                  <Icon
                    size={15}
                    className={cn(
                      "shrink-0",
                      active ? "text-[#6AB8D4]" : "text-white/40",
                    )}
                    strokeWidth={1.2}
                  />
                  <span
                    className={cn(
                      "text-[13px]",
                      active ? "text-white font-medium" : "text-white/60",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3.5 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          title="Mon profil"
          className="w-full flex items-center gap-2.5 rounded-[8px] p-1 -m-1 hover:bg-white/5 transition-all cursor-pointer text-left"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
            style={{
              background: avatarColor(user?.firstName ?? "A"),
              color: "#fff",
            }}
          >
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-white/40 truncate">Administrateur</p>
          </div>
          <ChevronRight size={14} className="text-white/30 shrink-0" />
        </button>
      </div>

      <MyProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </aside>
  );
}
