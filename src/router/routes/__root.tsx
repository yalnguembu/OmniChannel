import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { RouterContext } from '../routerContext'

const AppLoader = () => {
  return <div>App Loading</div>
}
export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  ),
  pendingComponent: AppLoader
})
