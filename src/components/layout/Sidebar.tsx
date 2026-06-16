import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Plug,
  Settings,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import { cn, getInitials, avatarColor } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { OctoLogo } from "@/pages/landing/components/OctoLogo";
import { PRODUCT_TABS } from "@/components/features/products/detail/ProductDetailTabs";

const PRODUCT_SECTIONS = new Set<string>(PRODUCT_TABS.map((t) => t.id));

const STATIC_TOP = new Set<string>([
  "dashboard",
  "products",
  "contacts",
  "campaigns",
  "templates",
  "messages",
  "billing",
  "integrations",
  "files",
  "settings",
  "admin",
  "whatsapp",
]);

const nav = [
  {
    section: "",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Principal",
    items: [{ to: "/products", label: "Produits", icon: Package }],
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

  const seg = currentPath.split("/").filter(Boolean);
  const activeProductId =
    seg.length >= 2 && !STATIC_TOP.has(seg[0]) && PRODUCT_SECTIONS.has(seg[1])
      ? seg[0]
      : undefined;
  const productTo = (tabId: string) => `/${activeProductId}/${tabId}`;

  return (
    <aside className="bg-white border-r border-[#E5E7EB]/60 flex flex-col h-screen overflow-hidden">
      <Link
        to="/"
        className="flex items-center gap-2.5 px-4 py-2 border-b border-[#E5E7EB]/60 shrink-0"
      >
        <OctoLogo size={40} />
        <span className="text-[14px] font-semibold text-[#0D2137] tracking-tight">
          Omni Channel
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
            {section && (
              <p className="px-4 pt-6 pb-1.5 text-[10px] font-semibold text-[#B8CDD8] uppercase tracking-widest">
                {section}
              </p>
            )}
            {items.map(({ to, label, icon: Icon }) => {
              if (to === "/products" && activeProductId) {
                return (
                  <div key={to}>
                    {PRODUCT_TABS.map(
                      ({ id, label: tabLabel, icon: TabIcon }) => {
                        const tabTo = productTo(id);
                        const tabActive = currentPath === tabTo;
                        return (
                          <Link
                            key={id}
                            to={tabTo}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-[6px] cursor-pointer transition-all duration-150 relative group",
                              tabActive ? "bg-[#E8F4F8]" : "hover:bg-[#F0F2F4]",
                            )}
                          >
                            {tabActive && (
                              <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#2E8FAD] rounded-r-[2px]" />
                            )}
                            <TabIcon
                              size={15}
                              className={cn(
                                "shrink-0",
                                tabActive ? "text-[#2E8FAD]" : "text-[#8BAFC0]",
                              )}
                              strokeWidth={1.2}
                            />
                            <span
                              className={cn(
                                "text-[13px] flex-1",
                                tabActive
                                  ? "text-[#1B5E82] font-medium"
                                  : "text-[#4A7A94]",
                              )}
                            >
                              {tabLabel}
                            </span>
                          </Link>
                        );
                      },
                    )}
                  </div>
                );
              }

              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-sm cursor-pointer transition-all duration-150 relative group",
                    active ? "bg-[#E8F4F8]" : "hover:bg-[#F0F2F4]",
                  )}
                >
                  {active && (
                    <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#2E8FAD] rounded-r-[2px]" />
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
