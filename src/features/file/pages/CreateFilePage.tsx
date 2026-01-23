import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { FileCreateForm } from "../components/FileCreateForm"
import { useFileMutations } from "../hooks/useFileMutations"
import { CreateFileRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateFilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useFileMutations()

  const handleSubmit = (data: CreateFileRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("file.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("file.title"), href: "/file" },
          { label: t("file.actions.add") },
        ]}
      />
      <div className="mt-6">
        <FileCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
