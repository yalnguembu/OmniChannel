import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"

type ModalWrapperWithoutHeader = {
  withHeader?: false
}
type ModalWrapperWithHeader = {
  withHeader?: true
  title: string
  description?: string
}
type ModalWrapperProps = {
  open: boolean
  onOpenChange: () => void
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
} & (ModalWrapperWithoutHeader | ModalWrapperWithHeader)

export function ModalWrapper(props: ModalWrapperProps) {
  const size = props.size || "md"
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className={`grid ${size === "sm" ? "min-w-sm" : size === "md" ? "min-w-md" : size === "lg" ? "min-w-lg" : size === "xl" ? "min-w-xl" : "min-w-2xl"}`}
        showCloseButton
      >
        {props.withHeader && (
          <DialogHeader className="border-b-2 border-b-muted-foreground/30 pb-4">
            <DialogTitle>{props.title}</DialogTitle>
            {props.description && <DialogDescription>{props.description}</DialogDescription>}
          </DialogHeader>
        )}
        {props.children}
      </DialogContent>
    </Dialog>
  )
}
