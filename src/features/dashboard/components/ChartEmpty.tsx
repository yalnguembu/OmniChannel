import { BarChart3 } from "lucide-react"
import { ChartEmptyProps } from "./types"
import { cn } from "@/shared/lib/utils"

export function ChartEmpty({ message = "No data available", className }: ChartEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25", className)}>
      <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-sm font-medium text-muted-foreground mb-1">No Data</h3>
      <p className="text-xs text-muted-foreground/75 text-center max-w-sm">{message}</p>
    </div>
  )
}

export function ChartEmptyMinimal({ message = "No data", className }: ChartEmptyProps) {
  return <div className={cn("flex items-center justify-center p-4 text-xs text-muted-foreground", className)}>{message}</div>
}
