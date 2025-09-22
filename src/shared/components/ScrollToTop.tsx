import { useEffect } from "react"
import { useLocation } from "@tanstack/react-router"

export function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }, [location.pathname])

  return null
}
