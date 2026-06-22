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
}

export const ConvDetailsModal: React.FC<ConvDetailsModalProps> = ({
  open,
  conv,
  onClose,
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

// ─── Bulk Send Modal ──────────────────────────────────────────────────────────

interface BulkModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (type: "j0" | "j3", file: File) => void;
  isSending: boolean;
}

export const BulkModal: React.FC<BulkModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSending,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BulkSendForm>({
    resolver: zodResolver(BulkSendFormSchema),
  });

  const submit = (data: BulkSendForm) => {
    const fileInput = document.getElementById(
      "bulk-file-inp",
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }
    onSubmit(data.type, file);
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
      <DialogContent className="md:max-w-2xl w-full">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl py-2">
            Campagne — Envoi en masse
          </DialogTitle>
          <DialogDescription className="text-lg">
            Sélectionnez le type de campagne et chargez le fichier (.xlsx,
            .csv).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 w-full mt-4 px-4">
          <div className="space-y-2">
            <Label className="text-base">Type de Campagne</Label>
            <select
              {...register("type")}
              className={`flex w-full rounded-md border h-12 border-input bg-transparent px-3 py-1 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.type ? "border-red-400" : ""}`}
            >
              <option value="j0">Envoi en masse (J-0)</option>
              <option value="j3">Campagne Relance (J-3)</option>
            </select>
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-base">Fichier de contacts</Label>
            <input
              type="file"
              id="bulk-file-inp"
              accept=".xlsx,.csv"
              className="flex w-full rounded-md border h-12 border-input bg-transparent px-3 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              reset();
            }}
            className="py-4 px-6 h-10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit(submit)}
            disabled={isSending}
            className="bg-[#25D366] hover:bg-[#20BD5B] text-white py-4 px-6 h-10"
          >
            {isSending ? "Envoi..." : "Lancer la campagne"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
