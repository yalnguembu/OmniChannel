import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { UserSession } from "@/shared/types/session"

export const zLoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginRequest = z.infer<typeof zLoginRequest>

export interface LoginResponse {
  user?: UserSession
  message?: string
  success: boolean
}

export interface SessionState {
  isLoading: boolean
  error: string | null
  lastActivity: number
  user: UserSession | void
  userPermissions: string[]
}

export interface SessionActions {
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetSession: () => void
  updateActivity: () => void
  setUser: (data: UserSession) => void
  setPermissions: (permissions: string[]) => void
}

export interface SessionActions {
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetSession: () => void
  updateActivity: () => void
  setUser: (data: UserSession) => void
}
export interface SessionGetters {
  getIsLoggedIn: () => boolean
}
export type SessionStore = SessionState & SessionActions & SessionGetters

const initialState: SessionState = {
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
  user: undefined,
  userPermissions: [],
}

export const useSessionStore = create<SessionStore>()(
  persist(
    devtools(
      immer((set, get) => ({
        ...initialState,
        getIsLoggedIn: () => {
          const state = get()
          return !!state.user
        },
        setUser: (user: UserSession) => {
          set((state) => {
            state.user = user
          })
        },

        setPermissions: (permissions: string[]) => {
          set((state) => {
            state.userPermissions = permissions
          })
        },

        setLoading: (isLoading) => {
          set((state) => {
            state.isLoading = isLoading
          })
        },

        setError: (error) => {
          set((state) => {
            state.error = error
          })
        },

        resetSession: () => {
          set((state) => {
            state.error = null
            state.user = undefined
          })
        },

        updateActivity: () => {
          set((state) => {
            state.lastActivity = Date.now()
          })
        },
      })),
    ),
    {
      name: "session-store",
      partialize: (state) => ({
        isLoading: state.isLoading,
        error: state.error,
        lastActivity: state.lastActivity,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.user) {
          state.setUser(state.user)
        }
      },
    },
  ),
)
