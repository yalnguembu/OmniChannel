import { useState, useEffect } from "react"

const LAPTOP_BREAKPOINT = 1200

export function useIsLaptop() {
  const [isLaptop, setIsLaptop] = useState<boolean>(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LAPTOP_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsLaptop(window.innerWidth < LAPTOP_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsLaptop(window.innerWidth < LAPTOP_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isLaptop
}
