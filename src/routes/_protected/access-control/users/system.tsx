import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/access-control/users/system")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/users/system"!</div>
}
