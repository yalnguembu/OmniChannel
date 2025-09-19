import { AlertTriangle, RefreshCw } from "lucide-react"
import { ChartErrorProps } from "./types"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { cn } from "@/shared/lib/utils"

export function ChartError({ error, onRetry, className }: ChartErrorProps) {
  return (
    <div className={cn("w-full", className)}>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Chart Error</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-2">
            <p className="text-sm">{error}</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function ChartErrorInline({ error, onRetry, className }: ChartErrorProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 bg-destructive/5 rounded-lg border border-destructive/20", className)}>
      <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
      <h3 className="text-sm font-medium text-destructive mb-1">Failed to load chart</h3>
      <p className="text-xs text-muted-foreground text-center mb-3 max-w-sm">{error}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  )
}
