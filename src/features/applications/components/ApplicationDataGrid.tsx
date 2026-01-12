import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, ACTION } from "@/shared/types"
import { useApplicationList } from "../hooks/useApplicationList"
import { ApplicationDto } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { useApplicationListStore } from "../stores/applicationListStore"

export const ApplicationDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const store = useApplicationListStore()

  const { applications, paginationMetadata, isLoading, changePage, changePageSize } = useApplicationList()

  const columnHeaders: DataGridColumnHeader<ApplicationDto>[] = [
    {
      key: "companyName",
      label: t("applications.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("applications.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("applications.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("applications.headers.status"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "environment",
      label: t("applications.headers.environment"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("applications.headers.createdAt"),
      sortable: true,
      resizable: true,
      render: (val) => formatDate(val as string)
    },
    {
      key: "actions",
      label: t("applications.actions.more"),
      sortable: false,
      width: 110,
    },
  ]


  const handleView = (id: string) => {
    navigate({ to: `/applications/${id}` })
  }

  const handleEdit = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (app) {
      store.setSelectedItem(app as any)
      store.setShowEditModal(true)
    }
  }

  const handleDelete = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (app) {
      store.setSelectedItem(app as any)
      store.setShowDeleteModal(true)
    }
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "edit":
        handleEdit(id)
        break
      case "view":
        handleView(id)
        break
      case "delete":
        handleDelete(id)
        break
      default:
        return
    }
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <DataGrid<ApplicationDto>
        columnHeaders={columnHeaders}
        items={applications}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage={t("applications.messages.noData")}
        enableSelection={false}
        selectedRows={[]}
        onSelectionChange={() => { }}
        enableSorting={false}
        enableColumnVisibility={true}
        actions={["view", "edit", "delete"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
