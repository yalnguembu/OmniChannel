import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ApplicationCreateForm } from "../components/ApplicationCreateForm"
import { useApplicationMutations } from "../hooks/useApplicationMutations"
import { CreateApplicationRequest } from "@/shared/api"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"

export function CreateApplicationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createApplicationWithValidation, isMutating } = useApplicationMutations()

  const handleSubmit = (data: CreateApplicationRequest, setError: any) => {
    createApplicationWithValidation(data, setError, () => {
      navigate({ to: `/applications` })
    })
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
      content={<ApplicationCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isMutating} />}
    />
  )
}
