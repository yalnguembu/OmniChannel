import { client } from "../../api/client.gen"
import { authPersistence } from "./authPersistence"
import { env } from "@/config/env"
import axios from "axios"
import { handleRequestError } from "../errorHandling"

export const setupAxiosInterceptors = () => {
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
          // {
          //   status: 403,
          //   path: "/unauthorize",
          // },
        ],
      })

      return Promise.reject(error)
    },
  )

  const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' ${env.VITE_API_BASE_URL || "http://localhost:8080"};
  block-all-mixed-content;
  upgrade-insecure-requests;
`
    .replace(/\s{2,}/g, " ")
    .trim()

  client.setConfig({
    baseURL: env.VITE_API_BASE_URL,
    timeout: 60000,
    headers: {
      "Content-Security-Policy": "unsafe", //cspHeader,
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    },
    withCredentials: true,
    axios: axios,
  })
}
