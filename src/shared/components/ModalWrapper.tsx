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
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
} & (ModalWrapperWithoutHeader | ModalWrapperWithHeader)

export function ModalWrapper(props: ModalWrapperProps) {
  const size = props.size || "md"
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className={`grid ${size === "sm" ? "min-w-sm" : size === "md" ? "min-w-md" : size === "lg" ? "min-w-lg" : size === "xl" ? "min-w-xl" : size === "2xl" ? "min-w-2xl" : size === "3xl" ? "min-w-3xl" : size === "full" ? "w-full h-full m-0 max-w-full max-h-full" : ""}  bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-right-0 data-[state=closed]:slide-out-to-right-0`}
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
