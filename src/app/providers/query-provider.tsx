import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { client } from "@/shared/api/client.gen"
import { authPersistence } from "@/shared/lib/api/authPersistence"
import { env } from "@/config/env"
import axios from "axios"
import { handleRequestError } from "@/shared/lib/errorHandling"

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
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
