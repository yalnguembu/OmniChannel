import { formatDate, formatDateTime } from "@/shared/lib/date"
import { DateFormat, Locale } from "@/shared/enums/common"

export const formatGridDate = (dateString: string, format: DateFormat = DateFormat.SHORT): string => {
  return formatDate(dateString, format)
}

export const formatGridDateTime = (dateString: string, locale: Locale = Locale.EN_US): string => {
  return formatDateTime(dateString, locale)
}
