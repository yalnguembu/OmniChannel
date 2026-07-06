import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* ── Desktop layout ── */}
      <div
        className="hidden md:grid h-screen overflow-hidden"
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

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[#F4F5F6]">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={[
          "md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={[
          "md:hidden fixed inset-y-0 left-0 z-50 w-[220px] transition-transform duration-300 ease-in-out shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
    </>
  );
}
