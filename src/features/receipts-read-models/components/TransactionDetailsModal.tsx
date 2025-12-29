import React from "react"
import { useTranslation } from "react-i18next"
import { SearchReceiptsReadModelResponse } from "@/shared/api/types.gen"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Label } from "@/shared/components/ui/label"
import StatusBadge from "@/shared/components/StatusBadge"
import { formatCurrency } from "@/shared/utils/formatCurrency"
import { Button } from "@/shared"

interface TransactionDetailsModalProps {
  open: boolean
  onOpenChange: () => void
  onCopyEvent: (id: string) => void
  transaction: SearchReceiptsReadModelResponse | null
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ open, onOpenChange, transaction, onCopyEvent }) => {
  const { t } = useTranslation()

  if (!transaction) return null

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

  const handleCopy = () => onCopyEvent(transaction.id ?? "")

  return (
    <ModalWrapper size="3xl" withHeader open={open} onOpenChange={onOpenChange} title={t("receiptsReadModels.details.title")}>
      <div className="max-h-[80vh] overflow-y-auto">
        <h3 className="text-sm font-semibold bg-background px-2 text-muted-foreground uppercase"># {transaction.id || ""}</h3>

        <div className="grid lg:grid-cols-2 justify-center items-center gap-6 pt-4">
          {/* Transaction Overview */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("receiptsReadModels.details.overview")}</h3>
            <DetailItem label={t("receiptsReadModels.details.status")} value={<StatusBadge text={transaction.status || ""} />} />
            <DetailItem label={t("receiptsReadModels.details.paymentMethod")} value={transaction.paymentMethodName} highlight="info" />
            <DetailItem label={t("receiptsReadModels.details.paymentMethodCode")} value={transaction.paymentMethodCode} />
            <DetailItem label={t("receiptsReadModels.details.createdAt")} value={transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : "N/A"} />
            <DetailItem label={t("receiptsReadModels.details.completedAt")} value={transaction.completedAt ? new Date(transaction.completedAt).toLocaleString() : "N/A"} />
          </div>

          {/* Amount Details */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("receiptsReadModels.details.amounts")}</h3>
            <DetailItem label={t("receiptsReadModels.details.amount")} value={formatCurrency(transaction.amount || 0, transaction.currency || "XAF")} highlight="success" />
            <DetailItem label={t("receiptsReadModels.details.currency")} value={transaction.currency} />
            <DetailItem label={t("receiptsReadModels.details.providerFeeAmount")} value={formatCurrency(transaction.providerFeeAmount || 0, transaction.currency || "XAF")} />
            <DetailItem
              label={t("receiptsReadModels.details.feeAppliedAmount")}
              value={formatCurrency(transaction.feeAppliedAmount || 0, transaction.currency || "XAF")}
              highlight="error"
            />
            <DetailItem label={t("receiptsReadModels.details.netAmount")} value={formatCurrency(transaction.netAmount || 0, transaction.currency || "XAF")} highlight="info" />
          </div>

          {/* References */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">{t("receiptsReadModels.details.references")}</h3>
            <DetailItem label={t("receiptsReadModels.details.internalReference")} value={transaction.internalReference} highlight="info" />
            <DetailItem label={t("receiptsReadModels.details.externalReference")} value={transaction.externalReference} highlight="error" />
            <DetailItem label={t("receiptsReadModels.details.providerInitialReference")} value={transaction.providerInitialReference} />
            <DetailItem label={t("receiptsReadModels.details.providerFinalReference")} value={transaction.providerFinalReference} />
          </div>

          {/* Customer Information */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">
              {t("receiptsReadModels.details.customerInfo")}
            </h3>
            <DetailItem label={t("receiptsReadModels.details.customerName")} value={transaction.customerName} />
            <DetailItem label={t("receiptsReadModels.details.customerEmail")} value={transaction.customerEmail} />
            <DetailItem label={t("receiptsReadModels.details.phoneNumberEncrypted")} value={transaction.phoneNumberEncrypted} highlight="info" />
            <DetailItem label={t("receiptsReadModels.details.customerIpAddress")} value={transaction.customerIpAddress} />
          </div>

          {/* Company & Application */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">
              {t("receiptsReadModels.details.companyApplication")}
            </h3>
            <DetailItem label={t("receiptsReadModels.details.companyName")} value={transaction.companyName} />
            <DetailItem label={t("receiptsReadModels.details.companyEmail")} value={transaction.companyEmail} />
            <DetailItem label={t("receiptsReadModels.details.companyPhoneNumber")} value={transaction.companyPhoneNumber} />
            <DetailItem label={t("receiptsReadModels.details.companyStatus")} value={transaction.companyStatus} />
            <DetailItem label={t("receiptsReadModels.details.applicationName")} value={transaction.applicationName} highlight="info" />
            <DetailItem label={t("receiptsReadModels.details.applicationStatus")} value={transaction.applicationStatus} />
          </div>

          {/* Additional Information */}
          <div className="h-full border p-4 rounded-lg relative">
            <h3 className="text-sm font-semibold mb-3 absolute -top-2.5 left-3 bg-background px-2 text-muted-foreground uppercase">
              {t("receiptsReadModels.details.additionalInfo")}
            </h3>
            <DetailItem label={t("receiptsReadModels.details.providerMessage")} value={transaction.providerMessage} />
            <DetailItem label={t("receiptsReadModels.details.currentVersion")} value={transaction.currentVersion} />
            <DetailItem label={t("receiptsReadModels.details.updatedAt")} value={transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString() : "N/A"} />
            {transaction.metaData && (
              <div className="py-2">
                <Label className="font-semibold text-muted-foreground text-sm mb-2 block">{t("receiptsReadModels.details.metadata")}</Label>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">{JSON.stringify(transaction.metaData, null, 2)}</pre>
              </div>
            )}

            <Button variant="outline" type="button" onClick={handleCopy}>
              {t("receiptsReadModels.details.copy")}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
