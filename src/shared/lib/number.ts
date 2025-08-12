export const formatNumber = (value: number, locale: string = "en-US", options: Intl.NumberFormatOptions = {}): string => {
  return new Intl.NumberFormat(locale, options).format(value)
}

export const formatCurrency = (value: number, currency: string = "USD", locale: string = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value)
}

export const formatPercentage = (value: number, locale: string = "en-US", minimumFractionDigits: number = 1, maximumFractionDigits: number = 2): string => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100)
}

export const formatCompactNumber = (value: number, locale: string = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value)
}

export const roundNumber = (value: number, decimals: number = 2): number => {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals)
}

export const isValidNumber = (value: any): boolean => {
  return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value)
}

export const safeParseNumber = (value: string | number): number | null => {
  if (typeof value === "number") return value
  if (typeof value !== "string") return null

  const parsed = parseFloat(value)
  return isValidNumber(parsed) ? parsed : null
}

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const randomIntBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
