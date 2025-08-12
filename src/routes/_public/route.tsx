import { createFileRoute, Outlet } from "@tanstack/react-router"
import Navbar from "@/shared/components/Navbar"
import Footer from "@/shared/components/Footer"

export const Route = createFileRoute("/_public")({
  component: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
})
