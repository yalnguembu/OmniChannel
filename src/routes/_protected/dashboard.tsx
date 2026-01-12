import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"

import PageLoader from "@/shared/components/PageLoader"
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-grow flex-col items-center justify-center bg-gray-100 px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-xl text-gray-600">Oops! Page not found.</p>
        <p className="mt-2 text-gray-500">The page you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/" className="mt-8">
          <Button className="bg-primary text-white hover:bg-violet-600">Go to Homepage</Button>
        </Link>
      </main>
    </div>
  )
}

export const Route = createFileRoute("/_protected/dashboard")({
  pendingComponent: PageLoader,
  component: NotFoundPage,
})
