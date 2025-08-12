import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { client } from "@/shared/api/client.gen"
import { authPersistence } from "@/shared/lib/api/authPersistence"
import { env } from "@/config/env"
import axios from "axios"
import { handleRequestError } from "@/shared/lib/errorHandling"

const cspHeader = `
  default-src *;
  script-src * 'unsafe-eval' 'unsafe-inline' data: blob:;
  style-src * 'unsafe-inline' data: blob:;
  img-src * data: blob:;
  font-src * data: blob:;
  object-src *;
  base-uri *;
  form-action *;
  frame-ancestors *;
  connect-src *;
  media-src *;
  worker-src *;
  child-src *;
  frame-src *;
`
  .replace(/\s{2,}/g, " ")
  .trim()

const headers = {
  "Content-Security-Policy": cspHeader,
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
}

axios.interceptors.request.use(
  (config) => {
    const token = authPersistence.getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    handleRequestError(error, {
      redirectRules: [
        {
          status: 401,
          path: "/auth/logout",
        },
        {
          status: 403,
          path: "/unauthorize",
        },
      ],
    })

    return Promise.reject(error)
  },
)

client.setConfig({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 60000,
  headers,
  withCredentials: true,
  axios: axios,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // axios.get(`${env.VITE_API_BASE_URL}Application/dropdown`,
  // JSON.stringify({
  //   email: "user@example.com",
  //   password: "string",
  // }),
  // {
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // },
  // )
  // axios.get(`${env.VITE_API_BASE_URL}Auth/login`)

  // getApiCountryDropdown()

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
