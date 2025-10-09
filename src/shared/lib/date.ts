import { DateFormat, Locale } from "@/shared/enums/common"

export const formatDate = (date: string | Date, format: DateFormat = DateFormat.SHORT, locale: Locale = Locale.FR_FR): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "-"
  }

  const options: Intl.DateTimeFormatOptions = getDateTimeOptions(format)
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

export const formatDateTime = (date: string | Date, locale: Locale = Locale.EN_US, includeSeconds: boolean = false): string => {
  const format = includeSeconds ? DateFormat.DATETIME_LONG : DateFormat.DATETIME_SHORT
  return formatDate(date, format, locale)
}

export const formatTime = (date: string | Date, includeSeconds: boolean = false, locale: Locale = Locale.EN_US): string => {
  const format = includeSeconds ? DateFormat.TIME_WITH_SECONDS : DateFormat.TIME_ONLY
  return formatDate(date, format, locale)
}

export const getRelativeTime = (date: string | Date, locale: Locale = Locale.EN_US): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInMs = dateObj.getTime() - now.getTime()

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  const diffInSeconds = Math.round(diffInMs / 1000)
  const diffInMinutes = Math.round(diffInMs / (1000 * 60))
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))
  const diffInWeeks = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 7))
  const diffInMonths = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 30))
  const diffInYears = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 365))

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, "second")
  } else if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, "minute")
  } else if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, "hour")
  } else if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, "day")
  } else if (Math.abs(diffInWeeks) < 4) {
    return rtf.format(diffInWeeks, "week")
  } else if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, "month")
  } else {
    return rtf.format(diffInYears, "year")
  }
}

export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const today = new Date()

  return dateObj.toDateString() === today.toDateString()
}

export const isYesterday = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return dateObj.toDateString() === yesterday.toDateString()
}

export const isTomorrow = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return dateObj.toDateString() === tomorrow.toDateString()
}

export const startOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj
}

export const endOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setHours(23, 59, 59, 999)
  return dateObj
}

export const addDays = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

export const subtractDays = (date: string | Date, days: number): Date => {
  return addDays(date, -days)
}

export const getDateRange = (startDate: string | Date, endDate: string | Date) => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate

  return {
    start: startOfDay(start),
    end: endOfDay(end),
    duration: end.getTime() - start.getTime(),
    days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  }
}

function getDateTimeOptions(format: DateFormat): Intl.DateTimeFormatOptions {
  switch (format) {
    case DateFormat.SHORT:
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    case DateFormat.MEDIUM:
      return {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }
    case DateFormat.LONG:
      return {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }
    case DateFormat.ISO:
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    case DateFormat.DATETIME_SHORT:
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    case DateFormat.DATETIME_MEDIUM:
      return {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    case DateFormat.DATETIME_LONG:
      return {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    case DateFormat.TIME_ONLY:
      return {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    case DateFormat.TIME_WITH_SECONDS:
      return {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    default:
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
  }
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export const isDateBefore = (date1: string | Date, date2: string | Date): boolean => {
  const dateObj1 = typeof date1 === "string" ? new Date(date1) : date1
  const dateObj2 = typeof date2 === "string" ? new Date(date2) : date2

  return dateObj1.getTime() < dateObj2.getTime()
}
