import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_public/legal-notice")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/terms"!</div>
}
