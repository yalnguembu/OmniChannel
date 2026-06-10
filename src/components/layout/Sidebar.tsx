import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  Megaphone,
  FileText,
  MessageSquare,
  CreditCard,
  Plug,
  Settings,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import { cn, getInitials, avatarColor } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
// import { useUIStore } from "@/store/uiStore";

const nav = [
  {
    section: "Principal",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/products", label: "Produits", icon: Package },
      { to: "/contacts", label: "Contacts", icon: Users },
      { to: "/campaigns", label: "Campagnes", icon: Megaphone, badge: 3 },
      { to: "/templates", label: "Templates", icon: FileText },
      { to: "/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    section: "Gestion",
    items: [
      { to: "/billing/wallet", label: "Facturation", icon: CreditCard },
      { to: "/integrations/connectors", label: "Intégrations", icon: Plug },
      { to: "/files", label: "Fichiers", icon: FolderOpen },
      { to: "/settings/company", label: "Paramètres", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isActive = (to: string) => currentPath.startsWith(to);

  return (
    <aside className="bg-white border-r border-[#E5E7EB]/60 flex flex-col h-screen overflow-hidden">
      <Link to="/" className="flex items-center gap-2.5 px-4 py-[18px] border-b border-[#E5E7EB]/60 shrink-0">
        <div className="w-8 h-8 rounded-[9px] bg-[#0D2137] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(13,33,55,0.2)]">
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
        <span className="text-[14px] font-semibold text-[#0D2137] tracking-tight">
          OmniChannel
        </span>
      </Link>

      <button className="mx-2.5 mt-3 mb-0.5 px-3 py-2.5 bg-[#E8F4F8] border border-[#2E8FAD]/20 rounded-md flex items-center justify-between cursor-pointer hover:bg-[#DFF0F8] transition-colors">
        <span className="text-[11.5px] font-medium text-[#1B5E82] truncate">
          {user?.companyName}
        </span>
        <ChevronDown size={10} className="text-[#8BAFC0] shrink-0" />
      </button>

      <nav className="flex-1 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-0">
        {nav.map(({ section, items }) => (
          <div key={section}>
            <p className="px-4 pt-5 pb-1.5 text-[10px] font-semibold text-[#B8CDD8] uppercase tracking-[0.1em]">
              {section}
            </p>
            {items.map(({ to, label, icon: Icon, badge }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-[6px] cursor-pointer transition-all duration-150 relative group",
                    active ? "bg-[#E8F4F8]" : "hover:bg-[#F0F2F4]",
                  )}
                >
                  {active && (
                    <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#2E8FAD] rounded-r-[2px]" />
                  )}
                  <Icon
                    size={15}
                    className={cn(
                      "shrink-0",
                      active ? "text-[#2E8FAD]" : "text-[#8BAFC0]",
                    )}
                    strokeWidth={1.2}
                  />
                  <span
                    className={cn(
                      "text-[13px] flex-1",
                      active ? "text-[#1B5E82] font-medium" : "text-[#4A7A94]",
                    )}
                  >
                    {label}
                  </span>
                  {badge != null && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FFF0EA] text-[#E8541A]">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3.5 border-t border-[#E5E7EB]/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold border border-[#2E8FAD]/25"
              style={{
                background: `linear-gradient(135deg, #E8F4F8, #C5E5F5)`,
                color: avatarColor(user?.firstName ?? "U"),
              }}
            >
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#16A34A] border-[1.5px] border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#0D2137] truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-[#8BAFC0] truncate">
              {user?.profileName} · {user?.companyName}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
