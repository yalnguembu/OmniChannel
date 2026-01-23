import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { JobCreateForm } from "../components/JobCreateForm"
import { useJobMutations } from "../hooks/useJobMutations"
import { CreateJobRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateJobPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useJobMutations()

  const handleSubmit = (data: CreateJobRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: "/job" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/job" })
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("job.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("job.title"), href: "/job" },
          { label: t("job.actions.add") },
        ]}
      />
      <div className="mt-6">
        <JobCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
