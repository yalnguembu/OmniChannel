import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { AssignPermissionToProfileForm } from "../components/AssignPermissionToProfileForm"
import { useUserProfile } from "../hooks/useUserProfile"

export function AssignPermissionToProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/access-control/user-profiles/$id/assign" })
  const { assignMutation } = useUserProfile()

  const handleSubmit = (permissionValues: string[]) => {
    assignMutation.mutate(
      {
        path: { profileId: id },
        body: permissionValues,
      },
      {
        onSuccess: () => {
          navigate({ to: `/access-control/user-profiles/${id}` })
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/access-control/user-profiles/${id}` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("userProfile.assignPermissions.title")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("userProfile.title"), href: "/access-control/user-profiles" },
            { label: t("userProfile.assignPermissions.title") },
          ]}
        />
      }
      content={<AssignPermissionToProfileForm profileId={id} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={assignMutation.isPending} />}
    />
  )
}
