import { useRef, useEffect } from "react"
import { useUIStore } from "@/shared/stores/uiStore"
import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import LoadingBar from "react-top-loading-bar"

export const TopLoadingBar = () => {
  const ref = useRef<any>(null)
  const { isLoading } = useUIStore()

  const isFetching = useIsFetching()
  const isMutating = useIsMutating()

  const loading = isFetching > 0 || isMutating > 0 || isLoading

  useEffect(() => {
    if (loading) {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [loading])

  return <LoadingBar color="var(--primary)" ref={ref} />
}
