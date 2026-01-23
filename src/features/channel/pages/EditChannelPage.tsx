import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ChannelEditForm } from "../components/ChannelEditForm"
import { useChannelMutations } from "../hooks/useChannelMutations"
import { useChannelDetail } from "../hooks/useChannelDetail"
import { UpdateChannelRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditChannelPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/channel/$id/edit" })
  
  const { channel, isLoading, isError } = useChannelDetail(id)
  const { updateMutation } = useChannelMutations()

  const handleSubmit = (data: UpdateChannelRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
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

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !channel) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("channel.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("channel.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("channel.title"), href: "/channel" },
          { label: t("channel.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <ChannelEditForm
          initialData={channel}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
