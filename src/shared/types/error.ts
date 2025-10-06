import type { AxiosError } from "axios"

export type ErrorType = (XMLHttpRequest | AxiosError) & { message?: string; details?: string }

export type RedirectRule = {
  status: number | number[]
  path: string
}

export interface ValidationErrorResponse {
  type: string
  title: string
  status: number
  detail: string
  data: any | null
  success: boolean
  errorCode: string
  traceId: string
  timestamp: string
  validationErrors?: Record<string, string[]>
  metadata?: any | null
}
