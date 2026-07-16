import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import {
  getApiTemplateDropdownOptions,
  getApiProductDropdownOptions,
  postApiClientSegmentSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import {
  ClientSelect,
  type SelectedClient,
} from "@/components/features/contacts/ClientSelect";
import {
  useSendTemplateToSegment,
  useSendTemplateFile,
  useSendTemplateToClient,
} from "@/hooks/useWhatsapp";

const selectCls =
  "flex w-full rounded-md border h-11 border-input bg-transparent px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

interface Option {
  id: string;
  name: string;
}

/**
 * Broadcast an approved WhatsApp template to a whole segment
 * (POST /api/WhatsApp/send/template/segment), via an uploaded recipient file
 * (POST /api/WhatsApp/send/template/file), or to a single client
 * (POST /api/WhatsApp/send/template/client).
 *
 * `defaultMode` / `defaultClient` let a caller (e.g. a conversation) open the
 * modal pre-scoped to one client.
 */
export const TemplateBroadcastModal: React.FC<{
  open: boolean;
  onClose: () => void;
  defaultMode?: "segment" | "file" | "client";
  defaultClient?: SelectedClient;
}> = ({ open, onClose, defaultMode, defaultClient }) => {
  const senders = useWhatsAppStore((s) => s.senders);
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);

  const [mode, setMode] = useState<"segment" | "file" | "client">(
    defaultMode ?? "segment",
  );
  const [templateId, setTemplateId] = useState("");
  const [senderId, setSenderId] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [productId, setProductId] = useState("");
  const [mappingOverride, setMappingOverride] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState("");

  const sendSegment = useSendTemplateToSegment();
  const sendFile = useSendTemplateFile();
  const sendClient = useSendTemplateToClient();
  const isSending =
    sendSegment.isPending || sendFile.isPending || sendClient.isPending;

  const templatesQ = useQuery({
    ...getApiTemplateDropdownOptions(),
    select: (r: unknown) =>
      ((r as { data?: Option[] })?.data ?? []) as Option[],
    enabled: open,
  });
  const segmentsQ = useQuery({
    ...postApiClientSegmentSearchOptions({
      body: { pageNumber: 1, pageSize: 100 },
    }),
    select: (r: unknown) =>
      ((r as { data?: { items?: Option[] } })?.data?.items ?? []) as Option[],
    enabled: open && mode === "segment",
  });
  const productsQ = useQuery({
    ...getApiProductDropdownOptions(),
    select: (r: unknown) =>
      ((r as { data?: Option[] })?.data ?? []) as Option[],
    enabled: open && mode === "file",
  });

  // Seed the sender from the active one when the modal opens, but keep it in
  // local state so the user can still switch back to "Par défaut".
  useEffect(() => {
    if (open) setSenderId(selectedSenderId ?? "");
  }, [open, selectedSenderId]);

  // Apply the caller-provided defaults (mode + pre-selected client) on open.
  useEffect(() => {
    if (!open) return;
    if (defaultMode) setMode(defaultMode);
    if (defaultClient) setClientId(defaultClient.id);
  }, [open, defaultMode, defaultClient]);

  const close = () => {
    setMode(defaultMode ?? "segment");
    setTemplateId("");
    setSegmentId("");
    setProductId("");
    setSenderId("");
    setFile(null);
    setMappingOverride("");
    setClientId("");
    onClose();
  };

  const canSubmit =
    !!templateId &&
    (mode === "segment"
      ? !!segmentId
      : mode === "file"
        ? !!file
        : !!clientId);

  const submit = () => {
    if (!canSubmit) return;
    if (mode === "segment") {
      sendSegment.mutate(
        { templateId, senderId: senderId || undefined, segmentId },
        { onSuccess: close },
      );
    } else if (mode === "file") {
      sendFile.mutate(
        {
          templateId,
          senderId: senderId || undefined,
          productId: productId || undefined,
          file: file!,
          mappingOverride: mappingOverride || undefined,
        },
        { onSuccess: close },
      );
    } else {
      // Client mode: addresses a single client by id.
      sendClient.mutate(
        { templateId, senderId: senderId || undefined, clientId },
        { onSuccess: close },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="md:max-w-xl w-full">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl py-1">
            Diffusion d'un template
          </DialogTitle>
          <DialogDescription>
            Envoyez un template WhatsApp approuvé à un segment entier, à partir
            d'un fichier de destinataires ou à un client précis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 w-full mt-2 px-4">
          {/* Mode */}
          <div className="flex gap-2">
            {(["segment", "file", "client"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  mode === m
                    ? "border-[#25D366] bg-[#25D366]/10 font-medium text-[#0D2137]"
                    : "border-input text-[#667781] hover:bg-muted"
                }`}
              >
                {m === "segment"
                  ? "Vers un segment"
                  : m === "file"
                    ? "Depuis un fichier"
                    : "Vers un client"}
              </button>
            ))}
          </div>

          {/* Template */}
          <div className="space-y-1.5">
            <Label>Template</Label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className={selectCls}
            >
              <option value="">Choisir un template…</option>
              {templatesQ.data?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sender */}
          <div className="space-y-1.5">
            <Label>Expéditeur</Label>
            <select
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className={selectCls}
            >
              <option value="">Par défaut</option>
              {senders.map((s: { id: string; senderName: string }) => (
                <option key={s.id} value={s.id}>
                  {s.senderName}
                </option>
              ))}
            </select>
          </div>

          {mode === "segment" ? (
            <div className="space-y-1.5">
              <Label>Segment</Label>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className={selectCls}
              >
                <option value="">Choisir un segment…</option>
                {segmentsQ.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : mode === "client" ? (
            <div className="space-y-1.5">
              <Label>Client</Label>
              <ClientSelect
                value={clientId}
                onChange={(id) => setClientId(id)}
                initialClient={defaultClient}
              />
              <p className="text-xs text-[#667781]">
                Recherchez le client par nom, téléphone ou email.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Produit</Label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Aucun</option>
                  {productsQ.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Fichier de destinataires (.xlsx, .csv)</Label>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className={selectCls + " py-2"}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mapping (optionnel)</Label>
                <Input
                  value={mappingOverride}
                  onChange={(e) => setMappingOverride(e.target.value)}
                  placeholder="JSON de correspondance des colonnes…"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 px-4 pb-4">
          <Button variant="outline" onClick={close} className="h-10 px-6">
            Annuler
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit || isSending}
            className="h-10 bg-[#25D366] px-6 text-white hover:bg-[#20BD5B]"
          >
            {isSending ? "Envoi…" : "Lancer la diffusion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
