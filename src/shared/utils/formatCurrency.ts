/**
 * Format currency amount dynamically based on its value
 * @param amount - The amount to format
 * @param currency - Currency code (default: "XAF")
 * @returns Formatted string with appropriate suffix (K, M, B) and decimal places
 */
export const formatCurrency = (amount: number, currency: string = "XAF"): string => {
  const absAmount = Math.abs(amount)

  // Less than 1,000 - show as is with no decimals
  if (absAmount < 1000) {
    return `${amount.toFixed(0)} ${currency}`
  }

  // 1,000 to 999,999 - show in K with 1-2 decimals
  if (absAmount < 1000000) {
    const value = amount / 1000
    const decimals = value % 1 === 0 ? 0 : value < 10 ? 2 : 1
    return `${value.toFixed(decimals)}K ${currency}`
  }

  // 1,000,000 to 999,999,999 - show in M with 1-3 decimals
  if (absAmount < 1000000000) {
    const value = amount / 1000000
    const decimals = value % 1 === 0 ? 0 : value < 10 ? 3 : value < 100 ? 2 : 1
    return `${value.toFixed(decimals)}M ${currency}`
  }

  // 1,000,000,000 and above - show in B with 1-3 decimals
  const value = amount / 1000000000
  const decimals = value % 1 === 0 ? 0 : value < 10 ? 3 : value < 100 ? 2 : 1
  return `${value.toFixed(decimals)}B ${currency}`
}

/**
 * Format currency amount without currency symbol (for charts and compact displays)
 * @param amount - The amount to format
 * @returns Formatted string with appropriate suffix (K, M, B) and decimal places
 */
export const formatAmount = (amount: number): string => {
  const absAmount = Math.abs(amount)

  if (absAmount < 1000) {
    return amount.toFixed(0)
  }

  if (absAmount < 1000000) {
    const value = amount / 1000
    const decimals = value % 1 === 0 ? 0 : value < 10 ? 2 : 1
    return `${value.toFixed(decimals)}K`
  }

  if (absAmount < 1000000000) {
    const value = amount / 1000000
    const decimals = value % 1 === 0 ? 0 : value < 10 ? 3 : value < 100 ? 2 : 1
    return `${value.toFixed(decimals)}M`
  }

  const value = amount / 1000000000
  const decimals = value % 1 === 0 ? 0 : value < 10 ? 3 : value < 100 ? 2 : 1
  return `${value.toFixed(decimals)}B`
}
