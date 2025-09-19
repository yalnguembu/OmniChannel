import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { CreateCompanyUserRequest, CreateSystemUserRequest, SearchUserRequest } from "@/shared/api/types.gen"
import { zSearchUserRequest } from "@/shared/api/zod.gen"
import { UserDataGrid } from "../components/UserDataGrid"
import { useUser } from "../hooks/useUser"
import { SystemUserCreateForm } from "../components/SystemUserCreateForm"
import { useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Building, ChevronDown, Cog, Plus } from "lucide-react"
import { CompanyUserCreateForm } from "../components/CompanyUserCreateForm"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { UserStatisticCards } from "../components/UserStatisticCards"

export function UsersListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters, createSystemMutation, createCompanyMutation, searchUsers } =
    useUser()

  const [showCreateSystemUserModal, setShowCreateSystemUserModal] = useState(false)
  const toggleShowCreateSystemUserModal = () => setShowCreateSystemUserModal((prev) => !prev)

  const [showCreateCompanyUserModal, setShowCreateCompanyUserModal] = useState(false)
  const toggleShowCreateCompanyUserModal = () => setShowCreateCompanyUserModal((prev) => !prev)

  const handleSubmitSystemUser = (data: CreateSystemUserRequest) => {
    createSystemMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowCreateSystemUserModal(),
      },
    )
  }

  const handleSubmitCompanyUser = (data: CreateCompanyUserRequest) => {
    createCompanyMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowCreateCompanyUserModal(),
      },
    )
  }

  useEffect(() => {
    searchUsers()
  }, [])

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("users.title")}
          breadcrumbs={[{ label: t("menu.access-control"), href: "/dashboard" }, { label: t("users.title") }]}
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-x-2">
                  <span className="hidden lg:inline">{t("users.actions.addTitle")}</span>
                  <Plus className="h-4 w-4 lg:hidden" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleShowCreateSystemUserModal}>
                  <Cog className="mr-2 h-4 w-4" />
                  {t("users.actions.addSystemUser")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleShowCreateCompanyUserModal}>
                  <Building className="mr-2 h-4 w-4" />
                  {t("users.actions.addCompanyUser")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      }
      statistic={<UserStatisticCards />}
      filter={
        <BaseFilter<SearchUserRequest>
          schema={zSearchUserRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="users"
        />
      }
      content={
        <>
          <UserDataGrid />
          {showCreateSystemUserModal && (
            <ModalWrapper size="xl" open={showCreateSystemUserModal} onOpenChange={toggleShowCreateSystemUserModal}>
              <SystemUserCreateForm onSubmit={handleSubmitSystemUser} onCancel={toggleShowCreateSystemUserModal} isLoading={false} />
            </ModalWrapper>
          )}

          {showCreateCompanyUserModal && (
            <ModalWrapper size="xl" open={showCreateCompanyUserModal} onOpenChange={toggleShowCreateCompanyUserModal}>
              <CompanyUserCreateForm onSubmit={handleSubmitCompanyUser} onCancel={toggleShowCreateCompanyUserModal} isLoading={false} />
            </ModalWrapper>
          )}
        </>
      }
    />
  )
}
