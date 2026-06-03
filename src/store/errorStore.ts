import { create } from "zustand";
import { ErrorType } from "../shared/types/error";
import { FailedResponse } from "../shared/types/api";

export type ErrorStore = {
  error: ErrorType | FailedResponse | null;
  clearError: () => void;
  setError: (error: ErrorType | FailedResponse) => void;
};

export const useErrorStore = create<ErrorStore>((set) => ({
  error: null,
  setError: (error: ErrorType | FailedResponse) => {
    set({ error });
  },
  clearError: () => set({ error: null }),
}));
