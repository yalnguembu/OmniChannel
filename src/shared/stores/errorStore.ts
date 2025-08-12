import { create } from "zustand"
import { ErrorType } from "../types/error"

export type ErrorStore = {
  error: ErrorType | null
  clearError: () => void
  setError: (error: ErrorType) => void
}

export const useErrorStore = create<ErrorStore>((set) => ({
  error: null,
  setError: (error: ErrorType) => {
    set({ error })
  },
  clearError: () => set({ error: null }),
}))
