import { immer } from "zustand/middleware/immer"
import { ReceiptsReadModelState, ReceiptsReadModelActions, initialState } from "@/features/receipts-read-models/stores/receiptsReadModelStore"

type Action = {
  type: keyof ReceiptsReadModelActions
  payload?: any
}

const reducer = (state: ReceiptsReadModelState, action: Action): ReceiptsReadModelState => {
  const set = (fn: (draft: ReceiptsReadModelState) => void) => {
    return immer(fn)(state)
  }

  switch (action.type) {
    case "setReceiptsReadModel":
      return set((draft) => {
        draft.receiptsReadModels = action.payload
      })
    case "addItem":
      return set((draft) => {
        draft.receiptsReadModels.unshift(action.payload)
        draft.totalItems += 1
      })
    case "updateItem":
      return set((draft) => {
        const index = draft.receiptsReadModels.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          draft.receiptsReadModels[index] = { ...draft.receiptsReadModels[index], ...action.payload.updates }
        }
      })
    case "removeItem":
      return set((draft) => {
        draft.receiptsReadModels = draft.receiptsReadModels.filter((item) => item.id !== action.payload)
        draft.selectedReceiptsReadModels = draft.selectedReceiptsReadModels.filter((selectedId) => selectedId !== action.payload)
        draft.selectedRows = draft.selectedRows.filter((selectedId) => selectedId !== action.payload)
        draft.totalItems -= 1
      })
    case "setSelectedItem":
      return set((draft) => {
        draft.selectedReceiptsReadModel = action.payload
      })
    case "setCurrentPage":
      return set((draft) => {
        draft.currentPage = action.payload
      })
    case "setPageSize":
      return set((draft) => {
        draft.pageSize = action.payload
        draft.currentPage = 1 // Reset to first page
      })
    case "setPaginationData":
      return set((draft) => {
        draft.totalItems = action.payload.total
        draft.totalPages = action.payload.totalPages
      })
    case "setSorting":
      return set((draft) => {
        draft.sortBy = action.payload.sortBy
        draft.sortDirection = action.payload.direction
      })
    case "setFilters":
      return set((draft) => {
        draft.filters = { ...draft.filters, ...action.payload }
        draft.currentPage = 1 // Reset to first page when filtering
      })
    case "clearFilters":
      return set((draft) => {
        draft.filters = {}
        draft.currentPage = 1
      })
    case "setSelectedReceiptsReadModels":
      return set((draft) => {
        draft.selectedReceiptsReadModels = action.payload
      })
    case "selectReceiptsReadModel":
      return set((draft) => {
        if (!draft.selectedReceiptsReadModels.includes(action.payload)) {
          draft.selectedReceiptsReadModels.push(action.payload)
        }
      })
    case "deselectReceiptsReadModel":
      return set((draft) => {
        draft.selectedReceiptsReadModels = draft.selectedReceiptsReadModels.filter((selectedId) => selectedId !== action.payload)
      })
    case "selectAllReceiptsReadModels":
      return set((draft) => {
        draft.selectedReceiptsReadModels = draft.receiptsReadModels.map((item) => item.id).filter((id): id is string => Boolean(id))
      })
    case "clearSelection":
      return set((draft) => {
        draft.selectedReceiptsReadModels = []
        draft.selectedRows = []
      })
    case "setLoading":
      return set((draft) => {
        draft.isLoading = action.payload
      })
    case "setSearching":
      return set((draft) => {
        draft.isSearching = action.payload
      })
    case "setCreating":
      return set((draft) => {
        draft.isCreating = action.payload
      })
    case "setUpdating":
      return set((draft) => {
        draft.isUpdating = action.payload
      })
    case "setDeleting":
      return set((draft) => {
        draft.isDeleting = action.payload
      })
    case "setError":
      return set((draft) => {
        draft.error = action.payload
      })
    case "setViewMode":
      return set((draft) => {
        draft.viewMode = action.payload
      })
    case "toggleFilter":
      return set((draft) => {
        draft.isFilterCollapsed = !draft.isFilterCollapsed
      })
    case "setSelectedRows":
      return set((draft) => {
        draft.selectedRows = action.payload
        draft.selectedReceiptsReadModels = action.payload
      })
    case "reset":
      return initialState
    default:
      return state
  }
}

export { reducer as receiptsReadModelReducer, initialState }
