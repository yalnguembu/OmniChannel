import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { FileEditForm } from "../components/FileEditForm"
import { useFileMutations } from "../hooks/useFileMutations"
import { useFileDetail } from "../hooks/useFileDetail"
import { UpdateFileRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditFilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/file/$id/edit" })
  
  const { file, isLoading, isError } = useFileDetail(id)
  const { updateMutation } = useFileMutations()

  const handleSubmit = (data: UpdateFileRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/file" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/file" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !file) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("file.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("file.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("file.title"), href: "/file" },
          { label: t("file.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <FileEditForm
          initialData={file}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
