import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ChannelCreateForm } from "../components/ChannelCreateForm"
import { useChannelMutations } from "../hooks/useChannelMutations"
import { CreateChannelRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateChannelPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useChannelMutations()

  const handleSubmit = (data: CreateChannelRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: "/channel" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/channel" })
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("channel.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("channel.title"), href: "/channel" },
          { label: t("channel.actions.add") },
        ]}
      />
      <div className="mt-6">
        <ChannelCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
