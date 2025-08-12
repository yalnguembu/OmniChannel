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
