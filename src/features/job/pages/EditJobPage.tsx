import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { JobEditForm } from "../components/JobEditForm"
import { useJobMutations } from "../hooks/useJobMutations"
import { useJobDetail } from "../hooks/useJobDetail"
import { UpdateJobRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditJobPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/job/$id/edit" })
  
  const { job, isLoading, isError } = useJobDetail(id)
  const { updateMutation } = useJobMutations()

  const handleSubmit = (data: UpdateJobRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
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

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("job.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("job.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("job.title"), href: "/job" },
          { label: t("job.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <JobEditForm
          initialData={job}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
