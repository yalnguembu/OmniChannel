import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiSenderDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import type {
  SearchSenderReplyConfigResponse,
  CreateSenderReplyConfigRequest,
} from "@/shared/api/generated/types.gen";
import { toast } from "sonner";

type FormData = CreateSenderReplyConfigRequest;

const emptyForm: FormData = {
  senderId: "",
  autoReplyEnabled: true,
  aiReplyEnabled: false,
  systemPrompt: "",
  autoReplyDelaySeconds: 0,
  cancelOnAgentReply: true,
  cancelOnNewInbound: true,
};

interface SenderReplyConfigFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: SearchSenderReplyConfigResponse | null;
  onSave: (data: FormData & { id?: string }) => Promise<void>;
  isSaving?: boolean;
}

export function SenderReplyConfigFormModal({
  open,
  onClose,
  editing,
  onSave,
  isSaving,
}: SenderReplyConfigFormModalProps) {
  const [form, setForm] = useState<FormData>(emptyForm);

  const { data: senders = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res) =>
      ((res?.data ?? []) as { id?: string; name?: string | null }[]).filter(
        (s) => s.id,
      ),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            senderId: editing.senderId ?? "",
            autoReplyEnabled: editing.autoReplyEnabled ?? true,
            aiReplyEnabled: editing.aiReplyEnabled ?? false,
            systemPrompt: editing.systemPrompt ?? "",
            autoReplyDelaySeconds: editing.autoReplyDelaySeconds ?? 0,
            cancelOnAgentReply: editing.cancelOnAgentReply ?? true,
            cancelOnNewInbound: editing.cancelOnNewInbound ?? true,
          }
        : { ...emptyForm },
    );
  }, [open, editing]);

  const save = async () => {
    if (!form.senderId) {
      toast.error("Le sender est requis");
      return;
    }
    if (editing?.id) {
      await onSave({ ...form, id: editing.id });
    } else {
      await onSave(form);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editing
          ? "Modifier la configuration auto-reply"
          : "Nouvelle configuration auto-reply"
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={save} loading={isSaving}>
            {editing ? "Enregistrer" : "Créer la configuration"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Select
          label="Sender (Expéditeur) *"
          value={form.senderId || ""}
          onChange={(e) => setForm((f) => ({ ...f, senderId: e.target.value }))}
          options={[
            { value: "", label: "Sélectionner un sender..." },
            ...senders.map((s) => ({
              value: s.id as string,
              label: s.name ?? "Sans nom",
            })),
          ]}
          disabled={!!editing}
        />

        {/* Auto-Reply settings */}
        <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <h3 className="text-[13px] font-semibold text-[#0D2137]">
            Auto-Réponse
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#0D2137]">Auto-reply activé</p>
              <p className="text-[12px] text-[#8BAFC0]">
                Répond automatiquement aux messages entrants
              </p>
            </div>
            <Toggle
              checked={form.autoReplyEnabled ?? true}
              onChange={(v) => setForm((f) => ({ ...f, autoReplyEnabled: v }))}
            />
          </div>

          {form.autoReplyEnabled && (
            <Input
              label="Délai avant réponse (secondes)"
              type="number"
              value={(form.autoReplyDelaySeconds ?? 0).toString()}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  autoReplyDelaySeconds: parseInt(e.target.value) || 0,
                }))
              }
            />
          )}
        </div>

        {/* AI Reply settings */}
        <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <h3 className="text-[13px] font-semibold text-[#0D2137]">
            Réponse par IA
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#0D2137]">Réponse IA activée</p>
              <p className="text-[12px] text-[#8BAFC0]">
                Utilise l'IA pour générer des réponses
              </p>
            </div>
            <Toggle
              checked={form.aiReplyEnabled ?? false}
              onChange={(v) => setForm((f) => ({ ...f, aiReplyEnabled: v }))}
            />
          </div>

          {form.aiReplyEnabled && (
            <div>
              <label className="block text-[12px] font-semibold text-[#0D2137] mb-1">
                Prompt système
              </label>
              <textarea
                className="w-full h-28 p-3 text-[13px] border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#4A7A94] bg-white"
                value={form.systemPrompt || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, systemPrompt: e.target.value }))
                }
                placeholder="Vous êtes un assistant commercial. Répondez en français..."
              />
            </div>
          )}
        </div>

        {/* Cancellation rules */}
        <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <h3 className="text-[13px] font-semibold text-[#0D2137]">
            Règles d'annulation
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#0D2137]">
                Annuler si l'agent répond
              </p>
              <p className="text-[12px] text-[#8BAFC0]">
                Interrompt l'auto-reply si un agent envoie un message
              </p>
            </div>
            <Toggle
              checked={form.cancelOnAgentReply ?? true}
              onChange={(v) =>
                setForm((f) => ({ ...f, cancelOnAgentReply: v }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#0D2137]">
                Annuler si nouveau message entrant
              </p>
              <p className="text-[12px] text-[#8BAFC0]">
                Réinitialise le délai si le client écrit à nouveau
              </p>
            </div>
            <Toggle
              checked={form.cancelOnNewInbound ?? true}
              onChange={(v) =>
                setForm((f) => ({ ...f, cancelOnNewInbound: v }))
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
