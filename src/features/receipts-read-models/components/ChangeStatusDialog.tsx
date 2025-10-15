import React from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { AlertCircle, LoaderIcon } from "lucide-react"
import StatusBadge from "@/shared/components/StatusBadge"

interface ChangeStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: string
  transactionId: string
  onConfirm: (transactionId: string) => void
  isLoading?: boolean
}

export const ChangeStatusDialog: React.FC<ChangeStatusDialogProps> = ({ open, currentStatus, onConfirm, isLoading = false, onOpenChange, transactionId }) => {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm(transactionId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("receiptsReadModels.changeStatus.title")}</DialogTitle>
          <DialogDescription>{t("receiptsReadModels.changeStatus.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("receiptsReadModels.changeStatus.currentStatus")}</Label>
            <div className="p-3 border rounded-md bg-muted/30">
              <StatusBadge text={currentStatus} />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("receiptsReadModels.changeStatus.warning", {
                from: currentStatus,
                to: "PROCESSING",
              })}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("receiptsReadModels.changeStatus.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            {t("receiptsReadModels.changeStatus.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
