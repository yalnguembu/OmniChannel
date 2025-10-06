import { createFileRoute } from "@tanstack/react-router"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_public/privacy")({
  pendingComponent: PageLoader,
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/terms"!</div>
}
