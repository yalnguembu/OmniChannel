import { createRootRoute, Outlet } from "@tanstack/react-router"
import { ScrollToTop } from "@/shared/components/ScrollToTop"

export const Route = createRootRoute({
  component: () => (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  ),
})
