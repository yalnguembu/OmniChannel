import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { postApiDailyMetricSearchOptions, postApiDailyMetricsByPaymentMethodSearchOptions, postApiBalancesReadModelSearchOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useDashboard = () => {
  const [dateRange, setDateRange] = useState<any>()
  const [timeRange, setTimeRange] = useState("7d")

  // Memoize the effective date range to prevent infinite loops
  const effectiveDateRange = useMemo(() => {
    if (dateRange) {
      return dateRange
    }

    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    }
  }, [dateRange, timeRange])

  // Fetch daily metrics
  const metricsQuery = useQuery({
    ...postApiDailyMetricSearchOptions({
      body: {
        pageNumber: 1,
        pageSize: 100,
        // sortBy: "metricDate",
        // sortDirection: "Descending",
        // startDate: effectiveDateRange.startDate,
        // endDate: effectiveDateRange.endDate,
      },
    }),
    select: (data) => {
      if (data.success && data.data) {
        return Array.isArray(data.data.items) ? data.data.items : []
      }
      return []
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch payment method metrics
  const paymentMethodMetricsQuery = useQuery({
    ...postApiDailyMetricsByPaymentMethodSearchOptions({
      body: {
        pageNumber: 1,
        pageSize: 100,
        // sortBy: "metricDate",
        // sortDirection: "Descending",
        // startDate: effectiveDateRange.startDate,
        // endDate: effectiveDateRange.endDate,
      },
    }),
    select: (data) => {
      if (data.success && data.data) {
        return Array.isArray(data.data.items) ? data.data.items : []
      }
      return []
    },
    retry: false,
  })

  // Fetch balances
  const balancesQuery = useQuery({
    ...postApiBalancesReadModelSearchOptions({
      body: {
        pageNumber: 1,
        pageSize: 100,
      },
    }),
    select: (data) => {
      if (data.success && data.data) {
        return Array.isArray(data.data.items) ? data.data.items : []
      }
      return []
    },
    retry: false,
  })

  return {
    // Data
    metrics: metricsQuery.data || [],
    paymentMethodMetrics: paymentMethodMetricsQuery.data || [],
    balances: balancesQuery.data || [],

    // Loading states
    isLoadingMetrics: metricsQuery.isLoading,
    isLoadingPaymentMethods: paymentMethodMetricsQuery.isLoading,
    isLoadingBalances: balancesQuery.isLoading,
    isLoading: metricsQuery.isLoading || paymentMethodMetricsQuery.isLoading || balancesQuery.isLoading,

    // Error states
    metricsError: metricsQuery.error,
    paymentMethodsError: paymentMethodMetricsQuery.error,
    balancesError: balancesQuery.error,

    // Refetch functions
    refetchMetrics: metricsQuery.refetch,
    refetchPaymentMethods: paymentMethodMetricsQuery.refetch,
    refetchBalances: balancesQuery.refetch,

    // State management
    dateRange,
    setDateRange,
    timeRange,
    setTimeRange,
  }
}
