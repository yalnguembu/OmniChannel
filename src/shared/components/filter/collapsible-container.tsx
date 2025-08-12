import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface CollapsibleContainerProps {
  isCollapsible?: boolean
  defaultCollapsed?: boolean
  children: React.ReactNode
  className?: string
  header: React.ReactNode
}

export const CollapsibleContainer: React.FC<CollapsibleContainerProps> = ({ isCollapsible = true, defaultCollapsed = false, children, className, header }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
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
