import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { InvoiceCreateForm } from "../components/InvoiceCreateForm"
import { useInvoiceMutations } from "../hooks/useInvoiceMutations"
import { CreateInvoiceRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useInvoiceMutations()

  const handleSubmit = (data: CreateInvoiceRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("invoice.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("invoice.title"), href: "/invoice" },
          { label: t("invoice.actions.add") },
        ]}
      />
      <div className="mt-6">
        <InvoiceCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
