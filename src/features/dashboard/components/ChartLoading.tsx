import { ChartLoadingProps } from "./types"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

export function ChartLoading({ height = 350, className }: ChartLoadingProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      <Skeleton className="w-full rounded-lg" style={{ height: `${height}px` }} />

      <div className="flex justify-center space-x-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function ChartLoadingSpinner({ height = 350, className }: ChartLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center bg-muted/20 rounded-lg", className)} style={{ height: `${height}px` }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
