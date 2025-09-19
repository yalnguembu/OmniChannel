// Date format enums
export enum DateFormat {
  SHORT = "MM/dd/yyyy",
  MEDIUM = "MMM dd, yyyy",
  LONG = "MMMM dd, yyyy",
  ISO = "yyyy-MM-dd",
  DATETIME_SHORT = "MM/dd/yyyy HH:mm",
  DATETIME_MEDIUM = "MMM dd, yyyy HH:mm",
  DATETIME_LONG = "MMMM dd, yyyy HH:mm:ss",
  TIME_ONLY = "HH:mm",
  TIME_WITH_SECONDS = "HH:mm:ss",
}

// Language/Locale enums
export enum Locale {
  EN_US = "en-US",
  EN_GB = "en-GB",
  ES_ES = "es-ES",
  FR_FR = "fr-FR",
  DE_DE = "de-DE",
  IT_IT = "it-IT",
  JA_JP = "ja-JP",
  KO_KR = "ko-KR",
  ZH_CN = "zh-CN",
  PT_BR = "pt-BR",
}

// Loading state enum
export enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

// Button variant enum
export enum ButtonVariant {
  DEFAULT = "default",
  DESTRUCTIVE = "destructive",
  OUTLINE = "outline",
  SECONDARY = "secondary",
  GHOST = "ghost",
  LINK = "link",
}

// Button size enum
export enum ButtonSize {
  DEFAULT = "default",
  SM = "sm",
  LG = "lg",
  ICON = "icon",
}

export enum BadgeStyles {
  GRAY = "inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 inset-ring inset-ring-gray-500/20",
  RED = "inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 inset-ring inset-ring-red-600/20",
  YELLOW = "inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 inset-ring inset-ring-yellow-600/20",
  GREEN = "inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 inset-ring inset-ring-green-600/30",
  BLUE = "inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 inset-ring inset-ring-blue-700/20",
  INDIGO = "inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 inset-ring inset-ring-indigo-700/20",
  PURPLE = "inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 inset-ring inset-ring-purple-700/20",
  PINK = "inline-flex items-center rounded-full bg-pink-100 px-2 py-1 text-xs font-semibold text-pink-700 inset-ring inset-ring-pink-700/20",
}
