import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
// import { CreatePageHeader } from '@/shared/components/CreatePageHeader'
import { ApplicationCreateForm } from "../components/ApplicationCreateForm"
import { useApplication } from "../hooks/useApplication"
import { UpdateApplicationRequest } from "@/shared/api"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"

export function CreateApplicationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useApplication()

  const handleSubmit = (data: UpdateApplicationRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/applications` })
        },
        onError: () => {
          // toast.error(t(error))
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/applications` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("applications.create")}
          breadcrumbs={[{ label: t("navigation.dashboard") }, { label: t("applications.title"), href: "/" }, { label: t("applications.actions.add") }]}
        />
      }
      content={<ApplicationCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
