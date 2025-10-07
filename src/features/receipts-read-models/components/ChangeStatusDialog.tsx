import React, { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Label } from "@/shared/components/ui/label"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { AlertCircle, LoaderIcon } from "lucide-react"
import StatusBadge from "@/shared/components/StatusBadge"

interface ChangeStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: string
  transactionId: string
  availableStatuses: string[]
  onConfirm: (transactionId: string, newStatus: string) => void
  isLoading?: boolean
}

export const ChangeStatusDialog: React.FC<ChangeStatusDialogProps> = ({ open, onOpenChange, currentStatus, transactionId, availableStatuses, onConfirm, isLoading = false }) => {
  const { t } = useTranslation()
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const handleConfirm = () => {
    if (selectedStatus && selectedStatus !== currentStatus) {
      onConfirm(transactionId, selectedStatus)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedStatus("")
    }
    onOpenChange(open)
  }

  const canConfirm = selectedStatus && selectedStatus !== currentStatus

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

          <div className="space-y-2">
            <Label htmlFor="status-select">{t("receiptsReadModels.changeStatus.newStatus")}</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isLoading}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder={t("receiptsReadModels.changeStatus.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {/* {JSON.stringify(availableStatuses)} */}
                {availableStatuses.map((status) => (
                  <SelectItem key={status.code} value={status.code} disabled={status.code === currentStatus}>
                    <div className="flex items-center gap-2">
                      <StatusBadge text={status.code} />
                      {status.code === currentStatus && <span className="text-xs text-muted-foreground">({t("receiptsReadModels.changeStatus.current")})</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus && selectedStatus !== currentStatus && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("receiptsReadModels.changeStatus.warning", {
                  from: currentStatus,
                  to: selectedStatus,
                })}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {t("receiptsReadModels.changeStatus.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || isLoading}>
            {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            {t("receiptsReadModels.changeStatus.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
