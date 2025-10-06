import { ModalWrapper } from "./ModalWrapper"
import { Button } from "./ui/button"
import { AlertTriangle, Trash2, CheckCircle, Info } from "lucide-react"
import { useTranslation } from "react-i18next"

type ConfirmationModalVariant = "danger" | "warning" | "success" | "info"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationModalVariant
  isLoading?: boolean
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: "text-red-500",
    confirmButtonVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    confirmButtonVariant: "default" as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    confirmButtonVariant: "default" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmButtonVariant: "default" as const,
  },
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "warning",
  isLoading = false,
}: ConfirmationModalProps) {
  const { t } = useTranslation()
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm()
    if (!isLoading) {
      onOpenChange()
    }
  }

  return (
    <ModalWrapper open={open} onOpenChange={onOpenChange} size="sm">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`rounded-full p-3 bg-muted ${config.iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="flex gap-3 w-full mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onOpenChange}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText || t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant={config.confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? t("common.loading") : confirmText || t("common.confirm")}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
