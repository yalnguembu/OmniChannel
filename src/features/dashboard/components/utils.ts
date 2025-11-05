import React from "react"
import { ChartConfig } from "@/shared/components/ui/chart"
import { BaseChartData, ChartTheme } from "./types"

export const defaultMargin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
}

export const defaultColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"]

export const formatValue = (value: any): string => {
  if (value == null) return ""

  if (typeof value === "number") {
    const parts = value.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return parts.length > 1 ? parts.join(".") : parts[0]
  }

  return String(value)
}

export const formatPercentage = (value: number, total?: number): string => {
  if (total && total > 0) {
    return `${((value / total) * 100).toFixed(1)}%`
  }
  return `${value.toFixed(1)}%`
}

export const formatCurrency = (value: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value)
}

export const generateGradient = (id: string, color: string, opacity = 0.8) => {
  return React.createElement(
    "linearGradient",
    {
      key: id,
      id: id,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    },
    React.createElement("stop", {
      offset: "5%",
      stopColor: color,
      stopOpacity: opacity,
    }),
    React.createElement("stop", {
      offset: "95%",
      stopColor: color,
      stopOpacity: 0.1,
    }),
  )
}

export const getColorByIndex = (index: number, colors = defaultColors): string => {
  return colors[index % colors.length]
}

export const generateColorConfig = (data: BaseChartData[], keyField: string, colorScheme = defaultColors): ChartConfig => {
  const config: ChartConfig = {}

  data.forEach((item, index) => {
    const key = String(item[keyField])
    config[key] = {
      label: key,
      color: getColorByIndex(index, colorScheme),
    }
  })

  return config
}

export const calculateTotal = (data: BaseChartData[], key: string): number => {
  return data.reduce((total, item) => {
    const value = item[key]
    return total + (typeof value === "number" ? value : 0)
  }, 0)
}

export const sortDataByKey = <T extends BaseChartData>(data: T[], key: string, order: "asc" | "desc" = "desc"): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal)
    const bStr = String(bVal)
    return order === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
  })
}

export const filterDataByRange = <T extends BaseChartData>(data: T[], key: string, min?: number, max?: number): T[] => {
  return data.filter((item) => {
    const value = item[key]
    if (typeof value !== "number") return true

    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false

    return true
  })
}

export const getDataKeys = (data: BaseChartData[]): string[] => {
  if (data.length === 0) return []

  const firstItem = data[0]
  return Object.keys(firstItem).filter((key) => typeof firstItem[key] === "number")
}

export const validateData = (data: BaseChartData[]): { isValid: boolean; error?: string } => {
  if (!Array.isArray(data)) {
    return { isValid: false, error: "Data must be an array" }
  }

  if (data.length === 0) {
    return { isValid: false, error: "Data array cannot be empty" }
  }

  const firstItemKeys = Object.keys(data[0])
  for (let i = 1; i < data.length; i++) {
    const currentKeys = Object.keys(data[i])
    if (currentKeys.length !== firstItemKeys.length || !currentKeys.every((key) => firstItemKeys.includes(key))) {
      return { isValid: false, error: "All data items must have the same keys" }
    }
  }

  return { isValid: true }
}

export const exportToCSV = (data: BaseChartData[], filename = "chart-data.csv"): void => {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [headers.join(","), ...data.map((row) => headers.map((header) => `"${row[header]}"`).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToJSON = (data: BaseChartData[], filename = "chart-data.json"): void => {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const createChartTheme = (variant: "light" | "dark"): ChartTheme => {
  const lightTheme: ChartTheme = {
    colors: defaultColors,
    backgroundColor: "#ffffff",
    textColor: "#374151",
    gridColor: "#e5e7eb",
    borderColor: "#d1d5db",
  }

  const darkTheme: ChartTheme = {
    colors: defaultColors,
    backgroundColor: "#111827",
    textColor: "#f9fafb",
    gridColor: "#374151",
    borderColor: "#4b5563",
  }

  return variant === "dark" ? darkTheme : lightTheme
}

export const generateChartConfig = (keys: string[], colors?: string[]): ChartConfig => {
  const configColors = colors || defaultColors

  return keys.reduce((config, key, index) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: configColors[index % configColors.length],
    }
    return config
  }, {} as ChartConfig)
}

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
