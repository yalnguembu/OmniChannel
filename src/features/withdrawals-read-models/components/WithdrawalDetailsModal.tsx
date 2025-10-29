import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { SearchWithdrawalsReadModelResponse } from "@/shared/api/types.gen"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Label } from "@/shared/components/ui/label"
import StatusBadge from "@/shared/components/StatusBadge"
import { formatCurrency } from "@/shared/utils/formatCurrency"
import { Button, Input } from "@/shared"
import { useWithdrawalsReadModel } from "../hooks/useWithdrawalsReadModel"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"
import { toast } from "sonner"

interface WithdrawalDetailsModalProps {
  open: boolean
  onOpenChange: () => void
  onCopyEvent: (id: string) => void
  withdrawal: SearchWithdrawalsReadModelResponse | null
}

export const WithdrawalDetailsModal: React.FC<WithdrawalDetailsModalProps> = ({ open, onOpenChange, withdrawal, onCopyEvent }) => {
  const { t } = useTranslation()
  const { onApproveWithdrawal, onCancelWithdrawal, onCompleteWithdrawal } = useWithdrawalsReadModel()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [completeReference, setCompleteReference] = useState("")

  if (!withdrawal) return null

  const isPending = withdrawal.status === "AWAITING_APPROVAL"
  const isApproved = withdrawal.status === "APPROVED"

  const handleApprove = () => {
    onApproveWithdrawal(withdrawal.id!)
    onOpenChange()
  }

  const DetailItem = ({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: "success" | "error" | "warning" | "info" }) => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 py-2 border-b last:border-0">
      <Label className="font-semibold md:col-span-2 text-muted-foreground text-sm wrap-break-word">{label}</Label>
      <div
        className={`md:col-span-3 wrap-break-word ${
          highlight === "success"
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

  const handleCopy = () => onCopyEvent(withdrawal.id!)

  return (
    <ModalWrapper size="3xl" withHeader open={open} onOpenChange={onOpenChange} title={t("withdrawals.details.title")}>
      <div className="max-h-[80vh] overflow-y-auto">
        <h3 className="text-sm font-semibold bg-background px-2 text-muted-foreground uppercase"># {withdrawal.id || ""}</h3>

        <div className="grid lg:grid-cols-2 justify-center items-start gap-6 pt-4">
          {/* Withdrawal Overview */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.overview")}</h3>
            <DetailItem label={t("withdrawals.details.status")} value={<StatusBadge text={withdrawal.status || ""} />} />
            <DetailItem label={t("withdrawals.details.withdrawalMethodName")} value={withdrawal.withdrawalMethodName} highlight="info" />
            <DetailItem label={t("withdrawals.details.accountNumber")} value={withdrawal.accountNumber} />
            <DetailItem label={t("withdrawals.details.createdAt")} value={withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleString() : "N/A"} />
            <DetailItem label={t("withdrawals.details.processedAt")} value={withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleString() : "N/A"} />
            <DetailItem label={t("withdrawals.details.verifiedAt")} value={withdrawal.verifiedAt ? new Date(withdrawal.verifiedAt).toLocaleString() : "N/A"} />
          </div>

          {/* Amount Details */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.amounts")}</h3>
            <DetailItem label={t("withdrawals.details.amount")} value={formatCurrency(withdrawal.amount || 0, withdrawal.currency || "XAF")} highlight="success" />
            <DetailItem label={t("withdrawals.details.currency")} value={withdrawal.currency} />
            <DetailItem label={t("withdrawals.details.providerFeeAmount")} value={formatCurrency(withdrawal.providerFeeAmount || 0, withdrawal.currency || "XAF")} />
            <DetailItem
              label={t("withdrawals.details.feeAppliedAmount")}
              value={formatCurrency(withdrawal.feeAppliedAmount || 0, withdrawal.currency || "XAF")}
              highlight="error"
            />
            <DetailItem label={t("withdrawals.details.netAmount")} value={formatCurrency(withdrawal.netAmount || 0, withdrawal.currency || "XAF")} highlight="info" />
          </div>

          {/* References */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.references")}</h3>
            <DetailItem label={t("withdrawals.details.internalReference")} value={withdrawal.internalReference} highlight="info" />
            <DetailItem label={t("withdrawals.details.providerInitialReference")} value={withdrawal.providerInitialReference} />
            <DetailItem label={t("withdrawals.details.providerFinalReference")} value={withdrawal.providerFinalReference} />
            <DetailItem label={t("withdrawals.details.providerReference")} value={withdrawal.providerReference} />
          </div>

          {/* Company & Application */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">
              {t("withdrawals.details.companyApplication")}
            </h3>
            <DetailItem label={t("withdrawals.details.companyName")} value={withdrawal.companyName} />
            <DetailItem label={t("withdrawals.details.applicationName")} value={withdrawal.applicationName} highlight="info" />
          </div>

          {/* Additional Information */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("withdrawals.details.additionalInfo")}</h3>
            <DetailItem label={t("withdrawals.details.notes")} value={withdrawal.notes} />
            <DetailItem label={t("withdrawals.details.providerMessage")} value={withdrawal.providerMessage} />
            <DetailItem label={t("withdrawals.details.currentVersion")} value={withdrawal.currentVersion} />
            <DetailItem label={t("withdrawals.details.updatedAt")} value={withdrawal.updatedAt ? new Date(withdrawal.updatedAt).toLocaleString() : "N/A"} />
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
          onCancelWithdrawal(withdrawal.id!, cancelReason)
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
          onCompleteWithdrawal(withdrawal.id!, completeReference)
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
