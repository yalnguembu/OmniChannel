import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface CollapsibleContainerProps {
  isCollapsible?: boolean
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  children: React.ReactNode
  className?: string
  header: React.ReactNode
}

export const CollapsibleContainer: React.FC<CollapsibleContainerProps> = ({
  isCollapsible = true,
  defaultCollapsed = false,
  collapsed,
  onCollapsedChange,
  children,
  className,
  header
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Update internal state when external collapsed prop changes
  useEffect(() => {
    if (collapsed !== undefined) {
      setIsCollapsed(collapsed)
    }
  }, [collapsed])

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  return (
    <div className={cn("border rounded-lg bg-background", className)}>
      <div className="flex items-center justify-between">
        {header}

        {isCollapsible && (
          <div className="pr-2 md:pr-4">
            <Button type="button" variant="ghost" size="sm" onClick={toggleCollapse}>
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {!isCollapsed && children}
    </div>
  )
}
