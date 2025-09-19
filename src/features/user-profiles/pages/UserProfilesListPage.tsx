import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchUserProfileRequest } from "@/shared/api/types.gen"
import { zSearchUserProfileRequest } from "@/shared/api/zod.gen"
import { UserProfileDataGrid } from "../components/UserProfileDataGrid"
import { useUserProfile } from "../hooks/useUserProfile"

export function UserProfilesListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useUserProfile()

  const handleCreate = () => {
    navigate({ to: `/access-control/user-profiles/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("userProfiles.title")}
          addButtonText={t("userProfile.actions.add")}
          breadcrumbs={[{ label: t("menu.access-control"), href: "/dashboard" }, { label: t("userProfiles.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchUserProfileRequest>
          schema={zSearchUserProfileRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
        />
      }
      content={<UserProfileDataGrid />}
    />
  )
}
