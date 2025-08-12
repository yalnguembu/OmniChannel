import { createRouter, RouterProvider } from "@tanstack/react-router"
import { ReactNode } from "react"
import { routeTree } from "../../routeTree.gen"

export const router = createRouter({ routeTree })

interface RouterProviderWrapperProps {
  children?: ReactNode
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
export function RouterProviderWrapper(_props: RouterProviderWrapperProps) {
  return <RouterProvider router={router} />
}
