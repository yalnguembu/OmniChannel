import { useState, useEffect, useMemo } from "react"
import { BreakPoint, DataGridViewMode, ViewMode } from "../types/data-grid"

const defaultViewMode: DataGridViewMode = {
  sm: "grid",
  md: "grid",
  lg: "list",
  xl: "list",
  xl2: "list",
}
export function useViewMode(viewMode: DataGridViewMode = defaultViewMode) {
  const [screenBreakPoint, setScreenBreakPoint] = useState<BreakPoint>("sm")

  useEffect(() => {
    const updateMobileStatus = () => {
      setScreenBreakPoint(innerWidth < 768 ? "sm" : innerWidth < 1024 ? "md" : innerWidth < 1280 ? "lg" : innerWidth < 1280 ? "xl" : "xl2")
    }

    updateMobileStatus()
    window.addEventListener("resize", updateMobileStatus)

    return () => {
      window.removeEventListener("resize", updateMobileStatus)
    }
  }, [])

  const view = useMemo((): ViewMode => {
    if (viewMode == "list") return "list"
    else if (viewMode == "grid") return "grid"
    else return viewMode[screenBreakPoint]
  }, [viewMode, screenBreakPoint])

  return view
}
