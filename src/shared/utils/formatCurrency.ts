/**
 * Format currency amount dynamically based on its value
 * @param amount - The amount to format
 * @param currency - Currency code (default: "XAF")
 * @returns Formatted string with appropriate suffix (K, M, B) and decimal places
 */
export const formatCurrency = (amount: number, currency: string = "XAF"): string => {
  const parts = amount.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${parts.length > 1 ? parts.join(".") : parts[0]} ${currency}`
}

/**
 * Format currency amount without currency symbol (for charts and compact displays)
 * @param amount - The amount to format
 * @returns Formatted string by adding space after tree digits
 */
export const formatAmount = (amount: number): string => {
  const parts = amount.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return parts.length > 1 ? parts.join(".") : parts[0]
}
