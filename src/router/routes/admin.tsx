import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuthStore } from "@/store/authStore";
import { useSession } from "@/hooks/useSession";
import { isCompanyUser } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const { isAuthenticated, user, requiresPasswordChange } =
      useAuthStore.getState();
    // if (!user || user.userType !== "system") throw redirect({ to: "/login" });
    if (isAuthenticated && requiresPasswordChange) {
      // throw redirect({ to: "/change-password" });
    }
    // The backoffice is for system staff only — send company members to the portal.
    if (isAuthenticated && isCompanyUser(user?.userType)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user, logout, isLoggingOut } = useSession();
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.fullName ||
    user?.email ||
    "Admin";

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[54px] bg-[#0D2137]/95 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <span className="text-[12.5px] font-medium text-white/70">
            Backoffice Admin
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-white/70">{displayName}</span>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              title="Se déconnecter"
              className="w-8 h-8 rounded-[6px] border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <LogOut size={15} strokeWidth={1.4} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-[#F4F5F6]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
