import type { AxiosError } from "axios"

export type ErrorType = (XMLHttpRequest | AxiosError) & { message?: string; details?: string }

export type RedirectRule = {
  status: number | number[]
  path: string
}
