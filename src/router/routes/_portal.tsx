import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";
import { isSystemUser } from "@/lib/auth";

export const Route = createFileRoute("/_portal")({
  beforeLoad: () => {
    const { isAuthenticated, user, requiresPasswordChange } =
      useAuthStore.getState();
    // if (!isAuthenticated) throw redirect({ to: "/login" });
    if (isAuthenticated && requiresPasswordChange) {
      // throw redirect({ to: "/change-password" });
    }
    // The portal is for company members only — send system staff to the backoffice.
    if (isAuthenticated && isSystemUser(user?.userType)) {
      throw redirect({ to: "/admin" });
    }
  },
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <div
      className="grid h-screen overflow-hidden"
      style={{ gridTemplateColumns: "220px 1fr" }}
    >
      <Sidebar />
      <div className="flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F4F5F6]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
