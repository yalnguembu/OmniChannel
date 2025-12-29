import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Label } from "@/shared/components/ui/label"
import StatusBadge from "@/shared/components/StatusBadge"
import { formatCurrency } from "@/shared/utils/formatCurrency"
import { Button, Input } from "@/shared"
import { useWithdrawalsReadModel } from "../hooks/useWithdrawalsReadModel"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { formatDate } from "@/shared/lib"

interface WithdrawalDetailsModalProps {
  open: boolean
  onOpenChange: () => void
  onCopyEvent: (id: string) => void
  withdrawalId: string | null
}

export const WithdrawalDetailsModal: React.FC<WithdrawalDetailsModalProps> = ({ open, onOpenChange, withdrawalId, onCopyEvent }) => {
  const { t } = useTranslation()
  const { onApproveWithdrawal, onCancelWithdrawal, onCompleteWithdrawal, getWithdrawalsReadModelDetailsQuery } = useWithdrawalsReadModel()

  const { data: withdrawalQueryResponse, isLoading } = getWithdrawalsReadModelDetailsQuery(withdrawalId ?? "")

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [completeReference, setCompleteReference] = useState("")

  if (!withdrawalQueryResponse?.data) return null

  if (isLoading || !withdrawalQueryResponse?.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPending = withdrawalQueryResponse.data.status === "AWAITING_APPROVAL"
  const isApproved = withdrawalQueryResponse.data.status === "APPROVED"

  const handleApprove = () => {
    onApproveWithdrawal(withdrawalQueryResponse.data?.id ?? "")
    onOpenChange()
  }

  const DetailItem = ({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: "success" | "error" | "warning" | "info" }) => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 py-2 border-b last:border-0">
      <Label className="font-semibold md:col-span-2 text-muted-foreground text-sm wrap-break-word">{label}</Label>
      <div
        className={`md:col-span-3 wrap-break-word ${highlight === "success"
          ? "text-green-600 font-semibold"
          : highlight === "error"
            ? "text-red-600 font-semibold"
            : highlight === "warning"
              ? "text-yellow-600 font-semibold"
              : highlight === "info"
                ? "text-blue-600 font-semibold"
                : ""
          }`}
      >
        {value ?? "N/A"}
      </div>
    </div>
  )

  const handleCopy = () => onCopyEvent(withdrawalQueryResponse.data?.id ?? "")

  return (
    <ModalWrapper size="3xl" withHeader open={open} onOpenChange={onOpenChange} title={`${t("withdrawals.details.title")} - # ${withdrawalQueryResponse.data.id || ""}`}>
      <div className="max-h-[80vh] overflow-y-auto">
        {/* <h3 className="text-sm font-semibold bg-background px-2 text-muted-foreground uppercase"># {withdrawal.id || ""}</h3> */}

        <div className="grid lg:grid-cols-2 justify-center items-start gap-6 pt-4">
          {/* Withdrawal Overview */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.overview")}</h3>
            <DetailItem label={t("withdrawals.details.balancesReadModelName")} value={withdrawalQueryResponse.data.balancesReadModelName} />
            <DetailItem label={t("withdrawals.details.paymentMethodName")} value={withdrawalQueryResponse.data.paymentMethodName} highlight="info" />
            <DetailItem label={t("withdrawals.details.accountNumber")} value={withdrawalQueryResponse.data.accountNumber} />
            <DetailItem label={t("withdrawals.details.createdAt")} value={withdrawalQueryResponse.data.createdAt ? formatDate(withdrawalQueryResponse.data.createdAt) : "N/A"} />
            <DetailItem label={t("withdrawals.details.verifiedAt")} value={withdrawalQueryResponse.data.verifiedAt ? formatDate(withdrawalQueryResponse.data.verifiedAt) : "N/A"} />
          </div>

          {/* Amount Details */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.amounts")}</h3>
            <DetailItem
              label={t("withdrawals.details.amount")}
              value={formatCurrency(withdrawalQueryResponse.data.amount || 0, withdrawalQueryResponse.data.currencySymbol || "XAF")}
              highlight="success"
            />
            <DetailItem label={t("withdrawals.details.currency")} value={withdrawalQueryResponse.data.currencySymbol} />
            <DetailItem
              label={t("withdrawals.details.providerFeeAmount")}
              value={formatCurrency(withdrawalQueryResponse.data.providerFeeAmount || 0, withdrawalQueryResponse.data.currencySymbol || "XAF")}
            />
            <DetailItem
              label={t("withdrawals.details.feeAppliedAmount")}
              value={formatCurrency(withdrawalQueryResponse.data.feeAppliedAmount || 0, withdrawalQueryResponse.data.currencySymbol || "XAF")}
              highlight="error"
            />
            <DetailItem
              label={t("withdrawals.details.netAmount")}
              value={formatCurrency(withdrawalQueryResponse.data.netAmount || 0, withdrawalQueryResponse.data.currency || "XAF")}
              highlight="info"
            />
            <DetailItem label={t("withdrawals.details.status")} value={<StatusBadge text={withdrawalQueryResponse.data.status || ""} />} />
          </div>

          {/* References */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.references")}</h3>
            <DetailItem label={t("withdrawals.details.internalReference")} value={withdrawalQueryResponse.data.internalReference} highlight="info" />
            <DetailItem label={t("withdrawals.details.providerInitialReference")} value={withdrawalQueryResponse.data.providerInitialReference} />
            <DetailItem label={t("withdrawals.details.providerFinalReference")} value={withdrawalQueryResponse.data.providerFinalReference} />
            <DetailItem label={t("withdrawals.details.providerReference")} value={withdrawalQueryResponse.data.providerReference} />
          </div>

          {/* Company & Application */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">
              {t("withdrawals.details.companyApplication")}
            </h3>
            <DetailItem label={t("withdrawals.details.companyName")} value={withdrawalQueryResponse.data.companyName} />
            <DetailItem label={t("withdrawals.details.applicationName")} value={withdrawalQueryResponse.data.applicationName} highlight="info" />
            <DetailItem label={t("withdrawals.details.withdrawalsAt")} value={withdrawalQueryResponse.data.withdrawalsAt} />
            <DetailItem label={t("withdrawals.details.balancesReadModelId")} value={withdrawalQueryResponse.data.balancesReadModelId} />
          </div>

          {/* Additional Information */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.additionalInfo")}</h3>
            <DetailItem label={t("withdrawals.details.providerMessage")} value={withdrawalQueryResponse.data.providerMessage} />
            <DetailItem label={t("withdrawals.details.currentVersion")} value={withdrawalQueryResponse.data.currentVersion} />
            <DetailItem label={t("withdrawals.details.updatedAt")} value={withdrawalQueryResponse.data.updatedAt ? formatDate(withdrawalQueryResponse.data.updatedAt) : "N/A"} />
            <Button variant="outline" type="button" onClick={handleCopy} className="mt-4">
              {t("withdrawals.details.copyEvents")}
            </Button>
            <div className="flex gap-2 mt-4">
              {isPending && (
                <>
                  <Button variant="default" onClick={handleApprove}>
                    {t("withdrawals.actions.approve")}
                  </Button>
                  <Button variant="destructive" onClick={() => setShowCancelModal(true)}>
                    {t("withdrawals.actions.cancel")}
                  </Button>
                </>
              )}
              {isApproved && (
                <Button variant="default" onClick={() => setShowCompleteModal(true)}>
                  {t("withdrawals.actions.complete")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        open={showCancelModal}
        onOpenChange={() => setShowCancelModal(false)}
        onConfirm={() => {
          if (!cancelReason) {
            toast.error(t("withdrawals.messages.cancel.reasonRequired"))
            return
          }
          onCancelWithdrawal(withdrawalQueryResponse.data?.id!, cancelReason)
          setShowCancelModal(false)
          onOpenChange()
        }}
        title={t("withdrawals.confirmations.cancel.title")}
        description={t("withdrawals.confirmations.cancel.description")}
        confirmText={t("withdrawals.confirmations.cancel.confirm")}
        cancelText={t("withdrawals.confirmations.cancel.cancel")}
        variant="danger"
      >
        <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder={t("withdrawals.confirmations.cancel.reasonPlaceholder")} className="mt-4" />
      </ConfirmationModal>
      <ConfirmationModal
        open={showCompleteModal}
        onOpenChange={() => setShowCompleteModal(false)}
        onConfirm={() => {
          if (!completeReference) {
            toast.error(t("withdrawals.messages.complete.referenceRequired"))
            return
          }
          onCompleteWithdrawal(withdrawalQueryResponse.data?.id!, completeReference)
          setShowCompleteModal(false)
          onOpenChange()
        }}
        title={t("withdrawals.confirmations.complete.title")}
        description={t("withdrawals.confirmations.complete.description")}
        confirmText={t("withdrawals.confirmations.complete.confirm")}
        cancelText={t("withdrawals.confirmations.complete.cancel")}
      >
        <Input
          value={completeReference}
          onChange={(e) => setCompleteReference(e.target.value)}
          placeholder={t("withdrawals.confirmations.complete.referencePlaceholder")}
          className="mt-4"
        />
      </ConfirmationModal>
    </ModalWrapper>
  )
}
