import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { InvoiceEditForm } from "../components/InvoiceEditForm"
import { useInvoiceMutations } from "../hooks/useInvoiceMutations"
import { useInvoiceDetail } from "../hooks/useInvoiceDetail"
import { UpdateInvoiceRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditInvoicePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/invoice/$id/edit" })
  
  const { invoice, isLoading, isError } = useInvoiceDetail(id)
  const { updateMutation } = useInvoiceMutations()

  const handleSubmit = (data: UpdateInvoiceRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/invoice" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/invoice" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !invoice) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("invoice.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("invoice.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("invoice.title"), href: "/invoice" },
          { label: t("invoice.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <InvoiceEditForm
          initialData={invoice}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
