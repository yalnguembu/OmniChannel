import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  SendFlowFormSchema,
  BulkSendFormSchema,
  fmtTimeFull,
  type SendFlowForm,
  type BulkSendForm,
} from "@/models/whatsapp.models";
import type { Conversation, Message } from "@/models/whatsapp.models";

// ─── Conversation Details Modal ───────────────────────────────────────────────

interface ConvDetailsModalProps {
  open: boolean;
  conv: Conversation | null;
  onClose: () => void;
  /** Whether a CRM contact already exists for this conversation's number. */
  hasContact?: boolean;
  contactLoading?: boolean;
  onManageContact?: () => void;
}

export const ConvDetailsModal: React.FC<ConvDetailsModalProps> = ({
  open,
  conv,
  onClose,
  hasContact,
  contactLoading,
  onManageContact,
}) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Détails de la conversation</DialogTitle>
      </DialogHeader>
      {conv && (
        <div className="space-y-3 text-sm">
          {[
            ["ID", conv.id],
            ["Contact", conv.contactAddress],
            ["Statut Conversation", conv.status],
            ["Canal", `${conv.channelName || ""} (${conv.channelCode || ""})`],
            [
              "Expéditeur",
              `${conv.senderName || ""} (${conv.senderAddress || ""})`,
            ],
            ["Créée le", fmtTimeFull(conv.createdAt || conv.lastMessageAt)],
            [
              "Assigné à",
              conv.assignedToUserFirstName
                ? `${conv.assignedToUserFirstName} ${conv.assignedToUserLastName || ""}`.trim()
                : "Non assigné",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="font-semibold text-[#111B21] min-w-[120px]">
                {label}
              </span>
              <span className="text-[#667781] break-all">{value || "N/A"}</span>
            </div>
          ))}
        </div>
      )}
      {onManageContact && (
        <div className="pt-2">
          <Button
            disabled={contactLoading}
            onClick={onManageContact}
            className="w-full bg-[#25D366] hover:bg-[#20BD5B] text-white"
          >
            {contactLoading
              ? "Chargement…"
              : hasContact
                ? "Éditer le contact"
                : "Ajouter aux contacts"}
          </Button>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// ─── Message Details Modal ────────────────────────────────────────────────────

interface MsgDetailsModalProps {
  open: boolean;
  msg: Message | null;
  onClose: () => void;
}

export const MsgDetailsModal: React.FC<MsgDetailsModalProps> = ({
  open,
  msg,
  onClose,
}) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Détails du message</DialogTitle>
      </DialogHeader>
      {msg && (
        <div className="space-y-3 text-sm">
          {[
            ["ID Externe", msg.externalMessageId],
            ["Statut", msg.status],
            ["Direction", msg.direction],
            ["Type", msg.messageType],
            ["Date Création", fmtTimeFull(msg.createdAt)],
            ["Date Envoi", fmtTimeFull(msg.sentAt)],
            ["Date Distribution", fmtTimeFull(msg.deliveredAt)],
            ["Date Lecture", fmtTimeFull(msg.readAt)],
            ["Envoyé par", msg.sentByName || "Système"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="font-semibold text-[#111B21] min-w-[140px]">
                {label}
              </span>
              <span className="text-[#667781] break-all">{value || "N/A"}</span>
            </div>
          ))}
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// ─── Send Flow Modal ──────────────────────────────────────────────────────────

interface FlowModalProps {
  open: boolean;
  contactAddress: string;
  onClose: () => void;
  onSubmit: (token: string) => void;
  isSending: boolean;
}

export const FlowModal: React.FC<FlowModalProps> = ({
  open,
  contactAddress,
  onClose,
  onSubmit,
  isSending,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SendFlowForm>({
    resolver: zodResolver(SendFlowFormSchema),
  });

  const submit = (data: SendFlowForm) => {
    onSubmit(data.flowToken);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>Envoyer un Flow</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#667781]">
          Saisissez le token du flow à envoyer au contact
          <strong className="text-[#111B21]">{contactAddress}</strong> :
        </p>
        <form onSubmit={handleSubmit(submit)}>
          <div className="space-y-2">
            <Label>Token du flow</Label>
            <Input
              {...register("flowToken")}
              placeholder="Token du flow"
              className={errors.flowToken ? "border-red-400" : ""}
            />
            {errors.flowToken && (
              <p className="text-xs text-red-500">{errors.flowToken.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Annuler
            </Button>
            <Button
              disabled={isSending}
              className="bg-[#25D366] hover:bg-[#20BD5B] text-white"
            >
              {isSending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
